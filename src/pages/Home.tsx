import { useEffect, useMemo, useState } from 'react';
import type { Data } from '../lib/api';
import { pick, useLang } from '../lib/i18n';
import { CarCard, CarSheet } from '../components/Car';
import * as Ic from '../components/Icons';

const PAGE = 24; // cars shown at first; "Voir plus" adds more (keeps phones fast with 100+ cars)
const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);

function SkeletonCard() {
  return (
    <div className="card !rounded-[1.75rem] p-1.5" aria-hidden="true">
      <div className="skeleton aspect-[4/3] rounded-[1.35rem]" />
      <div className="space-y-3 px-2.5 pb-2.5 pt-3.5">
        <div className="skeleton h-5 w-2/3 rounded-full" />
        <div className="skeleton h-3.5 w-1/2 rounded-full" />
        <div className="flex gap-1.5">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-6 w-16 rounded-full" />)}</div>
        <div className="skeleton h-12 rounded-2xl" />
      </div>
    </div>
  );
}

function Skeleton() {
  const { t } = useLang();
  return (
    <div className="space-y-6" role="status" aria-label={t.loading}>
      <div className="card space-y-4 !rounded-4xl p-6 sm:p-10" aria-hidden="true">
        <div className="skeleton h-6 w-48 max-w-full rounded-full" />
        <div className="skeleton h-9 w-4/5 rounded-2xl" />
        <div className="skeleton h-4 w-3/5 rounded-full" />
        <div className="grid max-w-md grid-cols-3 gap-2">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
      </div>
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

  if (err)
    return (
      <div className="card mx-auto mt-6 max-w-md space-y-3 p-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-red-500/10 text-red-600 ring-1 ring-red-500/30 dark:text-red-300"><Ic.Warn className="h-7 w-7" /></span>
        <p className="text-red-700 dark:text-red-300">{err}</p>
      </div>
    );
  if (!data) return <Skeleton />;

  const selected = data.cars.find((c) => c.id === shown);
  const shop = data.shop;
  const name = pick(shop.name, shop.nameAr, lang);
  const city = pick(shop.city, shop.cityAr, lang);
  const free = data.cars.filter((c) => c.status === 'available').length;
  const chip = (on: boolean) => `chip ${on ? 'chip-on' : 'chip-off'}`;
  const filtered = onlyFree || box !== 'all' || cheap || !!q;

  return (
    <div className="space-y-7">
      {data.sample && <p className="rise rounded-2xl bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-800 ring-1 ring-amber-500/30 dark:text-amber-200">{t.sample}</p>}

      <section id="accueil" className="rise card relative scroll-mt-20 overflow-hidden !rounded-4xl p-6 sm:p-10">
        {/* layered glows, speed streaks and a faint grid */}
        <div className="pointer-events-none absolute -end-20 -top-24 h-72 w-72 rounded-full bg-cyan-300/40 blur-3xl dark:bg-cyan-400/20" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-28 -start-16 h-72 w-72 rounded-full bg-brand-300/45 blur-3xl dark:bg-brand-500/25" aria-hidden="true" />
        <div className="pointer-events-none absolute end-0 top-1/3 h-48 w-48 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-500/15" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(15,23,42,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,.05)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(to_bottom,#000,transparent)] dark:opacity-100 dark:[background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {[18, 42, 64, 82].map((top, i) => (
            <span key={top} className="streak absolute h-px w-2/3 bg-gradient-to-r from-transparent via-brand-400/40 to-transparent dark:via-cyan-300/30" style={{ top: `${top}%`, insetInlineStart: `${i * 9}%`, animationDelay: `${i * 0.9}s` }} />
          ))}
        </div>
        <div className="relative">
          <p className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-xs font-semibold text-brand-800 ring-1 ring-brand-200 backdrop-blur dark:bg-white/[0.07] dark:text-brand-100 dark:ring-white/15"><span className="live-dot h-2 w-2 shrink-0 rounded-full bg-emerald-500 text-emerald-500" /><Ic.Pin className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{name} · {t.carRental} {city ? `${t.in} ${city}` : ''}</span></p>
          <h1 className="mt-4 max-w-2xl text-[2rem] font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
            <span className="grad-text">{pick(shop.heroTitle, shop.heroTitleAr, lang) || t.heroTitle}</span>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">{pick(shop.heroSub, shop.heroSubAr, lang) || t.heroSub}</p>
          <div className="mt-6 grid max-w-md grid-cols-3 gap-2">
            {([[String(free), t.statAvailable], [String(data.cars.length), t.statCars], ['100%', t.statCash]] as const).map(([n, l], i) => (
              <div key={l} className="relative overflow-hidden rounded-2xl bg-white/75 p-3 text-center ring-1 ring-slate-200/80 backdrop-blur dark:bg-white/[0.05] dark:ring-white/10">
                <span className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent" aria-hidden="true" />
                <p className={`font-display text-2xl font-bold ${i === 0 ? 'text-brand-700 dark:text-brand-300' : 'text-slate-900 dark:text-white'}`}><bdi>{n}</bdi></p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <a href="#voitures" onClick={(e) => (e.preventDefault(), document.getElementById('voitures')?.scrollIntoView({ behavior: 'smooth' }))} className="btn-primary col-span-2 min-h-[52px] text-[15px]"><Ic.Car /> {t.seeCars}</a>
            {data.shop.whatsapp && <a className={`btn-wa min-h-[50px] ${shop.mapsUrl ? '' : 'col-span-2'}`} href={`https://wa.me/${data.shop.whatsapp}`} target="_blank" rel="noopener noreferrer"><Ic.Chat /> {t.whatsapp}</a>}
            {shop.mapsUrl && <a className={`btn min-h-[50px] ${data.shop.whatsapp ? '' : 'col-span-2'}`} href={shop.mapsUrl} target="_blank" rel="noopener noreferrer"><Ic.Route /> {t.directions}</a>}
          </div>
          {(shop.facebook || shop.instagram) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="eyebrow !text-slate-500 dark:!text-slate-400">{t.follow}</span>
              {shop.facebook && <a className="icon-btn !rounded-full" href={shop.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Ic.Facebook /></a>}
              {shop.instagram && <a className="icon-btn !rounded-full" href={shop.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Ic.Instagram /></a>}
            </div>
          )}
        </div>
      </section>

      <section id="voitures" className="scroll-mt-16 space-y-3 md:scroll-mt-20">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="eyebrow">{t.carRental}</p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{t.fleet}</h2>
          </div>
          <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-slate-600 ring-1 ring-slate-200/80 backdrop-blur dark:bg-white/[0.05] dark:text-slate-300 dark:ring-white/10">{t.results(cars.length)}</span>
        </div>
        <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-20 -mx-4 space-y-2 border-b border-transparent bg-mist-50/90 px-4 py-2.5 backdrop-blur-xl dark:bg-ink-950/90 md:top-16">
          <label className="relative block">
            <span className="pointer-events-none absolute inset-y-0 start-3.5 flex items-center text-brand-600 dark:text-brand-300"><Ic.Search className="h-5 w-5" /></span>
            <input className="input !rounded-full !ps-11 shadow-soft dark:shadow-none" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} aria-label={t.search} />
          </label>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5">
            <button className={chip(!onlyFree)} onClick={() => setOnlyFree(false)}>{t.all}</button>
            <button className={chip(onlyFree)} onClick={() => setOnlyFree(true)}><span className="h-2 w-2 rounded-full bg-current" />{t.onlyAvailable}</button>
            <button className={chip(box === 'manual')} onClick={() => setBox(box === 'manual' ? 'all' : 'manual')}><Ic.Gear className="h-4 w-4" />{t.manual}</button>
            <button className={chip(box === 'auto')} onClick={() => setBox(box === 'auto' ? 'all' : 'auto')}><Ic.Gear className="h-4 w-4" />{t.auto}</button>
            <button className={chip(cheap)} onClick={() => setCheap(!cheap)}><Ic.Sort className="h-4 w-4" />{t.cheapest}</button>
          </div>
        </div>

        {cars.length ? (
          <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {cars.slice(0, limit).map((c, i) => <CarCard key={`${c.id}-${onlyFree}-${box}-${cheap}`} car={c} index={i % PAGE} onOpen={() => openCar(c.id)} />)}
          </div>
        ) : null}
        {cars.length > limit ? (
          <button className="btn mx-auto flex w-full sm:w-auto" onClick={() => setLimit((l) => l + PAGE)}>{t.showMore(cars.length - limit)}</button>
        ) : cars.length ? null : (
          <div className="card rise flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500/15 to-cyan-500/15 text-brand-600 ring-1 ring-brand-500/25 dark:text-brand-300">
              <Ic.Search className="h-7 w-7" />
              <span className="absolute -inset-3 -z-10 rounded-[2rem] bg-brand-400/20 blur-xl" aria-hidden="true" />
            </span>
            <p className="font-display text-lg font-semibold text-slate-900 dark:text-white">{t.none}</p>
            <p className="text-sm muted">{t.noneHint}</p>
            {filtered && <button className="btn" onClick={() => (setQ(''), setOnlyFree(false), setBox('all'), setCheap(false))}>{t.reset}</button>}
          </div>
        )}
      </section>

      <section id="infos" className="grid scroll-mt-16 gap-4 md:scroll-mt-20 md:grid-cols-2">
        <div className="card rise p-5">
          <h2 className="mb-3 flex items-center gap-2.5 text-lg font-bold text-slate-900 dark:text-white"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-cyan-500/15 text-brand-600 ring-1 ring-brand-500/20 dark:text-brand-300"><Ic.Shield className="h-5 w-5" /></span> {t.rules}</h2>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {lines(pick(shop.rules, shop.rulesAr, lang)).map((r) => <li key={r} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-brand-400 to-cyan-400" />{r}</li>)}
          </ul>
        </div>
        <div className="card rise space-y-3 p-5 text-sm text-slate-700 dark:text-slate-300">
          <h2 className="flex items-center gap-2.5 text-lg font-bold text-slate-900 dark:text-white"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-cyan-500/15 text-brand-600 ring-1 ring-brand-500/20 dark:text-brand-300"><Ic.Phone className="h-5 w-5" /></span> {t.contact}</h2>
          {shop.address && <p className="panel flex gap-2.5 p-3"><Ic.Pin className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" /><span><b>{t.address} :</b> {pick(shop.address, shop.addressAr, lang)}</span></p>}
          {shop.hours && <p className="panel flex gap-2.5 p-3"><Ic.Clock className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" /><span><b>{t.hours} :</b> {pick(shop.hours, shop.hoursAr, lang)}</span></p>}
          {shop.email && <p className="panel flex gap-2.5 p-3"><Ic.Mail className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" /><span className="min-w-0 break-words"><b>{t.emailLabel} :</b> <a className="text-brand-700 underline dark:text-brand-300" href={`mailto:${shop.email}`}><bdi dir="ltr">{shop.email}</bdi></a></span></p>}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {data.shop.phone && <a className="btn-primary min-h-[50px] whitespace-nowrap !px-3" href={`tel:${data.shop.phone.replace(/\s/g, '')}`}><Ic.Phone /> <bdi dir="ltr">{data.shop.phone}</bdi></a>}
            {data.shop.whatsapp && <a className="btn-wa min-h-[50px]" href={`https://wa.me/${data.shop.whatsapp}`} target="_blank" rel="noopener noreferrer"><Ic.Chat /> {t.whatsapp}</a>}
          </div>
        </div>
      </section>

      {selected && <CarSheet car={selected} shop={data.shop} onClose={close} leaving={leaving} />}
    </div>
  );
}
