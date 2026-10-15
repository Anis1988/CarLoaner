import { useEffect, useState } from 'react';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { getData, type Data } from './lib/api';
import { pick, useLang } from './lib/i18n';
import { useTheme } from './lib/theme';
import { Dock } from './components/Dock';
import * as Ic from './components/Icons';

function Logo({ src }: { src?: string }) {
  if (src) return <img src={src} alt="" className="h-9 w-9 shrink-0 rounded-xl bg-white object-contain shadow-glow ring-1 ring-black/5 md:h-10 md:w-10 md:rounded-2xl" />;
  return (
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 text-white shadow-glow dark:text-ink-950 md:h-10 md:w-10 md:rounded-2xl">
      <Ic.Car className="h-5 w-5 md:h-6 md:w-6" />
    </span>
  );
}

/** Layered background: slow drifting glows, a faint grid in dark mode, soft dots in light mode. */
function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="glow glow-a -start-[20vw] -top-[18vh] h-[60vh] w-[70vw] bg-brand-300/35 dark:bg-brand-500/20" />
      <div className="glow glow-b -end-[25vw] top-[8vh] h-[55vh] w-[65vw] bg-cyan-200/50 dark:bg-cyan-500/[0.14]" />
      <div className="glow glow-c -bottom-[25vh] start-[10vw] h-[50vh] w-[70vw] bg-violet-200/40 dark:bg-violet-600/[0.12]" />
      <div className="grid-lines" />
      <div className="dots" />
    </div>
  );
}

/** Which part of the page is on screen (for the phone bar's sliding pill). */
function useSection(ids: string[], on: boolean) {
  const [cur, setCur] = useState(ids[0]);
  useEffect(() => {
    if (!on) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      let c = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) c = id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) c = ids[ids.length - 1];
      setCur(c);
    };
    const onScroll = () => (raf ||= requestAnimationFrame(check));
    window.addEventListener('scroll', onScroll, { passive: true });
    check();
    return () => (window.removeEventListener('scroll', onScroll), cancelAnimationFrame(raf));
  }, [on]); // eslint-disable-line react-hooks/exhaustive-deps
  return cur;
}

export default function App() {
  const isAdmin = window.location.pathname.startsWith('/admin');
  const { lang, t, setLang } = useLang();
  const { theme, toggle } = useTheme();
  const [data, setData] = useState<Data | undefined>();
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!isAdmin) getData().then(setData).catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (data) document.title = `${pick(data.shop.name, data.shop.nameAr, lang)} · ${t.carRental}`;
  }, [data, lang, t]);
  const section = useSection(['accueil', 'voitures', 'infos'], !isAdmin && !!data);
  const scrollTo = (id: string) => (id === 'accueil' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }));
  const tel = data?.shop.phone ? `tel:${data.shop.phone.replace(/\s/g, '')}` : '';

  return (
    <div className="min-h-screen">
      <Backdrop />
      <header className="glass sticky top-0 z-40 !border-x-0 !border-t-0 !bg-white/90 dark:!bg-ink-950/90" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 md:h-16">
          <a href="/" className="tap tap-soft flex min-w-0 items-center gap-2.5 rounded-2xl" aria-label={data?.shop.name ?? t.carRental}>
            <Logo src={isAdmin ? undefined : data?.shop.logo} />
            <span className={`min-w-0 ${isAdmin ? '' : 'hidden sm:block'}`}>
              <span className="block truncate font-display text-[15px] font-bold leading-tight text-slate-900 dark:text-white sm:text-lg">{isAdmin ? 'Espace propriétaire' : data ? pick(data.shop.name, data.shop.nameAr, lang) : t.carRental}</span>
              {!isAdmin && data?.shop.city && <span className="block truncate text-xs muted">{t.carRental} · {pick(data.shop.city, data.shop.cityAr, lang)}</span>}
            </span>
          </a>
          <div className="ms-auto flex shrink-0 items-center gap-1.5">
            {!isAdmin && tel && <a className="btn-primary !hidden !min-h-[44px] md:!inline-flex" href={tel}><Ic.Phone /><bdi dir="ltr">{data!.shop.phone}</bdi></a>}
            <button className="icon-btn !h-10 !w-10 md:!h-11 md:!w-11" onClick={toggle} aria-label={theme === 'dark' ? t.light : t.dark} title={theme === 'dark' ? t.light : t.dark}>{theme === 'dark' ? <Ic.Sun /> : <Ic.Moon />}</button>
            {!isAdmin && (
              <div className="relative grid h-10 grid-cols-2 rounded-2xl border border-slate-200/90 bg-white/70 p-1 backdrop-blur dark:border-white/10 dark:bg-white/[0.05] md:h-11" role="group" aria-label="Langue / اللغة">
                <span
                  className="pointer-events-none absolute inset-y-1 start-1 w-[calc(50%-0.25rem)] rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 shadow-glow transition-transform duration-500 [transition-timing-function:cubic-bezier(.34,1.4,.64,1)] motion-reduce:transition-none"
                  style={{ transform: lang === 'ar' ? 'translateX(-100%)' : 'none' }}
                  aria-hidden="true"
                />
                {(['fr', 'ar'] as const).map((l) => (
                  <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} lang={l} className={`tap relative z-[1] rounded-xl px-2.5 text-sm font-semibold transition-colors ${lang === l ? 'text-white dark:text-ink-950' : 'text-slate-600 hover:text-brand-600 dark:text-slate-300'}`}>
                    {l === 'fr' ? 'Français' : 'العربية'}
                  </button>
                ))}
              </div>
            )}
            {isAdmin ? (
              <a className="icon-btn !h-10 !w-auto gap-1.5 px-3 text-sm font-semibold md:!h-11" href="/"><Ic.Car /> Site</a>
            ) : (
              <a className="icon-btn !h-10 gap-1.5 text-sm font-semibold sm:!w-auto sm:px-3 md:!h-11" href="/admin" aria-label={t.admin} title={t.admin}><Ic.Key className="h-4 w-4" /> <span className="hidden sm:inline">{t.admin}</span></a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-36 pt-4 md:pb-14 md:pt-6">{isAdmin ? <Admin /> : <Home data={data} err={err} />}</main>

      {!isAdmin && (
        <>
          <footer className="hidden border-t border-slate-200/70 py-8 text-center text-sm muted dark:border-white/[0.08] md:block">
            <p>© {new Date().getFullYear()} {data ? pick(data.shop.name, data.shop.nameAr, lang) : ''} · {t.cash}</p>
            <a className="mt-2 inline-flex items-center gap-1 text-xs underline" href="/admin"><Ic.Key className="h-3.5 w-3.5" /> {t.ownerLink}</a>
          </footer>
          {/* Phone: thumb-reach navigation */}
          <Dock
            label="Navigation"
            active={section}
            items={[
              { key: 'accueil', label: t.navHome, icon: <Ic.Home />, onClick: () => scrollTo('accueil') },
              { key: 'voitures', label: t.navCars, icon: <Ic.Car />, onClick: () => scrollTo('voitures') },
              { key: 'infos', label: t.navInfo, icon: <Ic.Info />, onClick: () => scrollTo('infos') },
              { key: 'call', label: t.call, icon: <Ic.Phone className="h-[18px] w-[18px]" />, href: tel || undefined, tone: 'call' },
              { key: 'wa', label: t.whatsapp, icon: <Ic.Chat className="h-[18px] w-[18px]" />, href: data?.shop.whatsapp ? `https://wa.me/${data.shop.whatsapp}` : undefined, external: true, tone: 'wa' },
            ]}
          />
        </>
      )}
    </div>
  );
}
