import type { Car, Shop, SiteData } from './types';

export type Data = SiteData & { sample: boolean };

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch {
    throw new Error('Connexion impossible. Vérifiez internet.');
  }
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* not JSON */
  }
  if (!res.ok || data === null) throw new Error(data?.error ?? (res.status === 404 ? 'Serveur indisponible (les fonctions ne tournent que sur Netlify).' : `Erreur ${res.status}`));
  return data as T;
}

export const getData = () => req<Data>('/api/data');

const PASS = 'cl.ownerPass';
export const ownerPass = {
  get: () => sessionStorage.getItem(PASS) ?? '',
  set: (p: string) => sessionStorage.setItem(PASS, p),
  clear: () => sessionStorage.removeItem(PASS),
};

const admin = <T>(body: unknown, pass = ownerPass.get()) =>
  req<T>('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Owner-Password': pass }, body: JSON.stringify(body) });

export const adminApi = {
  login: (pass: string) => admin<{ ok: boolean }>({ action: 'login' }, pass),
  saveCar: (car: Partial<Car>) => admin<Data>({ action: 'saveCar', car }),
  deleteCar: (id: string) => admin<Data>({ action: 'deleteCar', id }),
  saveShop: (shop: Shop) => admin<Data>({ action: 'saveShop', shop }),
  uploadPhoto: (dataUrl: string) => admin<{ url: string }>({ action: 'uploadPhoto', dataUrl }),
};

/** Shrinks a phone photo to max 1280 px JPEG (about 150-300 KB) before uploading. */
export async function shrinkPhoto(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}
