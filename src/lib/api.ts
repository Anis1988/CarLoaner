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
  if (!res.ok || data === null) throw new Error(data?.error ?? (res.status === 404 || res.ok ? 'Serveur indisponible (les fonctions ne tournent que sur Netlify).' : `Erreur ${res.status}`));
  return data as T;
}

export const getData = () => req<Data>('/api/data');

const TOKEN = 'cl.ownerToken';
/** The owner's session (30 days on this device). The password itself is never stored on the phone. */
export const session = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN) ?? '';
    } catch {
      return '';
    }
  },
  set: (t: string) => {
    try {
      localStorage.setItem(TOKEN, t);
    } catch {
      /* ignore */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN);
    } catch {
      /* ignore */
    }
  },
};

export class AuthError extends Error {}

async function admin<T>(body: unknown): Promise<T> {
  try {
    return await req<T>('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Owner-Token': session.get() }, body: JSON.stringify(body) });
  } catch (e) {
    if (e instanceof Error && /Session expirée/.test(e.message)) {
      session.clear();
      throw new AuthError(e.message);
    }
    throw e;
  }
}

export const adminApi = {
  status: () => admin<{ hasPassword: boolean; setupReady: boolean }>({ action: 'status' }),
  setup: (code: string, password: string) => admin<{ token: string }>({ action: 'setup', code, password }),
  login: (password: string) => admin<{ token: string }>({ action: 'login', password }),
  changePassword: (current: string, password: string) => admin<{ token: string }>({ action: 'changePassword', current, password }),
  saveCar: (car: Partial<Car>) => admin<Data>({ action: 'saveCar', car }),
  deleteCar: (id: string) => admin<Data>({ action: 'deleteCar', id }),
  saveShop: (shop: Shop) => admin<Data>({ action: 'saveShop', shop }),
  uploadPhoto: (dataUrl: string) => admin<{ url: string }>({ action: 'uploadPhoto', dataUrl }),
  addSamples: () => admin<Data>({ action: 'addSamples' }),
  removeSamples: () => admin<Data>({ action: 'removeSamples' }),
};

/**
 * Prepares a phone photo for upload: turned the right way up (phones store sideways photos with a "rotate" tag),
 * at most 1600 px on the long side, good-quality JPEG (about 300-600 KB).
 */
export async function shrinkPhoto(file: File): Promise<string> {
  const img = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  img.close();
  return canvas.toDataURL('image/jpeg', 0.88);
}

/** Prepares a logo: at most 512 px, PNG so a transparent background stays transparent. */
export async function shrinkLogo(file: File): Promise<string> {
  const img = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, 512 / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  img.close();
  return canvas.toDataURL('image/png');
}
