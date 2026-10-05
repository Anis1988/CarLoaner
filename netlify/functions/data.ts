import { json } from '../lib/http';
import { readData } from '../lib/store';

export const config = { path: '/api/data' };

// GET /api/data -> { shop, cars, sample } (public)
export default async (): Promise<Response> => json(await readData(), 200, { 'Cache-Control': 'public, max-age=30' });
