import { useEffect, useState } from 'react';

export type Lang = 'fr' | 'ar';

const fr = {
  carRental: 'Location de voitures',
  in: 'à',
  heroTitle: 'Louez une voiture en toute simplicité',
  heroSub: 'Consultez les voitures disponibles, les prix et les conditions. Appelez-nous ou écrivez-nous sur WhatsApp pour réserver.',
  cash: 'Paiement en espèces à la remise des clés',
  availableNow: (n: number) => `${n} voiture${n > 1 ? 's' : ''} disponible${n > 1 ? 's' : ''} maintenant`,
  all: 'Toutes',
  onlyAvailable: 'Disponibles',
  manual: 'Manuelle',
  auto: 'Automatique',
  cheapest: 'Prix croissant',
  available: 'Disponible',
  rented: 'Louée',
  maintenance: 'En réparation',
  until: (d: string) => `jusqu'au ${d}`,
  backOn: (d: string) => `Disponible le ${d}`,
  perDay: '/ jour',
  from7: 'à partir de 7 jours',
  deposit: 'Caution',
  depositNote: 'rendue au retour du véhicule',
  seats: (n: number) => `${n} places`,
  ac: 'Climatisation',
  noAc: 'Sans clim',
  essence: 'Essence',
  diesel: 'Diesel',
  gpl: 'GPL',
  citadine: 'Citadine',
  berline: 'Berline',
  suv: 'SUV / 4x4',
  utilitaire: 'Utilitaire',
  conditions: 'Conditions',
  issues: 'À savoir sur ce véhicule',
  noIssues: 'Aucun défaut signalé.',
  call: 'Appeler',
  whatsapp: 'WhatsApp',
  waMessage: (car: string) => `Bonjour, je suis intéressé(e) par la ${car}. Est-elle disponible ?`,
  back: 'Retour',
  details: 'Voir les détails',
  prices: 'Prix',
  rules: 'Conditions générales',
  hours: 'Horaires',
  address: 'Adresse',
  contact: 'Contact',
  none: 'Aucune voiture ne correspond.',
  loading: 'Chargement…',
  sample: "Contenu d'exemple : le propriétaire peut le modifier.",
  ownerLink: 'Espace propriétaire',
  photoOf: (n: number, t: number) => `Photo ${n} sur ${t}`,
  owner: 'Propriétaire',
  admin: 'Admin',
  directions: 'Itinéraire',
  emailLabel: 'E-mail',
  follow: 'Suivez-nous',
  nextPhoto: 'Photo suivante',
  prevPhoto: 'Photo précédente',
  fullscreen: 'agrandir',
  search: 'Rechercher une voiture (ex. Clio, Tucson)…',
  showMore: (n: number) => `Voir plus (${n} restantes)`,
  results: (n: number) => `${n} résultat${n > 1 ? 's' : ''}`,
  dark: 'Mode sombre',
  light: 'Mode clair',
  navCars: 'Voitures',
  navInfo: 'Infos',
  close: 'Fermer',
  seeCars: 'Voir les voitures',
  statAvailable: 'disponibles',
  statCars: 'voitures',
  statCash: 'en espèces',
  fleet: 'Notre parc',
  specs: 'Caractéristiques',
  gearbox: 'Boîte',
  fuel: 'Carburant',
  seatsLabel: 'Places',
  climate: 'Clim',
  yes: 'Oui',
  no: 'Non',
};
type Dict = typeof fr;

