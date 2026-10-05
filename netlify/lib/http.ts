import { timingSafeEqual } from 'node:crypto';
import { dataStore } from './store';

export function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra } });
}

const ip = (req: Request) => req.headers.get('x-nf-client-connection-ip') ?? req.headers.get('x-forwarded-for') ?? 'local';

/**
 * Owner check: the x-owner-password header must equal OWNER_PASSWORD (set in Netlify).
 * After 8 wrong passwords from one address in 15 minutes, that address is blocked for 15 minutes.
 */
export async function checkOwner(req: Request): Promise<Response | null> {
  const pass = process.env.OWNER_PASSWORD;
  if (!pass) return json({ error: "Le mot de passe propriétaire n'est pas configuré (OWNER_PASSWORD dans Netlify)." }, 503);
  const origin = req.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(req.url).host) return json({ error: 'Origine refusée.' }, 403);
  const key = `fails/${ip(req).replace(/[^\w.:-]/g, '_')}`;
  const store = dataStore();
  const since = Date.now() - 15 * 60_000;
  const fails = (((await store.get(key, { type: 'json' })) as number[] | null) ?? []).filter((t) => t > since);
  if (fails.length >= 8) return json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' }, 429);
  const given = Buffer.from(req.headers.get('x-owner-password') ?? '');
  const real = Buffer.from(pass);
  if (given.length === real.length && timingSafeEqual(given, real)) return null;
  await store.setJSON(key, [...fails, Date.now()]);
  return json({ error: 'Mot de passe incorrect.' }, 401);
}
