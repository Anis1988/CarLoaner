import { useEffect, useMemo, useState } from 'react';
import type { Data } from '../lib/api';
import { useLang } from '../lib/i18n';
import { CarCard, CarSheet } from '../components/Car';
import * as Ic from '../components/Icons';

const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => <div key={i} className="card h-80 animate-pulse" />)}
    </div>
  );
}

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
  // Opening a car adds it to the address (so the phone's back button closes it).
  const openCar = (id: string) => (window.location.hash = id);
  const close = () => (window.location.hash ? window.history.back() : setOpen(null));

  const cars = useMemo(() => {
    let list = data?.cars ?? [];
    if (onlyFree) list = list.filter((c) => c.status === 'available');
    if (box !== 'all') list = list.filter((c) => c.transmission === box);
    const rank = (s: string) => (s === 'available' ? 0 : s === 'rented' ? 1 : 2);
    return [...list].sort((a, b) => (cheap ? a.pricePerDay - b.pricePerDay : rank(a.status) - rank(b.status)));
  }, [data, onlyFree, box, cheap]);

  if (err) return <p className="card p-5 text-red-600 dark:text-red-300">{err}</p>;
  if (!data) return <Skeleton />;

  const selected = data.cars.find((c) => c.id === open);
  const free = data.cars.filter((c) => c.status === 'available').length;
  const chip = (on: boolean) => `chip ${on ? 'chip-on' : 'chip-off'}`;

  return (
    <div className="space-y-6">
      {data.sample && <p className="rise rounded-2xl bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-800 ring-1 ring-amber-500/30 dark:text-amber-200">{t.sample}</p>}

      <section className="rise relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 p-6 text-white shadow-2xl sm:p-10">
        <div className="pointer-events-none absolute -end-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -start-10 h-64 w-64 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(255,255,255,.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/20 backdrop-blur"><Ic.Pin className="h-3.5 w-3.5" /> {t.carRental} {data.shop.city ? `${t.in} ${data.shop.city}` : ''}</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-[1.1] sm:text-5xl">
            <span className="bg-gradient-to-r from-white via-brand-100 to-cyan-200 bg-clip-text text-transparent">{t.heroTitle}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-300 sm:text-base">{t.heroSub}</p>
          <div className="mt-6 grid max-w-md grid-cols-3 gap-2">
            {([[String(free), t.statAvailable], [String(data.cars.length), t.statCars], ['100%', t.statCash]] as const).map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-white/10 p-3 text-center ring-1 ring-white/15 backdrop-blur">
                <p className="font-display text-2xl font-bold"><bdi>{n}</bdi></p>
                <p className="text-[11px] text-slate-300">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href="#voitures" onClick={(e) => (e.preventDefault(), document.getElementById('voitures')?.scrollIntoView({ behavior: 'smooth' }))} className="btn-primary"><Ic.Car /> {t.seeCars}</a>
            {data.shop.whatsapp && <a className="btn-wa" href={`https://wa.me/${data.shop.whatsapp}`} target="_blank" rel="noopener noreferrer"><Ic.Chat /> {t.whatsapp}</a>}
          </div>
        </div>
      </section>

      <section id="voitures" className="scroll-mt-20 space-y-4">
        <div className="flex items-end justify-between gap-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.fleet}</h2>
          <span className="text-sm muted"><bdi>{cars.length}</bdi> / <bdi>{data.cars.length}</bdi></span>
        </div>
        <div className="sticky top-[68px] z-20 -mx-4 bg-slate-50/80 px-4 py-2 backdrop-blur-xl dark:bg-ink-950/80">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            <button className={chip(!onlyFree)} onClick={() => setOnlyFree(false)}>{t.all}</button>
            <button className={chip(onlyFree)} onClick={() => setOnlyFree(true)}><span className="h-2 w-2 rounded-full bg-current" />{t.onlyAvailable}</button>
            <button className={chip(box === 'manual')} onClick={() => setBox(box === 'manual' ? 'all' : 'manual')}><Ic.Gear className="h-4 w-4" />{t.manual}</button>
            <button className={chip(box === 'auto')} onClick={() => setBox(box === 'auto' ? 'all' : 'auto')}><Ic.Gear className="h-4 w-4" />{t.auto}</button>
            <button className={chip(cheap)} onClick={() => setCheap(!cheap)}><Ic.Sort className="h-4 w-4" />{t.cheapest}</button>
          </div>
        </div>

        {cars.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {cars.map((c, i) => <CarCard key={`${c.id}-${onlyFree}-${box}-${cheap}`} car={c} index={i} onOpen={() => openCar(c.id)} />)}
          </div>
        ) : (
          <p className="card p-8 text-center muted">{t.none}</p>
        )}
      </section>

      <section id="infos" className="grid scroll-mt-20 gap-4 md:grid-cols-2">
        <div className="card rise p-5">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><Ic.Shield className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" /> {t.rules}</h2>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {lines(data.shop.rules).map((r) => <li key={r} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />{r}</li>)}
          </ul>
        </div>
        <div className="card rise space-y-3 p-5 text-sm text-slate-700 dark:text-slate-300">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><Ic.Phone className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" /> {t.contact}</h2>
          {data.shop.address && <p className="flex gap-2"><Ic.Pin className="h-5 w-5 shrink-0 text-slate-400" /><span><b>{t.address} :</b> {data.shop.address}</span></p>}
          {data.shop.hours && <p className="flex gap-2"><Ic.Clock className="h-5 w-5 shrink-0 text-slate-400" /><span><b>{t.hours} :</b> {data.shop.hours}</span></p>}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {data.shop.phone && <a className="btn-primary" href={`tel:${data.shop.phone.replace(/\s/g, '')}`}><Ic.Phone /> <bdi dir="ltr">{data.shop.phone}</bdi></a>}
            {data.shop.whatsapp && <a className="btn-wa" href={`https://wa.me/${data.shop.whatsapp}`} target="_blank" rel="noopener noreferrer"><Ic.Chat /> {t.whatsapp}</a>}
          </div>
        </div>
      </section>

      {selected && <CarSheet car={selected} shop={data.shop} onClose={close} />}
    </div>
  );
}
