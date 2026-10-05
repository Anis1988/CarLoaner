import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { dataStore } from './store';

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

/**
 * Owner login.
 * - The owner chooses their own password. Only a salted scrypt hash is stored (Netlify Blobs), so nobody can read it.
 * - The setup code (OWNER_SETUP_CODE in Netlify, given to the owner once) is needed to set the first password,
 *   and again to choose a new one if they forget it.
 * - A successful login returns a signed session token (30 days). Changing the password ends all sessions.
 */
interface AuthRecord {
  hash: string; // base64
  salt: string; // base64
  secret: string; // base64, signs session tokens
  version: number; // bumped on every password change
  setAt: string;
}

const KEY = 'auth';
const DAYS = 30;
export const setupCode = () => process.env.OWNER_SETUP_CODE || process.env.OWNER_PASSWORD || '';

const read = async () => (await dataStore().get(KEY, { type: 'json' })) as AuthRecord | null;
export const hasPassword = async () => !!(await read());

const same = (a: string | Buffer, b: string | Buffer) => {
  const x = Buffer.isBuffer(a) ? a : Buffer.from(a);
  const y = Buffer.isBuffer(b) ? b : Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const checkSetupCode = (code: string) => !!setupCode() && same(code, setupCode());

/** Strong enough to guess-proof a small business site: 8+ characters. */
export function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return 'Le mot de passe doit avoir au moins 8 caractères.';
  if (pw.length > 200) return 'Mot de passe trop long.';
  return null;
}

export async function setPassword(pw: string): Promise<string> {
  const old = await read();
  const salt = randomBytes(16);
  const hash = await scrypt(pw, salt, 64);
  const rec: AuthRecord = {
    hash: hash.toString('base64'), salt: salt.toString('base64'), secret: randomBytes(32).toString('base64'),
    version: (old?.version ?? 0) + 1, setAt: new Date().toISOString(),
  };
  await dataStore().setJSON(KEY, rec);
  return token(rec);
}

export async function login(pw: string): Promise<string | null> {
  const rec = await read();
  if (!rec) return null;
  const hash = await scrypt(pw, Buffer.from(rec.salt, 'base64'), 64);
  return same(hash, Buffer.from(rec.hash, 'base64')) ? token(rec) : null;
}

function token(rec: AuthRecord): string {
  const exp = Date.now() + DAYS * 86400_000;
  const body = `${exp}.${rec.version}`;
  return `${body}.${createHmac('sha256', Buffer.from(rec.secret, 'base64')).update(body).digest('base64url')}`;
}

export async function validToken(t: string | null): Promise<boolean> {
  const rec = await read();
  if (!rec || !t) return false;
  const [exp, ver, sig] = t.split('.');
  if (!exp || !ver || !sig || Number(exp) < Date.now() || Number(ver) !== rec.version) return false;
  return same(sig, createHmac('sha256', Buffer.from(rec.secret, 'base64')).update(`${exp}.${ver}`).digest('base64url'));
}
