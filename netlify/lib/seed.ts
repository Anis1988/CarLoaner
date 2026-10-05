import type { Car, SiteData } from '../../src/lib/types';

/** Example content shown until the owner saves their own (made-up agency, sample cars). */
const inDays = (n: number) => new Date(Date.now() + n * 86400_000).toISOString().slice(0, 10);
const now = new Date().toISOString();
const car = (c: Omit<Car, 'updatedAt'>): Car => ({ ...c, updatedAt: now });

/** Models commonly rented in Algeria: [name, category, picture shape, seats, fuels, base price DA/day]. */
const MODELS: [string, Car['category'], 'sedan' | 'hatch' | 'suv' | 'van', number, Car['fuel'][], number][] = [
  ['Renault Clio 4', 'citadine', 'hatch', 5, ['essence', 'diesel'], 4500], ['Renault Clio 5', 'citadine', 'hatch', 5, ['essence', 'diesel'], 5500],
  ['Renault Symbol', 'berline', 'sedan', 5, ['essence', 'gpl'], 4500], ['Dacia Logan', 'berline', 'sedan', 5, ['essence', 'diesel'], 4500],
  ['Dacia Sandero', 'citadine', 'hatch', 5, ['essence', 'diesel'], 4500], ['Dacia Sandero Stepway', 'citadine', 'hatch', 5, ['essence'], 5500],
  ['Dacia Duster', 'suv', 'suv', 5, ['diesel'], 7500], ['Peugeot 208', 'citadine', 'hatch', 5, ['essence', 'diesel'], 5000],
  ['Peugeot 301', 'berline', 'sedan', 5, ['essence', 'diesel'], 5000], ['Peugeot 308', 'berline', 'hatch', 5, ['diesel'], 6500],
  ['Peugeot 2008', 'suv', 'suv', 5, ['essence', 'diesel'], 7500], ['Hyundai i10', 'citadine', 'hatch', 4, ['essence'], 3500],
  ['Hyundai i20', 'citadine', 'hatch', 5, ['essence'], 4500], ['Hyundai Accent', 'berline', 'sedan', 5, ['essence', 'diesel'], 5000],
  ['Hyundai Elantra', 'berline', 'sedan', 5, ['essence'], 7000], ['Hyundai Creta', 'suv', 'suv', 5, ['essence'], 8000],
  ['Hyundai Tucson', 'suv', 'suv', 5, ['diesel'], 9000], ['Kia Picanto', 'citadine', 'hatch', 4, ['essence'], 3500],
  ['Kia Rio', 'citadine', 'sedan', 5, ['essence'], 4500], ['Kia Sportage', 'suv', 'suv', 5, ['diesel'], 9500],
  ['Chevrolet Sail', 'berline', 'sedan', 5, ['essence'], 4000], ['Chevrolet Aveo', 'citadine', 'hatch', 5, ['essence'], 4000],
  ['Toyota Yaris', 'citadine', 'hatch', 5, ['essence'], 5000], ['Toyota Corolla', 'berline', 'sedan', 5, ['essence'], 7500],
  ['Toyota Hilux', 'utilitaire', 'suv', 5, ['diesel'], 11000], ['Volkswagen Polo', 'citadine', 'hatch', 5, ['essence', 'diesel'], 5500],
  ['Volkswagen Golf 7', 'berline', 'hatch', 5, ['diesel'], 7500], ['Volkswagen Caddy', 'utilitaire', 'van', 5, ['diesel'], 7000],
  ['Skoda Octavia', 'berline', 'sedan', 5, ['diesel'], 7500], ['Seat Ibiza', 'citadine', 'hatch', 5, ['essence', 'diesel'], 5000],
  ['Seat Leon', 'berline', 'hatch', 5, ['diesel'], 7000], ['Fiat Tipo', 'berline', 'sedan', 5, ['essence', 'diesel'], 5500],
  ['Fiat Doblo', 'utilitaire', 'van', 5, ['diesel'], 6500], ['Suzuki Swift', 'citadine', 'hatch', 5, ['essence'], 4500],
  ['Suzuki Celerio', 'citadine', 'hatch', 4, ['essence'], 3500], ['Nissan Qashqai', 'suv', 'suv', 5, ['diesel'], 9000],
  ['Chery Tiggo 4 Pro', 'suv', 'suv', 5, ['essence'], 8000], ['Geely Coolray', 'suv', 'suv', 5, ['essence'], 8500],
  ['Renault Kangoo', 'utilitaire', 'van', 2, ['diesel'], 6000], ['Renault Master', 'utilitaire', 'van', 3, ['diesel'], 10000],
];
const COLORS = ['red', 'white', 'silver', 'black', 'blue', 'grey', 'green', 'orange'];
const ISSUES = ['', '', '', 'Petite rayure sur le pare-chocs', 'Léger choc sur la portière gauche', 'Radio sans Bluetooth', 'Climatisation un peu faible', 'Siège arrière légèrement taché'];
const CONDITIONS = [
  'Kilométrage limité à 300 km/jour', 'Kilométrage illimité', 'Rendre avec le même niveau de carburant',
  'Interdit de quitter la wilaya sans accord', 'Conducteur de 25 ans minimum', 'Non-fumeur',
];

