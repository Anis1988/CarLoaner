import { useState } from 'react';
import type { Car, Shop } from '../lib/types';
import { dateText, money, useLang } from '../lib/i18n';

/** An amount that stays "4 500 دج" in Arabic (the number is isolated as left-to-right, so it never reads "500 4"). */
export function Money({ n }: { n: number }) {
  const { lang } = useLang();
  const [num, cur] = [money(n, lang).replace(/ (DA|دج)$/, ''), lang === 'ar' ? 'دج' : 'DA'];
  return <span className="whitespace-nowrap"><bdi dir="ltr">{num}</bdi> {cur}</span>;
}

export function StatusBadge({ car }: { car: Car }) {
  const { t, lang } = useLang();
  const style = car.status === 'available' ? 'bg-emerald-100 text-emerald-800 ring-emerald-300' : car.status === 'rented' ? 'bg-amber-100 text-amber-800 ring-amber-300' : 'bg-slate-200 text-slate-700 ring-slate-300';
  const dot = car.status === 'available' ? 'bg-emerald-500' : car.status === 'rented' ? 'bg-amber-500' : 'bg-slate-500';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${style}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {t[car.status]}
      {car.status !== 'available' && car.availableFrom ? ` · ${t.backOn(dateText(car.availableFrom, lang))}` : ''}
    </span>
  );
}

function Specs({ car }: { car: Car }) {
  const { t } = useLang();
  const items = [t[car.transmission], t[car.fuel], t.seats(car.seats), car.ac ? t.ac : t.noAc];
  return (
    <ul className="flex flex-wrap gap-1.5 text-xs text-slate-600">
      {items.map((s) => <li key={s} className="rounded-lg bg-slate-100 px-2 py-1">{s}</li>)}
    </ul>
  );
}

export function CarCard({ car, onOpen }: { car: Car; onOpen: () => void }) {
  const { t } = useLang();
  return (
    <article className={`card flex flex-col overflow-hidden transition hover:shadow-md ${car.status !== 'available' ? 'opacity-90' : ''}`}>
      <button onClick={onOpen} className="relative block aspect-[4/3] w-full overflow-hidden bg-slate-100" aria-label={`${t.details} ${car.name}`}>
        {car.photos[0] && <img src={car.photos[0]} alt={car.name} loading="lazy" className={`h-full w-full object-cover ${car.status !== 'available' ? 'grayscale-[40%]' : ''}`} />}
        <span className="absolute start-3 top-3"><StatusBadge car={car} /></span>
      </button>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-slate-900">{car.name}</h3>
            <p className="text-sm text-slate-500">{car.year} · {t[car.category]}</p>
          </div>
          <p className="shrink-0 text-end">
            <span className="block text-lg font-bold text-brand-700"><Money n={car.pricePerDay} /></span>
            <span className="text-xs text-slate-500">{t.perDay}</span>
          </p>
        </div>
        <Specs car={car} />
        <p className="text-xs text-slate-500">{t.deposit} : <Money n={car.deposit} /></p>
        <button className="btn mt-auto w-full" onClick={onOpen}>{t.details}</button>
      </div>
    </article>
  );
}

const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);

export function CarDetail({ car, shop, onBack }: { car: Car; shop: Shop; onBack: () => void }) {
  const { t, lang } = useLang();
  const [i, setI] = useState(0);
  const wa = shop.whatsapp ? `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(t.waMessage(`${car.name} ${car.year}`))}` : '';
  const issues = lines(car.issues);
  return (
    <section className="space-y-4">
      <button className="btn" onClick={onBack}><span aria-hidden="true">{lang === 'ar' ? '→' : '←'}</span> {t.back}</button>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-2">
          <div className="card overflow-hidden">
            <img src={car.photos[i] ?? car.photos[0]} alt={`${car.name} – ${t.photoOf(i + 1, car.photos.length)}`} className="aspect-[4/3] w-full bg-slate-100 object-cover" />
          </div>
          {car.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {car.photos.map((p, n) => (
                <button key={p} onClick={() => setI(n)} className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${n === i ? 'border-brand-600' : 'border-transparent'}`} aria-label={t.photoOf(n + 1, car.photos.length)}>
                  <img src={p} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card space-y-3 p-4">
            <StatusBadge car={car} />
            <h2 className="text-2xl font-bold text-slate-900">{car.name} <span className="font-normal text-slate-500">{car.year}</span></h2>
            <Specs car={car} />
            <div className="rounded-xl bg-brand-50 p-3">
              <p className="text-sm font-semibold text-brand-900">{t.prices}</p>
              <p className="text-2xl font-bold text-brand-700"><Money n={car.pricePerDay} /> <span className="text-sm font-medium text-slate-600">{t.perDay}</span></p>
              {car.priceWeekDay ? <p className="text-sm text-slate-700"><Money n={car.priceWeekDay} /> {t.perDay} · {t.from7}</p> : null}
              <p className="mt-1 text-sm text-slate-700">{t.deposit} : <b><Money n={car.deposit} /></b> <span className="text-slate-500">({t.depositNote})</span></p>
              <p className="mt-2 text-sm font-medium text-brand-900">💵 {t.cash}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {shop.phone && <a className="btn-primary" href={`tel:${shop.phone.replace(/\s/g, '')}`}>📞 {t.call}</a>}
              {wa && <a className="btn-wa" href={wa} target="_blank" rel="noopener noreferrer">💬 {t.whatsapp}</a>}
            </div>
          </div>

          {lines(car.conditions).length > 0 && (
            <div className="card p-4">
              <h3 className="mb-2 font-semibold text-slate-900">{t.conditions}</h3>
              <ul className="list-disc space-y-1 ps-5 text-sm text-slate-700">{lines(car.conditions).map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
          )}
          <div className={`card p-4 ${issues.length ? 'border-amber-200 bg-amber-50' : ''}`}>
            <h3 className="mb-2 font-semibold text-slate-900">⚠️ {t.issues}</h3>
            {issues.length ? <ul className="list-disc space-y-1 ps-5 text-sm text-slate-700">{issues.map((c) => <li key={c}>{c}</li>)}</ul> : <p className="text-sm text-slate-600">{t.noIssues}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
