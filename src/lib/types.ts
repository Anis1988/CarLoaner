/** Shared by the website and the Netlify functions. */

export type Status = 'available' | 'rented' | 'maintenance';
export type Category = 'citadine' | 'berline' | 'suv' | 'utilitaire';

export interface Car {
  id: string;
  name: string; // e.g. "Renault Symbol"
  year: number;
  category: Category;
  transmission: 'manual' | 'auto';
  fuel: 'essence' | 'diesel' | 'gpl';
  seats: number;
  ac: boolean;
  pricePerDay: number; // DA
  priceWeekDay?: number; // DA per day when renting 7 days or more (optional)
  deposit: number; // DA, the "caution"
  status: Status;
  availableFrom?: string; // YYYY-MM-DD, when rented or in the garage
  conditions: string; // one per line, e.g. "Kilométrage limité à 300 km/jour"
  issues: string; // known issues, one per line, e.g. "Petite rayure porte arrière"
  photos: string[]; // URLs (/cars/x.svg or /api/photo?id=...)
  updatedAt: string;
}

export interface Shop {
  name: string;
  city: string;
  address: string;
  phone: string; // e.g. 0555 12 34 56
  whatsapp: string; // international, digits only, e.g. 213555123456
  hours: string;
  rules: string; // general rules, one per line
}

export interface SiteData {
  shop: Shop;
  cars: Car[];
}
