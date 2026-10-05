import { photoStore } from '../lib/store';

export const config = { path: '/api/photo' };

// GET /api/photo?id=... -> a car photo uploaded by the owner (public, cached for a long time: ids never change)
export default async (req: Request): Promise<Response> => {
  const id = new URL(req.url).searchParams.get('id') ?? '';
  if (!/^[\w-]{6,40}$/.test(id)) return new Response('Bad id', { status: 400 });
  const data = await photoStore().get(id, { type: 'arrayBuffer' });
  if (!data) return new Response('Not found', { status: 404 });
  return new Response(data, { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable' } });
};
