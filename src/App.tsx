import { useEffect, useState } from 'react';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { getData, type Data } from './lib/api';
import { useLang } from './lib/i18n';

export default function App() {
  const isAdmin = window.location.pathname.startsWith('/admin');
  const { lang, t, setLang } = useLang();
  const [data, setData] = useState<Data | undefined>();
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!isAdmin) getData().then((d) => (setData(d), (document.title = `${d.shop.name} · ${t.carRental}`))).catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <a href="/" className="flex min-w-0 items-center gap-2">
            <img src="/icon.svg" alt="" className="h-9 w-9 shrink-0" />
            <span className="truncate font-display text-lg font-bold text-slate-900">{data?.shop.name ?? t.carRental}</span>
          </a>
          {!isAdmin && (
            <div className="ms-auto flex shrink-0 items-center gap-2">
              {data?.shop.phone && <a className="btn-primary !min-h-[40px] !px-3" href={`tel:${data.shop.phone.replace(/\s/g, '')}`} aria-label={t.call}>📞<span className="hidden sm:inline">{data.shop.phone}</span></a>}
              <button className="btn !min-h-[40px] !px-3" onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} aria-label="Langue / اللغة">{lang === 'fr' ? 'العربية' : 'Français'}</button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-5">{isAdmin ? <Admin /> : <Home data={data} err={err} />}</main>
      {!isAdmin && (
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} {data?.shop.name} · {t.cash}</p>
          <a className="mt-1 inline-block text-xs underline" href="/admin">{t.ownerLink}</a>
        </footer>
      )}
    </div>
  );
}
