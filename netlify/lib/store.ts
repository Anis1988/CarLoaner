import { getStore } from '@netlify/blobs';
import type { SiteData } from '../../src/lib/types';
import { SEED } from './seed';

export const dataStore = () => getStore('carloaner');
export const photoStore = () => getStore('carloaner-photos');

/** The owner's saved data, or the example content until they save something. */
export async function readData(): Promise<SiteData & { sample: boolean }> {
  const d = (await dataStore().get('site', { type: 'json' })) as SiteData | null;
  return d ? { ...d, sample: false } : { ...SEED, sample: true };
}

export async function writeData(d: SiteData): Promise<void> {
  await dataStore().setJSON('site', d);
}
