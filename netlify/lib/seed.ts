import type { Car, SiteData } from '../../src/lib/types';

/** Example content shown until the owner saves their own (made-up agency, sample cars). */
const inDays = (n: number) => new Date(Date.now() + n * 86400_000).toISOString().slice(0, 10);
const now = new Date().toISOString();
const car = (c: Omit<Car, 'updatedAt'>): Car => ({ ...c, updatedAt: now });

export const SEED: SiteData = {
  shop: {
    name: 'Auto Location El Bahia',
    city: 'Oran',
    address: '12 Boulevard de la Soummam, Oran',
    phone: '0555 12 34 56',
    whatsapp: '213555123456',
    hours: 'Samedi – Jeudi : 8h – 19h · Vendredi : fermé',
    rules: [
      'Âge minimum : 25 ans',
      'Permis de conduire de plus de 2 ans',
      "Carte d'identité ou passeport + permis originaux",
      'Paiement en espèces à la remise des clés',
      'Caution rendue au retour du véhicule',
    ].join('\n'),
  },
  cars: [
    car({ id: 'symbol-2019', name: 'Renault Symbol', year: 2019, category: 'berline', transmission: 'manual', fuel: 'essence', seats: 5, ac: true, pricePerDay: 4500, priceWeekDay: 4000, deposit: 30000, status: 'available', conditions: 'Kilométrage limité à 300 km/jour\nRendre avec le même niveau de carburant', issues: 'Petite rayure sur la porte arrière droite', photos: ['/cars/symbol.svg'] }),
    car({ id: 'logan-2020', name: 'Dacia Logan', year: 2020, category: 'berline', transmission: 'manual', fuel: 'diesel', seats: 5, ac: true, pricePerDay: 5000, priceWeekDay: 4500, deposit: 30000, status: 'available', conditions: 'Kilométrage illimité\nInterdit de quitter la wilaya sans accord', issues: '', photos: ['/cars/logan.svg'] }),
    car({ id: 'accent-2018', name: 'Hyundai Accent', year: 2018, category: 'berline', transmission: 'auto', fuel: 'essence', seats: 5, ac: true, pricePerDay: 5500, deposit: 40000, status: 'rented', availableFrom: inDays(3), conditions: 'Boîte automatique\nKilométrage limité à 250 km/jour', issues: 'Climatisation un peu faible', photos: ['/cars/accent.svg'] }),
    car({ id: 'picanto-2021', name: 'Kia Picanto', year: 2021, category: 'citadine', transmission: 'manual', fuel: 'essence', seats: 4, ac: true, pricePerDay: 3500, priceWeekDay: 3200, deposit: 20000, status: 'available', conditions: 'Idéale pour la ville\nKilométrage limité à 200 km/jour', issues: '', photos: ['/cars/picanto.svg'] }),
    car({ id: '208-2022', name: 'Peugeot 208', year: 2022, category: 'citadine', transmission: 'manual', fuel: 'diesel', seats: 5, ac: true, pricePerDay: 5000, deposit: 35000, status: 'available', conditions: 'Kilométrage limité à 300 km/jour', issues: '', photos: ['/cars/p208.svg'] }),
    car({ id: 'tucson-2020', name: 'Hyundai Tucson', year: 2020, category: 'suv', transmission: 'auto', fuel: 'diesel', seats: 5, ac: true, pricePerDay: 9000, priceWeekDay: 8000, deposit: 60000, status: 'maintenance', availableFrom: inDays(5), conditions: 'Conducteur de 28 ans minimum\nKilométrage limité à 300 km/jour', issues: 'En révision (vidange + plaquettes)', photos: ['/cars/tucson.svg'] }),
    car({ id: 'kangoo-2019', name: 'Renault Kangoo', year: 2019, category: 'utilitaire', transmission: 'manual', fuel: 'diesel', seats: 2, ac: false, pricePerDay: 6000, deposit: 40000, status: 'available', conditions: 'Utilitaire : déménagement, marchandises\nCharge maximum 650 kg', issues: 'Pas de climatisation', photos: ['/cars/kangoo.svg'] }),
  ],
};
