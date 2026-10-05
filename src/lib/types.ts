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
  conditionsAr?: string; // Arabic versions (optional): shown to Arabic visitors when filled in
  issuesAr?: string;
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
  // Arabic versions (optional): shown to Arabic visitors when filled in, otherwise the French text is shown.
  nameAr?: string;
  cityAr?: string;
  addressAr?: string;
  hoursAr?: string;
  rulesAr?: string;
  // The owner's own site text and links (all optional; empty = the default text / hidden).
  heroTitle?: string;
  heroTitleAr?: string;
  heroSub?: string;
  heroSubAr?: string;
  logo?: string; // /api/photo?id=...
  mapsUrl?: string; // a Google Maps link to the agency
  email?: string;
  facebook?: string; // full link
  instagram?: string; // full link
}

export interface SiteData {
  shop: Shop;
  cars: Car[];
}
