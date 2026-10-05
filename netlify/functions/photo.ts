import { photoStore } from '../lib/store';

export const config = { path: '/api/photo' };

// GET /api/photo?id=... -> a car photo uploaded by the owner (public, cached for a long time: ids never change)
export default async (req: Request): Promise<Response> => {
  const id = new URL(req.url).searchParams.get('id') ?? '';
  if (!/^[\w-]{6,40}$/.test(id)) return new Response('Bad id', { status: 400 });
  const got = await photoStore().getWithMetadata(id, { type: 'arrayBuffer' });
  if (!got) return new Response('Not found', { status: 404 });
  const type = got.metadata?.type === 'image/png' ? 'image/png' : 'image/jpeg';
  return new Response(got.data, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable' } });
};
