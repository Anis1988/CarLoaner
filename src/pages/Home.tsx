import { useEffect, useMemo, useState } from 'react';
import type { Data } from '../lib/api';
import { useLang } from '../lib/i18n';
import { CarCard, CarDetail } from '../components/Car';

const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);

export function Home({ data, err }: { data?: Data; err?: string }) {
  const { t } = useLang();
  const [onlyFree, setOnlyFree] = useState(false);
  const [box, setBox] = useState<'all' | 'manual' | 'auto'>('all');
  const [cheap, setCheap] = useState(false);
  const [open, setOpen] = useState<string | null>(() => window.location.hash.slice(1) || null);

  useEffect(() => {
    const onHash = () => setOpen(window.location.hash.slice(1) || null);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const go = (id: string | null) => {
    window.location.hash = id ?? '';
    setOpen(id);
    window.scrollTo({ top: 0 });
  };

  const cars = useMemo(() => {
    let list = data?.cars ?? [];
    if (onlyFree) list = list.filter((c) => c.status === 'available');
    if (box !== 'all') list = list.filter((c) => c.transmission === box);
    const rank = (s: string) => (s === 'available' ? 0 : s === 'rented' ? 1 : 2);
    return [...list].sort((a, b) => (cheap ? a.pricePerDay - b.pricePerDay : rank(a.status) - rank(b.status)));
  }, [data, onlyFree, box, cheap]);

  if (err) return <p className="card p-4 text-red-700">{err}</p>;
  if (!data) return <p className="p-6 text-slate-500"><span className="spinner" /> {t.loading}</p>;

  const selected = data.cars.find((c) => c.id === open);
  if (selected) return <CarDetail car={selected} shop={data.shop} onBack={() => go(null)} />;

  const free = data.cars.filter((c) => c.status === 'available').length;
  const chip = (on: boolean) => `chip ${on ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`;

  return (
    <div className="space-y-6">
      {data.sample && <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-xs text-amber-800 ring-1 ring-amber-200">{t.sample}</p>}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white shadow-lg sm:p-10">
        <p className="text-sm font-medium text-brand-100">{t.carRental} {data.shop.city ? `${t.in} ${data.shop.city}` : ''}</p>
        <h1 className="mt-1 text-3xl font-bold leading-tight sm:text-4xl">{t.heroTitle}</h1>
        <p className="mt-2 max-w-2xl text-brand-50/90">{t.heroSub}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-white/15 px-3 py-1.5">✅ {t.availableNow(free)}</span>
          <span className="rounded-full bg-white/15 px-3 py-1.5">💵 {t.cash}</span>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <button className={chip(!onlyFree)} onClick={() => setOnlyFree(false)}>{t.all}</button>
        <button className={chip(onlyFree)} onClick={() => setOnlyFree(true)}>{t.onlyAvailable}</button>
        <span className="mx-1 w-px self-stretch bg-slate-200" aria-hidden="true" />
        <button className={chip(box === 'manual')} onClick={() => setBox(box === 'manual' ? 'all' : 'manual')}>{t.manual}</button>
        <button className={chip(box === 'auto')} onClick={() => setBox(box === 'auto' ? 'all' : 'auto')}>{t.auto}</button>
        <button className={chip(cheap)} onClick={() => setCheap(!cheap)}>↑ {t.cheapest}</button>
      </div>

      {cars.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((c) => <CarCard key={c.id} car={c} onOpen={() => go(c.id)} />)}
        </div>
      ) : (
        <p className="card p-6 text-center text-slate-500">{t.none}</p>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">{t.rules}</h2>
          <ul className="list-disc space-y-1 ps-5 text-sm text-slate-700">{lines(data.shop.rules).map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
        <div className="card space-y-2 p-4 text-sm text-slate-700">
          <h2 className="text-lg font-semibold text-slate-900">{t.contact}</h2>
          {data.shop.address && <p>📍 <b>{t.address} :</b> {data.shop.address}</p>}
          {data.shop.hours && <p>🕒 <b>{t.hours} :</b> {data.shop.hours}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            {data.shop.phone && <a className="btn-primary" href={`tel:${data.shop.phone.replace(/\s/g, '')}`}>📞 {data.shop.phone}</a>}
            {data.shop.whatsapp && <a className="btn-wa" href={`https://wa.me/${data.shop.whatsapp}`} target="_blank" rel="noopener noreferrer">💬 {t.whatsapp}</a>}
          </div>
        </div>
      </section>
    </div>
  );
}
