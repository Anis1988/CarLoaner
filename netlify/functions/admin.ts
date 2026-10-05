import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { json, recordFail, sameOrigin, tooManyFails } from '../lib/http';
import { checkSetupCode, hasPassword, login, passwordProblem, setPassword, setupCode, validToken } from '../lib/auth';
import { photoStore, readData, writeData } from '../lib/store';
import { SEED } from '../lib/seed';

export const config = { path: '/api/admin' };

const text = (max: number) => z.string().max(max).default('');
const CarIn = z.object({
  id: z.string().regex(/^[\w-]{1,60}$/).optional(),
  name: z.string().trim().min(1).max(60),
  year: z.number().int().min(1980).max(2100),
  category: z.enum(['citadine', 'berline', 'suv', 'utilitaire']),
  transmission: z.enum(['manual', 'auto']),
  fuel: z.enum(['essence', 'diesel', 'gpl']),
  seats: z.number().int().min(1).max(20),
  ac: z.boolean(),
  pricePerDay: z.number().min(0).max(10_000_000),
  priceWeekDay: z.number().min(0).max(10_000_000).optional(),
  deposit: z.number().min(0).max(100_000_000),
  status: z.enum(['available', 'rented', 'maintenance']),
  availableFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  conditions: text(2000),
  issues: text(2000),
  conditionsAr: z.string().max(2000).optional(),
  issuesAr: z.string().max(2000).optional(),
  photos: z.array(z.string().regex(/^\/(cars\/[\w-]+\.svg|api\/photo\?id=[\w-]+)$/)).max(10),
});
/** Optional https link (empty allowed). */
const link = z.union([z.literal(''), z.string().trim().max(500).regex(/^https:\/\/[^\s<>"]+$/, 'Le lien doit commencer par https://')]).optional();

const ShopIn = z.object({
  name: z.string().trim().min(1).max(80),
  city: text(60),
  address: text(200),
  phone: text(40),
  whatsapp: z.string().regex(/^\d{0,15}$/).default(''),
  hours: text(200),
  rules: text(2000),
  nameAr: z.string().max(80).optional(),
  cityAr: z.string().max(60).optional(),
  addressAr: z.string().max(200).optional(),
  hoursAr: z.string().max(200).optional(),
  rulesAr: z.string().max(2000).optional(),
  heroTitle: z.string().max(120).optional(),
  heroTitleAr: z.string().max(120).optional(),
  heroSub: z.string().max(400).optional(),
  heroSubAr: z.string().max(400).optional(),
  logo: z.string().regex(/^\/api\/photo\?id=[\w-]+$/).optional(),
  mapsUrl: link,
  email: z.union([z.literal(''), z.string().trim().email().max(120)]).optional(),
  facebook: link,
  instagram: link,
});

const Pw = z.string().max(200);
const Body = z.discriminatedUnion('action', [
  z.object({ action: z.literal('status') }),
  z.object({ action: z.literal('setup'), code: Pw, password: Pw }),
  z.object({ action: z.literal('login'), password: Pw }),
  z.object({ action: z.literal('changePassword'), current: Pw, password: Pw }),
  z.object({ action: z.literal('saveCar'), car: CarIn }),
  z.object({ action: z.literal('deleteCar'), id: z.string().max(60) }),
  z.object({ action: z.literal('saveShop'), shop: ShopIn }),
  z.object({ action: z.literal('uploadPhoto'), dataUrl: z.string().max(6_000_000) }),
  z.object({ action: z.literal('addSamples') }),
  z.object({ action: z.literal('removeSamples') }),
]);

const photoId = (url: string) => url.match(/id=([\w-]+)/)?.[1];

/**
 * Owner area. status / setup / login work without a session; everything else needs the session token
 * (x-owner-token header) returned by setup or login.
 */
export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!sameOrigin(req)) return json({ error: 'Origine refusée.' }, 403);
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (e) {
    return json({ error: `Données invalides : ${e instanceof Error ? e.message.slice(0, 300) : e}` }, 400);
  }

  if (body.action === 'status') return json({ hasPassword: await hasPassword(), setupReady: !!setupCode() });

  if (body.action === 'setup' || body.action === 'login' || body.action === 'changePassword') {
    const blocked = await tooManyFails(req);
    if (blocked) return blocked;
  }
  if (body.action === 'setup') {
    // First password, or a new one when forgotten: needs the setup code from the person who set up the site.
    if (!setupCode()) return json({ error: "Le code d'installation n'est pas configuré (OWNER_SETUP_CODE dans Netlify)." }, 503);
    if (!checkSetupCode(body.code)) {
      await recordFail(req);
      return json({ error: "Code d'installation incorrect." }, 401);
    }
    const bad = passwordProblem(body.password);
    if (bad) return json({ error: bad }, 400);
    return json({ token: await setPassword(body.password) });
  }
  if (body.action === 'login') {
    const t = await login(body.password);
    if (!t) {
      await recordFail(req);
      return json({ error: (await hasPassword()) ? 'Mot de passe incorrect.' : "Aucun mot de passe n'est encore créé." }, 401);
    }
    return json({ token: t });
  }
  if (!(await validToken(req.headers.get('x-owner-token')))) return json({ error: 'Session expirée. Reconnectez-vous.', relogin: true }, 401);

  if (body.action === 'changePassword') {
    if (!(await login(body.current))) {
      await recordFail(req);
      return json({ error: 'Mot de passe actuel incorrect.' }, 401);
    }
    const bad = passwordProblem(body.password);
    if (bad) return json({ error: bad }, 400);
    return json({ token: await setPassword(body.password) });
  }

  if (body.action === 'uploadPhoto') {
    const m = body.dataUrl.match(/^data:image\/(jpeg|png);base64,([A-Za-z0-9+/=]+)$/);
    if (!m) return json({ error: 'Image JPEG ou PNG attendue.' }, 400);
    const bytes = Buffer.from(m[2], 'base64');
    if (bytes.length > 4_000_000) return json({ error: 'Photo trop grande.' }, 413);
    const id = randomBytes(9).toString('base64url');
    await photoStore().set(id, new Uint8Array(bytes).buffer, { metadata: { type: `image/${m[1]}` } });
    return json({ url: `/api/photo?id=${id}` });
  }

  const { sample, ...data } = await readData();
  void sample;
  if (body.action === 'saveShop') {
    // A replaced logo is deleted from storage.
    const oldLogo = data.shop.logo && photoId(data.shop.logo);
    if (oldLogo && data.shop.logo !== body.shop.logo) await photoStore().delete(oldLogo);
    data.shop = body.shop;
  } else if (body.action === 'saveCar') {
    const c = body.car;
    const id = c.id ?? `${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'voiture'}-${randomBytes(3).toString('hex')}`;
    const car = { ...c, id, availableFrom: c.status === 'available' ? undefined : c.availableFrom, updatedAt: new Date().toISOString() };
    const i = data.cars.findIndex((x) => x.id === id);
    if (i >= 0) {
      // Photos removed from the car are deleted from storage.
      for (const old of data.cars[i].photos) if (!car.photos.includes(old) && photoId(old)) await photoStore().delete(photoId(old)!);
      data.cars[i] = car;
    } else data.cars.unshift(car);
  } else if (body.action === 'addSamples') {
    // Testing: add the example cars that are not on the site yet (the owner's own cars are kept).
    const have = new Set(data.cars.map((c) => c.id));
    data.cars.push(...SEED.cars.filter((c) => !have.has(c.id)));
  } else if (body.action === 'removeSamples') {
    // Before going live: remove every example car still on the site (cars the owner edited count as theirs).
    const sample = new Set(SEED.cars.map((c) => c.id));
    data.cars = data.cars.filter((c) => !sample.has(c.id) || c.photos.some((p) => p.startsWith('/api/photo')));
  } else if (body.action === 'deleteCar') {
    const gone = data.cars.find((x) => x.id === body.id);
    if (!gone) return json({ error: 'Voiture introuvable.' }, 404);
    for (const p of gone.photos) if (photoId(p)) await photoStore().delete(photoId(p)!);
    data.cars = data.cars.filter((x) => x.id !== body.id);
  }
  await writeData(data);
  return json({ ...data, sample: false });
};
