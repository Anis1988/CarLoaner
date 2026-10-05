import { useEffect, useState, type ReactNode } from 'react';
import { Gallery, Lightbox } from './Gallery';
import type { Car, Shop } from '../lib/types';
import { dateText, money, useLang } from '../lib/i18n';
import * as Ic from './Icons';

/** An amount that stays "4 500 دج" in Arabic (the number is isolated as left-to-right, so it never reads "500 4"). */
export function Money({ n }: { n: number }) {
  const { lang } = useLang();
  const [num, cur] = [money(n, lang).replace(/ (DA|دج)$/, ''), lang === 'ar' ? 'دج' : 'DA'];
  return <span className="whitespace-nowrap"><bdi dir="ltr">{num}</bdi> {cur}</span>;
}

const STATUS = {
  available: { pill: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/40 dark:text-emerald-300', dot: 'bg-emerald-500 text-emerald-500' },
  rented: { pill: 'bg-amber-500/15 text-amber-800 ring-amber-500/40 dark:text-amber-300', dot: 'bg-amber-500 text-amber-500' },
  maintenance: { pill: 'bg-slate-500/15 text-slate-700 ring-slate-500/40 dark:text-slate-300', dot: 'bg-slate-400 text-slate-400' },
} as const;

/** Card border + glow by availability: green = available, orange = rented, grey = in the garage. */
const BORDER = {
  available: '!border-2 !border-emerald-400 hover:shadow-[0_0_0_1px_rgba(16,185,129,.4),0_18px_45px_-12px_rgba(16,185,129,.55)] dark:!border-emerald-400/70',
  rented: '!border-2 !border-orange-400 hover:shadow-[0_0_0_1px_rgba(251,146,60,.4),0_18px_45px_-12px_rgba(251,146,60,.5)] dark:!border-orange-400/70',
  maintenance: '!border-2 !border-slate-400 hover:shadow-[0_18px_45px_-12px_rgba(100,116,139,.5)] dark:!border-slate-500',
} as const;

export function StatusBadge({ car, solid = false }: { car: Car; solid?: boolean }) {
  const { t, lang } = useLang();
  const s = STATUS[car.status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 backdrop-blur-md ${s.pill} ${solid ? 'bg-white/85 dark:bg-ink-900/80' : ''}`}>
      <span className={`h-2 w-2 rounded-full ${s.dot} ${car.status === 'available' ? 'live-dot' : ''}`} />
      {t[car.status]}
      {car.status !== 'available' && car.availableFrom ? ` · ${t.backOn(dateText(car.availableFrom, lang))}` : ''}
    </span>
  );
}

function SpecPills({ car }: { car: Car }) {
  const { t } = useLang();
  const items: [ReactNode, string][] = [[<Ic.Gear className="h-3.5 w-3.5" />, t[car.transmission]], [<Ic.Fuel className="h-3.5 w-3.5" />, t[car.fuel]], [<Ic.Seat className="h-3.5 w-3.5" />, String(car.seats)], [<Ic.Snow className="h-3.5 w-3.5" />, car.ac ? t.climate : t.noAc]];
  return (
    <ul className="flex flex-wrap gap-1.5 text-xs">
      {items.map(([icon, label]) => (
        <li key={label} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-white/5 dark:text-slate-300">{icon}{label}</li>
      ))}
    </ul>
  );
}

export function CarCard({ car, index, onOpen }: { car: Car; index: number; onOpen: () => void }) {
  const { t } = useLang();
  const off = car.status !== 'available';
  return (
    <article className="rise group" style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}>
      <button
        onClick={onOpen}
        className={`card shine block w-full overflow-hidden text-start transition duration-300 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 active:scale-[0.985] ${BORDER[car.status]}`}
        aria-label={`${t.details}: ${car.name} ${car.year}`}
      >
        <div className="relative aspect-[16/11] overflow-hidden bg-slate-100 dark:bg-ink-800">
          {car.photos[0] && (
            <>
              <img src={car.photos[0]} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl" />
              <img src={car.photos[0]} alt="" loading="lazy" decoding="async" className={`relative h-full w-full object-contain transition duration-500 group-hover:scale-105 ${off ? 'grayscale-[45%]' : ''}`} />
            </>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent" />
          <span className="absolute start-3 top-3"><StatusBadge car={car} solid /></span>
          <span className="absolute bottom-3 end-3 rounded-2xl bg-white/90 px-3 py-1.5 text-end shadow-soft backdrop-blur dark:bg-ink-900/85">
            <span className="block font-display text-lg font-bold leading-tight text-brand-700 dark:text-brand-300"><Money n={car.pricePerDay} /></span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">{t.perDay}</span>
          </span>
        </div>
        <div className="space-y-2.5 p-4">
          <div>
            <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white">{car.name}</h3>
            <p className="text-sm muted">{car.year} · {t[car.category]} · {t.deposit} <Money n={car.deposit} /></p>
          </div>
          <SpecPills car={car} />
        </div>
      </button>
    </article>
  );
}

/** Coloured top edge of the details sheet, same colours as the card borders. */
const BORDER_TOP = { available: 'border-t-4 border-emerald-400', rented: 'border-t-4 border-orange-400', maintenance: 'border-t-4 border-slate-400' } as const;

const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);

/** Car details as a sheet: slides up from the bottom on phones, a centred panel on bigger screens. */
export function CarSheet({ car, shop, onClose, leaving = false }: { car: Car; shop: Shop; onClose: () => void; leaving?: boolean }) {
  const { t } = useLang();
  const [full, setFull] = useState<number | null>(null); // full-screen photo viewer
  const wa = shop.whatsapp ? `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(t.waMessage(`${car.name} ${car.year}`))}` : '';
  const issues = lines(car.issues);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !document.querySelector('[data-lightbox]') && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={car.name}>
      <button className={`${leaving ? 'fade-leave' : 'fade'} absolute inset-0 bg-ink-950/60 backdrop-blur-sm`} onClick={onClose} aria-label={t.close} />
      <div className={`${leaving ? 'sheet-leave' : 'sheet'} relative flex max-h-[94dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl dark:bg-ink-900 md:rounded-[2rem] ${BORDER_TOP[car.status]}`}>
        <div className="absolute inset-x-0 top-2 z-10 mx-auto h-1.5 w-12 rounded-full bg-white/70 md:hidden" aria-hidden="true" />
        <button className="icon-btn absolute end-3 top-3 z-10 !bg-white/90 dark:!bg-ink-900/90" onClick={onClose} aria-label={t.close}><Ic.Close /></button>

        <div className="overflow-y-auto overscroll-contain">
          <div className="md:grid md:grid-cols-[1.15fr_1fr]">
            <div className="bg-slate-100 dark:bg-ink-800 md:self-start">
              <Gallery photos={car.photos} alt={`${car.name} ${car.year}`} keys={full === null} onOpenFull={setFull} />
            </div>

            <div className="space-y-4 p-5">
              <div className="space-y-2">
                <StatusBadge car={car} />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{car.name} <span className="font-medium text-slate-400">{car.year}</span></h2>
                <p className="text-sm muted">{t[car.category]}</p>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {([[<Ic.Gear />, t.gearbox, t[car.transmission]], [<Ic.Fuel />, t.fuel, t[car.fuel]], [<Ic.Seat />, t.seatsLabel, String(car.seats)], [<Ic.Snow />, t.climate, car.ac ? t.yes : t.no]] as [ReactNode, string, string][]).map(([icon, label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-2 dark:bg-white/5">
                    <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">{icon}</div>
                    <p className="text-[11px] muted">{label}</p>
                    <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-brand-500/15 via-cyan-500/10 to-transparent p-4 ring-1 ring-brand-500/20">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">{t.prices}</p>
                <p className="font-display text-3xl font-bold text-slate-900 dark:text-white"><Money n={car.pricePerDay} /> <span className="text-sm font-medium muted">{t.perDay}</span></p>
                {car.priceWeekDay ? <p className="text-sm text-slate-700 dark:text-slate-300"><Money n={car.priceWeekDay} /> {t.perDay} · {t.from7}</p> : null}
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300"><Ic.Shield className="me-1 inline h-4 w-4 align-[-3px] text-brand-600 dark:text-brand-300" />{t.deposit} : <b><Money n={car.deposit} /></b> <span className="muted">({t.depositNote})</span></p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-brand-800 dark:text-brand-200"><Ic.Cash className="h-4 w-4" /> {t.cash}</p>
              </div>

              {lines(car.conditions).length > 0 && (
                <div>
                  <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">{t.conditions}</h3>
                  <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                    {lines(car.conditions).map((c) => <li key={c} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />{c}</li>)}
                  </ul>
                </div>
              )}
              <div className={`rounded-2xl p-3 ${issues.length ? 'bg-amber-500/10 ring-1 ring-amber-500/30' : 'bg-slate-50 dark:bg-white/5'}`}>
                <h3 className="mb-1 flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white"><Ic.Warn className="h-4 w-4 text-amber-600 dark:text-amber-400" /> {t.issues}</h3>
                {issues.length ? <ul className="list-disc space-y-1 ps-5 text-sm text-slate-700 dark:text-slate-300">{issues.map((c) => <li key={c}>{c}</li>)}</ul> : <p className="text-sm muted">{t.noIssues}</p>}
              </div>
            </div>
          </div>
        </div>

        {full !== null && <Lightbox photos={car.photos} alt={`${car.name} ${car.year}`} start={full} onClose={() => setFull(null)} />}
        <div className="grid grid-cols-2 gap-2 border-t border-slate-200 bg-white/90 p-3 backdrop-blur dark:border-white/10 dark:bg-ink-900/90" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          {shop.phone ? <a className="btn-primary whitespace-nowrap !px-3" href={`tel:${shop.phone.replace(/\s/g, '')}`} aria-label={`${t.call} ${shop.phone}`}><Ic.Phone className="h-5 w-5 shrink-0" /> <bdi dir="ltr">{shop.phone}</bdi></a> : <span />}
          {wa ? <a className="btn-wa" href={wa} target="_blank" rel="noopener noreferrer"><Ic.Chat /> {t.whatsapp}</a> : <span />}
        </div>
      </div>
    </div>
  );
}