const ar: Dict = {
  carRental: 'كراء السيارات',
  in: 'في',
  heroTitle: 'استأجر سيارتك بكل سهولة',
  heroSub: 'اطّلع على السيارات المتوفرة والأسعار والشروط. اتصل بنا أو راسلنا عبر واتساب للحجز.',
  cash: 'الدفع نقدًا عند استلام المفاتيح',
  availableNow: (n) => `${n} سيارة متوفرة الآن`,
  all: 'الكل',
  onlyAvailable: 'المتوفرة',
  manual: 'يدوي',
  auto: 'أوتوماتيك',
  cheapest: 'الأرخص أولاً',
  available: 'متوفرة',
  rented: 'مؤجّرة',
  maintenance: 'في الصيانة',
  until: (d) => `حتى ${d}`,
  backOn: (d) => `متوفرة يوم ${d}`,
  perDay: '/ اليوم',
  from7: 'ابتداءً من 7 أيام',
  deposit: 'الضمان',
  depositNote: 'يُرجع عند إعادة السيارة',
  seats: (n) => `${n} مقاعد`,
  ac: 'مكيّف',
  noAc: 'بدون مكيّف',
  essence: 'بنزين',
  diesel: 'مازوت',
  gpl: 'غاز (GPL)',
  citadine: 'سيارة صغيرة',
  berline: 'سيدان',
  suv: 'رباعية الدفع',
  utilitaire: 'نفعية',
  conditions: 'الشروط',
  issues: 'معلومات عن هذه السيارة',
  noIssues: 'لا توجد عيوب معروفة.',
  call: 'اتصال',
  whatsapp: 'واتساب',
  waMessage: (car) => `السلام عليكم، أنا مهتم بسيارة ${car}. هل هي متوفرة؟`,
  back: 'رجوع',
  details: 'التفاصيل',
  prices: 'الأسعار',
  rules: 'الشروط العامة',
  hours: 'أوقات العمل',
  address: 'العنوان',
  contact: 'اتصل بنا',
  none: 'لا توجد سيارة مطابقة.',
  loading: 'جارٍ التحميل…',
  sample: 'محتوى تجريبي: يمكن لصاحب الوكالة تعديله.',
  ownerLink: 'فضاء المالك',
  photoOf: (n, t) => `الصورة ${n} من ${t}`,
  owner: 'المالك',
  admin: 'الإدارة',
  directions: 'الاتجاهات',
  emailLabel: 'البريد الإلكتروني',
  follow: 'تابعونا',
  nextPhoto: 'الصورة التالية',
  prevPhoto: 'الصورة السابقة',
  fullscreen: 'تكبير',
  search: 'ابحث عن سيارة (مثلاً Clio، Tucson)…',
  showMore: (n) => `عرض المزيد (${n} متبقية)`,
  results: (n) => `${n} نتيجة`,
  dark: 'الوضع الليلي',
  light: 'الوضع النهاري',
  navCars: 'السيارات',
  navInfo: 'معلومات',
  close: 'إغلاق',
  seeCars: 'شاهد السيارات',
  statAvailable: 'متوفرة',
  statCars: 'سيارات',
  statCash: 'نقدًا',
  fleet: 'سياراتنا',
  specs: 'المواصفات',
  gearbox: 'ناقل الحركة',
  fuel: 'الوقود',
  seatsLabel: 'المقاعد',
  climate: 'مكيّف',
  yes: 'نعم',
  no: 'لا',
};

const DICTS: Record<Lang, Dict> = { fr, ar };
const KEY = 'cl.lang';

function apply(lang: Lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

let current: Lang = (() => {
  try {
    return (localStorage.getItem(KEY) as Lang) === 'ar' ? 'ar' : 'fr';
  } catch {
    return 'fr';
  }
})();
const listeners = new Set<(l: Lang) => void>();

export function useLang(): { lang: Lang; t: Dict; setLang: (l: Lang) => void } {
  const [lang, set] = useState<Lang>(current);
  useEffect(() => {
    apply(current);
    listeners.add(set);
    return () => void listeners.delete(set);
  }, []);
  const setLang = (l: Lang) => {
    current = l;
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
    apply(l);
    listeners.forEach((f) => f(l));
  };
  return { lang, t: DICTS[lang], setLang };
}

/** "4 500 DA" / "4 500 دج" as plain text. On screen use <Money>, which keeps the number left-to-right inside Arabic. */
export const money = (n: number, lang: Lang) => {
  const num = new Intl.NumberFormat('fr-FR').format(Math.round(n)).replace(/[\u202f\u00a0 ]/g, '\u00a0');
  return `${num} ${lang === 'ar' ? 'دج' : 'DA'}`;
};

export const dateText = (iso: string, lang: Lang) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

/** The owner's own text in the visitor's language: the Arabic version for Arabic visitors when filled in, otherwise the French one. */
export const pick = (fr: string | undefined, ar: string | undefined, lang: Lang) => (lang === 'ar' && ar?.trim() ? ar : fr ?? '');
