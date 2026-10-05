import { useEffect, useState } from 'react';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { getData, type Data } from './lib/api';
import { useLang } from './lib/i18n';
import { useTheme } from './lib/theme';
import * as Ic from './components/Icons';

function Logo() {
  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 text-white shadow-glow">
      <Ic.Car className="h-6 w-6" />
    </span>
  );
}

export default function App() {
  const isAdmin = window.location.pathname.startsWith('/admin');
  const { lang, t, setLang } = useLang();
  const { theme, toggle } = useTheme();
  const [data, setData] = useState<Data | undefined>();
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!isAdmin) getData().then((d) => (setData(d), (document.title = `${d.shop.name} · ${t.carRental}`))).catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const tel = data?.shop.phone ? `tel:${data.shop.phone.replace(/\s/g, '')}` : '';

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-40 !border-x-0 !border-t-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-2 px-4">
          <a href="/" className="flex min-w-0 items-center gap-2.5">
            <Logo />
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-bold leading-tight text-slate-900 dark:text-white sm:text-lg">{isAdmin ? 'Espace propriétaire' : data?.shop.name ?? t.carRental}</span>
              {!isAdmin && data?.shop.city && <span className="block truncate text-xs muted">{t.carRental} · {data.shop.city}</span>}
            </span>
          </a>
          <div className="ms-auto flex shrink-0 items-center gap-1.5">
            {!isAdmin && tel && <a className="btn-primary !hidden !min-h-[44px] md:!inline-flex" href={tel}><Ic.Phone /><bdi dir="ltr">{data!.shop.phone}</bdi></a>}
            <button className="icon-btn" onClick={toggle} aria-label={theme === 'dark' ? t.light : t.dark} title={theme === 'dark' ? t.light : t.dark}>{theme === 'dark' ? <Ic.Sun /> : <Ic.Moon />}</button>
            {!isAdmin && <button className="icon-btn !w-auto px-3 text-sm font-bold" onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} aria-label="Langue / اللغة">{lang === 'fr' ? 'ع' : 'FR'}</button>}
            {isAdmin ? (
              <a className="icon-btn" href="/" aria-label="Retour au site" title="Retour au site"><Ic.Car /></a>
            ) : (
              <a className="icon-btn" href="/admin" aria-label={t.owner} title={t.owner}><Ic.Key /></a>
            )}
          </div>
        </div>
      </header>

      <main className={`mx-auto max-w-7xl px-4 pt-5 ${isAdmin ? 'pb-12' : 'pb-28 md:pb-12'}`}>{isAdmin ? <Admin /> : <Home data={data} err={err} />}</main>

      {!isAdmin && (
        <>
          <footer className="hidden border-t border-slate-200 py-8 text-center text-sm muted dark:border-white/10 md:block">
            <p>© {new Date().getFullYear()} {data?.shop.name} · {t.cash}</p>
            <a className="mt-2 inline-flex items-center gap-1 text-xs underline" href="/admin"><Ic.Key className="h-3.5 w-3.5" /> {t.ownerLink}</a>
          </footer>
          {/* Phone: thumb-reach navigation */}
          <nav className="glass fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-3xl p-1.5 shadow-2xl md:hidden" style={{ marginBottom: 'env(safe-area-inset-bottom)' }} aria-label="Navigation">
            <button className="flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-medium text-slate-700 active:scale-95 dark:text-slate-200" onClick={() => scrollTo('voitures')}><Ic.Car />{t.navCars}</button>
            <a className={`flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-semibold text-white active:scale-95 ${tel ? 'bg-gradient-to-r from-brand-500 to-cyan-500 shadow-glow' : 'pointer-events-none bg-slate-300'}`} href={tel || undefined}><Ic.Phone />{t.call}</a>
            <a className={`flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-semibold text-white active:scale-95 ${data?.shop.whatsapp ? 'bg-[#25D366]' : 'pointer-events-none bg-slate-300'} ms-1.5`} href={data?.shop.whatsapp ? `https://wa.me/${data.shop.whatsapp}` : undefined} target="_blank" rel="noopener noreferrer"><Ic.Chat />{t.whatsapp}</a>
            <button className="flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-medium text-slate-700 active:scale-95 dark:text-slate-200" onClick={() => scrollTo('infos')}><Ic.Info />{t.navInfo}</button>
          </nav>
        </>
      )}
    </div>
  );
}
