import { useEffect, useMemo, useState } from 'react';
import type { Data } from '../lib/api';
import { pick, useLang } from '../lib/i18n';
import { CarCard, CarSheet } from '../components/Car';
import * as Ic from '../components/Icons';

const PAGE = 24; // cars shown at first; "Voir plus" adds more (keeps phones fast with 100+ cars)
const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => <div key={i} className="card h-80 animate-pulse" />)}
    </div>
  );
}

export function Home({ data, err }: { data?: Data; err?: string }) {
  const { t, lang } = useLang();
  const [onlyFree, setOnlyFree] = useState(false);
  const [box, setBox] = useState<'all' | 'manual' | 'auto'>('all');
  const [cheap, setCheap] = useState(false);
  const [open, setOpen] = useState<string | null>(() => window.location.hash.slice(1) || null);
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);
  // The sheet stays on screen a moment after closing so it can slide away (also when the phone's back button closes it).
  const [shown, setShown] = useState<string | null>(open);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (open) return void (setShown(open), setLeaving(false));
    if (!shown) return;
    setLeaving(true);
    const t = setTimeout(() => (setShown(null), setLeaving(false)), 280);
    return () => clearTimeout(t);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length) list = list.filter((c) => words.every((w) => `${c.name} ${c.year} ${t[c.category]} ${t[c.fuel]}`.toLowerCase().includes(w)));
    if (onlyFree) list = list.filter((c) => c.status === 'available');
    if (box !== 'all') list = list.filter((c) => c.transmission === box);
    const rank = (s: string) => (s === 'available' ? 0 : s === 'rented' ? 1 : 2);
    return [...list].sort((a, b) => (cheap ? a.pricePerDay - b.pricePerDay : rank(a.status) - rank(b.status)));
  }, [data, onlyFree, box, cheap, q, t]);
  useEffect(() => setLimit(PAGE), [onlyFree, box, cheap, q]);

  if (err) return <p className="card p-5 text-red-600 dark:text-red-300">{err}</p>;
  if (!data) return <Skeleton />;

  const selected = data.cars.find((c) => c.id === shown);
  const shop = data.shop;
  const name = pick(shop.name, shop.nameAr, lang);
  const city = pick(shop.city, shop.cityAr, lang);
  const free = data.cars.filter((c) => c.status === 'available').length;
  const chip = (on: boolean) => `chip ${on ? 'chip-on' : 'chip-off'}`;

  return (
    <div className="space-y-6">
      {data.sample && <p className="rise rounded-2xl bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-800 ring-1 ring-amber-500/30 dark:text-amber-200">{t.sample}</p>}

      <section className="rise relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white via-brand-50 to-cyan-100 p-6 text-slate-900 shadow-soft ring-1 ring-brand-200/70 transition-colors duration-500 dark:from-ink-900 dark:via-ink-800 dark:to-brand-900 dark:text-white dark:shadow-2xl dark:ring-white/10 sm:p-10">
        <div className="pointer-events-none absolute -end-16 -top-20 h-64 w-64 rounded-full bg-cyan-300/40 blur-3xl dark:bg-cyan-400/30" />
        <div className="pointer-events-none absolute -bottom-24 -start-10 h-64 w-64 rounded-full bg-brand-300/40 blur-3xl dark:bg-brand-400/30" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.5] [background-image:linear-gradient(rgba(15,23,42,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.06)_1px,transparent_1px)] [background-size:28px_28px] dark:opacity-[0.15] dark:[background-image:linear-gradient(rgba(255,255,255,.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.25)_1px,transparent_1px)]" />
        <div className="relative">
          <p className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-brand-800 ring-1 ring-brand-200 backdrop-blur dark:bg-white/10 dark:text-white dark:ring-white/20"><Ic.Pin className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{name} · {t.carRental} {city ? `${t.in} ${city}` : ''}</span></p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-[1.1] sm:text-5xl">
            <span className="bg-gradient-to-r from-slate-900 via-brand-700 to-cyan-700 bg-clip-text text-transparent dark:from-white dark:via-brand-100 dark:to-cyan-200">{pick(shop.heroTitle, shop.heroTitleAr, lang) || t.heroTitle}</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">{pick(shop.heroSub, shop.heroSubAr, lang) || t.heroSub}</p>
          <div className="mt-6 grid max-w-md grid-cols-3 gap-2">
            {([[String(free), t.statAvailable], [String(data.cars.length), t.statCars], ['100%', t.statCash]] as const).map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-white/80 p-3 text-center ring-1 ring-brand-200/80 backdrop-blur dark:bg-white/10 dark:ring-white/15">
                <p className="font-display text-2xl font-bold"><bdi>{n}</bdi></p>
                <p className="text-[11px] text-slate-500 dark:text-slate-300">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <a href="#voitures" onClick={(e) => (e.preventDefault(), document.getElementById('voitures')?.scrollIntoView({ behavior: 'smooth' }))} className="btn-primary"><Ic.Car /> {t.seeCars}</a>
            {data.shop.whatsapp && <a className="btn-wa" href={`https://wa.me/${data.shop.whatsapp}`} target="_blank" rel="noopener noreferrer"><Ic.Chat /> {t.whatsapp}</a>}
            {shop.mapsUrl && <a className="btn col-span-2" href={shop.mapsUrl} target="_blank" rel="noopener noreferrer"><Ic.Route /> {t.directions}</a>}
          </div>
          {(shop.facebook || shop.instagram) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold uppercase tracking-wider muted">{t.follow}</span>
              {shop.facebook && <a className="icon-btn" href={shop.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Ic.Facebook /></a>}
              {shop.instagram && <a className="icon-btn" href={shop.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Ic.Instagram /></a>}
            </div>
          )}
        </div>
      </section>

      <section id="voitures" className="scroll-mt-20 space-y-4">
        <div className="flex items-end justify-between gap-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.fleet}</h2>
          <span className="text-sm muted">{t.results(cars.length)}</span>
        </div>
        <div className="sticky top-[68px] z-20 -mx-4 space-y-2 bg-slate-50/80 px-4 py-2 backdrop-blur-xl dark:bg-ink-950/80">
          <label className="relative block">
            <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-slate-400"><Ic.Search className="h-5 w-5" /></span>
            <input className="input !rounded-full !ps-11" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} aria-label={t.search} />
          </label>
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
            {cars.slice(0, limit).map((c, i) => <CarCard key={`${c.id}-${onlyFree}-${box}-${cheap}`} car={c} index={i % PAGE} onOpen={() => openCar(c.id)} />)}
          </div>
        ) : null}
        {cars.length > limit ? (
          <button className="btn mx-auto flex w-full sm:w-auto" onClick={() => setLimit((l) => l + PAGE)}>{t.showMore(cars.length - limit)}</button>
        ) : cars.length ? null : (
          <p className="card p-8 text-center muted">{t.none}</p>
        )}
      </section>

      <section id="infos" className="grid scroll-mt-20 gap-4 md:grid-cols-2">
        <div className="card rise p-5">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><Ic.Shield className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" /> {t.rules}</h2>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {lines(pick(shop.rules, shop.rulesAr, lang)).map((r) => <li key={r} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />{r}</li>)}
          </ul>
        </div>
        <div className="card rise space-y-3 p-5 text-sm text-slate-700 dark:text-slate-300">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><Ic.Phone className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" /> {t.contact}</h2>
          {shop.address && <p className="flex gap-2"><Ic.Pin className="h-5 w-5 shrink-0 text-slate-400" /><span><b>{t.address} :</b> {pick(shop.address, shop.addressAr, lang)}</span></p>}
          {shop.hours && <p className="flex gap-2"><Ic.Clock className="h-5 w-5 shrink-0 text-slate-400" /><span><b>{t.hours} :</b> {pick(shop.hours, shop.hoursAr, lang)}</span></p>}
          {shop.email && <p className="flex gap-2"><Ic.Mail className="h-5 w-5 shrink-0 text-slate-400" /><span><b>{t.emailLabel} :</b> <a className="text-brand-700 underline dark:text-brand-300" href={`mailto:${shop.email}`}><bdi dir="ltr">{shop.email}</bdi></a></span></p>}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {data.shop.phone && <a className="btn-primary whitespace-nowrap !px-3" href={`tel:${data.shop.phone.replace(/\s/g, '')}`}><Ic.Phone /> <bdi dir="ltr">{data.shop.phone}</bdi></a>}
            {data.shop.whatsapp && <a className="btn-wa" href={`https://wa.me/${data.shop.whatsapp}`} target="_blank" rel="noopener noreferrer"><Ic.Chat /> {t.whatsapp}</a>}
          </div>
        </div>
      </section>

      {selected && <CarSheet car={selected} shop={data.shop} onClose={close} leaving={leaving} />}
    </div>
  );
}
