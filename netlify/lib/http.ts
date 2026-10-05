import { dataStore } from './store';

export function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra } });
}

export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
}

const ipKey = (req: Request) => `fails/${(req.headers.get('x-nf-client-connection-ip') ?? req.headers.get('x-forwarded-for') ?? 'local').replace(/[^\w.:-]/g, '_')}`;
const WINDOW = 15 * 60_000;

/** Brute-force guard: 8 wrong passwords or setup codes from one address in 15 minutes -> blocked for 15 minutes. */
export async function tooManyFails(req: Request): Promise<Response | null> {
  const fails = (((await dataStore().get(ipKey(req), { type: 'json' })) as number[] | null) ?? []).filter((t) => t > Date.now() - WINDOW);
  return fails.length >= 8 ? json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' }, 429) : null;
}

export async function recordFail(req: Request): Promise<void> {
  const store = dataStore();
  const fails = (((await store.get(ipKey(req), { type: 'json' })) as number[] | null) ?? []).filter((t) => t > Date.now() - WINDOW);
  await store.setJSON(ipKey(req), [...fails, Date.now()]);
}