/** A large made-up fleet so the site can be tried with many cars. Same every time (no randomness between visits). */
function generatedFleet(n: number): Car[] {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
  const out: Car[] = [];
  for (let i = 0; i < n; i++) {
    const [name, category, shape, seats, fuels, base] = pick(MODELS);
    const year = 2015 + Math.floor(rnd() * 10);
    const price = Math.round((base + (year - 2019) * 250 + (rnd() - 0.5) * 1000) / 500) * 500;
    const auto = category === 'suv' ? rnd() < 0.6 : rnd() < 0.2;
    const r = rnd();
    const status: Car['status'] = r < 0.68 ? 'available' : r < 0.9 ? 'rented' : 'maintenance';
    out.push(car({
      id: `exemple-${i + 1}`, name, year, category, transmission: auto ? 'auto' : 'manual', fuel: pick(fuels), seats, ac: rnd() < 0.9,
      pricePerDay: Math.max(3000, price), priceWeekDay: rnd() < 0.5 ? Math.max(2500, price - 500) : undefined,
      deposit: Math.round((price * 6) / 5000) * 5000,
      status, availableFrom: status === 'available' ? undefined : inDays(1 + Math.floor(rnd() * 9)),
      conditions: [pick(CONDITIONS.slice(0, 2)), pick(CONDITIONS.slice(2))].join('\n'), issues: pick(ISSUES),
      photos: [`/cars/${shape}-${pick(COLORS)}.svg`],
    }));
  }
  return out;
}

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
    car({ id: 'symbol-2019', name: 'Renault Symbol', year: 2019, category: 'berline', transmission: 'manual', fuel: 'essence', seats: 5, ac: true, pricePerDay: 4500, priceWeekDay: 4000, deposit: 30000, status: 'available', conditions: 'Kilométrage limité à 300 km/jour\nRendre avec le même niveau de carburant', issues: 'Petite rayure sur la porte arrière droite', photos: ['/cars/symbol.svg', '/cars/symbol-front.svg', '/cars/symbol-rear.svg', '/cars/symbol-interior.svg'] }),
    car({ id: 'logan-2020', name: 'Dacia Logan', year: 2020, category: 'berline', transmission: 'manual', fuel: 'diesel', seats: 5, ac: true, pricePerDay: 5000, priceWeekDay: 4500, deposit: 30000, status: 'available', conditions: 'Kilométrage illimité\nInterdit de quitter la wilaya sans accord', issues: '', photos: ['/cars/logan.svg'] }),
    car({ id: 'accent-2018', name: 'Hyundai Accent', year: 2018, category: 'berline', transmission: 'auto', fuel: 'essence', seats: 5, ac: true, pricePerDay: 5500, deposit: 40000, status: 'rented', availableFrom: inDays(3), conditions: 'Boîte automatique\nKilométrage limité à 250 km/jour', issues: 'Climatisation un peu faible', photos: ['/cars/accent.svg'] }),
    car({ id: 'picanto-2021', name: 'Kia Picanto', year: 2021, category: 'citadine', transmission: 'manual', fuel: 'essence', seats: 4, ac: true, pricePerDay: 3500, priceWeekDay: 3200, deposit: 20000, status: 'available', conditions: 'Idéale pour la ville\nKilométrage limité à 200 km/jour', issues: '', photos: ['/cars/picanto.svg'] }),
    car({ id: '208-2022', name: 'Peugeot 208', year: 2022, category: 'citadine', transmission: 'manual', fuel: 'diesel', seats: 5, ac: true, pricePerDay: 5000, deposit: 35000, status: 'available', conditions: 'Kilométrage limité à 300 km/jour', issues: '', photos: ['/cars/p208.svg'] }),
    car({ id: 'tucson-2020', name: 'Hyundai Tucson', year: 2020, category: 'suv', transmission: 'auto', fuel: 'diesel', seats: 5, ac: true, pricePerDay: 9000, priceWeekDay: 8000, deposit: 60000, status: 'maintenance', availableFrom: inDays(5), conditions: 'Conducteur de 28 ans minimum\nKilométrage limité à 300 km/jour', issues: 'En révision (vidange + plaquettes)', photos: ['/cars/tucson.svg'] }),
    car({ id: 'kangoo-2019', name: 'Renault Kangoo', year: 2019, category: 'utilitaire', transmission: 'manual', fuel: 'diesel', seats: 2, ac: false, pricePerDay: 6000, deposit: 40000, status: 'available', conditions: 'Utilitaire : déménagement, marchandises\nCharge maximum 650 kg', issues: 'Pas de climatisation', photos: ['/cars/kangoo.svg'] }),
    ...generatedFleet(100),
  ],
};
