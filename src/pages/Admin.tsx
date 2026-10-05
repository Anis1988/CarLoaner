import { useEffect, useState } from 'react';
import { AuthError, adminApi, getData, session, shrinkPhoto, type Data } from '../lib/api';
import * as Ic from '../components/Icons';
import type { Car, Shop } from '../lib/types';
import { Money } from '../components/Car';

type Draft = Omit<Car, 'id' | 'updatedAt'> & { id?: string };
const EMPTY: Draft = {
  name: '', year: new Date().getFullYear(), category: 'berline', transmission: 'manual', fuel: 'essence', seats: 5, ac: true,
  pricePerDay: 0, deposit: 0, status: 'available', conditions: '', issues: '', photos: [],
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="label">{label}</span>{children}</label>;
}

function Err({ msg }: { msg: string }) {
  return msg ? <p className="rounded-2xl bg-red-500/10 px-3 py-2 text-sm text-red-700 ring-1 ring-red-500/30 dark:text-red-300">{msg}</p> : null;
}

/** First visit: choose a password with the setup code. Later: log in, or choose a new one with the code if forgotten. */
function Auth({ onOk }: { onOk: () => void }) {
  const [mode, setMode] = useState<'loading' | 'login' | 'setup'>('loading');
  const [first, setFirst] = useState(false);
  const [code, setCode] = useState('');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    adminApi.status().then((s) => (setFirst(!s.hasPassword), setMode(s.hasPassword ? 'login' : 'setup'))).catch((e) => (setErr(e instanceof Error ? e.message : String(e)), setMode('login')));
  }, []);

  const run = async (f: () => Promise<{ token: string }>) => {
    setBusy(true);
    setErr('');
    try {
      session.set((await f()).token);
      onOk();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  const submitSetup = () => {
    if (p1.length < 8) return setErr('Le mot de passe doit avoir au moins 8 caractères.');
    if (p1 !== p2) return setErr('Les deux mots de passe ne sont pas identiques.');
    void run(() => adminApi.setup(code.trim(), p1));
  };

  return (
    <div className="mx-auto mt-6 max-w-md">
      <div className="card rise space-y-4 p-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-cyan-500 text-white shadow-glow"><Ic.Key className="h-7 w-7" /></span>
        {mode === 'loading' ? (
          <p className="text-center muted"><span className="spinner" /></p>
        ) : mode === 'login' ? (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bonjour !</h1>
              <p className="text-sm muted">Entrez votre mot de passe pour gérer vos voitures.</p>
            </div>
            <Field label="Mot de passe">
              <input className="input" type="password" autoComplete="current-password" value={p1} onChange={(e) => setP1(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && p1 && void run(() => adminApi.login(p1))} />
            </Field>
            <Err msg={err} />
            <button className="btn-primary w-full" disabled={!p1 || busy} onClick={() => void run(() => adminApi.login(p1))}>{busy ? <span className="spinner" /> : 'Entrer'}</button>
            <button className="block w-full text-center text-sm text-brand-700 underline dark:text-brand-300" onClick={() => (setMode('setup'), setErr(''), setP1(''))}>Mot de passe oublié ?</button>
          </>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{first ? 'Bienvenue !' : 'Nouveau mot de passe'}</h1>
              <p className="text-sm muted">{first ? 'Créez votre mot de passe personnel. Vous seul le connaîtrez.' : "Choisissez un nouveau mot de passe avec le code d'installation."}</p>
            </div>
            <Field label="Code d'installation (donné par la personne qui a créé le site)">
              <input className="input" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} />
            </Field>
            <Field label="Votre mot de passe (8 caractères minimum)">
              <input className="input" type="password" autoComplete="new-password" value={p1} onChange={(e) => setP1(e.target.value)} />
            </Field>
            <Field label="Répétez le mot de passe">
              <input className="input" type="password" autoComplete="new-password" value={p2} onChange={(e) => setP2(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitSetup()} />
            </Field>
            <Err msg={err} />
            <button className="btn-primary w-full" disabled={!code || !p1 || !p2 || busy} onClick={submitSetup}>{busy ? <span className="spinner" /> : 'Créer mon mot de passe'}</button>
            {!first && <button className="block w-full text-center text-sm text-brand-700 underline dark:text-brand-300" onClick={() => (setMode('login'), setErr(''))}>← Retour à la connexion</button>}
            <p className="text-xs muted">Votre mot de passe est enregistré sous forme chiffrée : personne ne peut le lire, pas même la personne qui a créé le site.</p>
          </>
        )}
      </div>
      <a className="mt-4 block text-center text-sm muted underline" href="/">← Retour au site</a>
    </div>
  );
}

function PasswordForm() {
  const [cur, setCur] = useState('');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const save = async () => {
    if (p1.length < 8) return setMsg({ ok: false, text: 'Le mot de passe doit avoir au moins 8 caractères.' });
    if (p1 !== p2) return setMsg({ ok: false, text: 'Les deux mots de passe ne sont pas identiques.' });
    setBusy(true);
    setMsg(null);
    try {
      session.set((await adminApi.changePassword(cur, p1)).token);
      setMsg({ ok: true, text: 'Mot de passe changé. Les autres appareils devront se reconnecter.' });
      setCur(''), setP1(''), setP2('');
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="card rise space-y-3 p-5">
      <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white"><Ic.Shield className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" /> Changer mon mot de passe</h2>
      <Field label="Mot de passe actuel"><input className="input" type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} /></Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nouveau mot de passe"><input className="input" type="password" autoComplete="new-password" value={p1} onChange={(e) => setP1(e.target.value)} /></Field>
        <Field label="Répétez"><input className="input" type="password" autoComplete="new-password" value={p2} onChange={(e) => setP2(e.target.value)} /></Field>
      </div>
      {msg && (msg.ok ? <p className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-300">{msg.text}</p> : <Err msg={msg.text} />)}
      <button className="btn-primary" disabled={!cur || !p1 || !p2 || busy} onClick={() => void save()}>{busy ? <span className="spinner" /> : 'Changer'}</button>
    </section>
  );
}

function CarForm({ initial, onSaved, onCancel }: { initial: Draft; onSaved: (d: Data) => void; onCancel: () => void }) {
  const [c, setC] = useState<Draft>(initial);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setC((x) => ({ ...x, [k]: v }));
  const num = (v: string) => (v === '' ? 0 : Math.max(0, Number(v.replace(/\s/g, '')) || 0));

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy('photo');
    setErr('');
    try {
      const urls: string[] = [];
      for (const f of [...files].slice(0, 10 - c.photos.length)) urls.push((await adminApi.uploadPhoto(await shrinkPhoto(f))).url);
      setC((x) => ({ ...x, photos: [...x.photos, ...urls] }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy('');
    }
  };
  const save = async () => {
    if (!c.name.trim()) return setErr('Donnez un nom à la voiture.');
    if (!c.pricePerDay) return setErr('Indiquez le prix par jour.');
    setBusy('save');
    setErr('');
    try {
      onSaved(await adminApi.saveCar({ ...c, priceWeekDay: c.priceWeekDay || undefined, availableFrom: c.status === 'available' ? undefined : c.availableFrom || undefined }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy('');
    }
  };
  const move = (i: number) => setC((x) => {
    const p = [...x.photos];
    [p[0], p[i]] = [p[i], p[0]];
    return { ...x, photos: p };
  });

  return (
    <section className="card rise space-y-4 p-4 sm:p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{c.id ? `Modifier : ${initial.name}` : 'Ajouter une voiture'}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label><span className="label">Nom (marque et modèle)</span><input className="input" placeholder="ex. Renault Symbol" value={c.name} onChange={(e) => set('name', e.target.value)} /></label>
        <label><span className="label">Année</span><input className="input" inputMode="numeric" value={c.year} onChange={(e) => set('year', num(e.target.value))} /></label>
        <label><span className="label">Prix par jour (DA)</span><input className="input" inputMode="numeric" value={c.pricePerDay || ''} onChange={(e) => set('pricePerDay', num(e.target.value))} /></label>
        <label><span className="label">Prix par jour dès 7 jours (DA, facultatif)</span><input className="input" inputMode="numeric" value={c.priceWeekDay || ''} onChange={(e) => set('priceWeekDay', num(e.target.value))} /></label>
        <label><span className="label">Caution (DA)</span><input className="input" inputMode="numeric" value={c.deposit || ''} onChange={(e) => set('deposit', num(e.target.value))} /></label>
        <label><span className="label">Places</span><input className="input" inputMode="numeric" value={c.seats} onChange={(e) => set('seats', Math.max(1, num(e.target.value)))} /></label>
        <label><span className="label">Type</span>
          <select className="input" value={c.category} onChange={(e) => set('category', e.target.value as Draft['category'])}>
            <option value="citadine">Citadine</option><option value="berline">Berline</option><option value="suv">SUV / 4x4</option><option value="utilitaire">Utilitaire</option>
          </select>
        </label>
        <label><span className="label">Boîte</span>
          <select className="input" value={c.transmission} onChange={(e) => set('transmission', e.target.value as Draft['transmission'])}>
            <option value="manual">Manuelle</option><option value="auto">Automatique</option>
          </select>
        </label>
        <label><span className="label">Carburant</span>
          <select className="input" value={c.fuel} onChange={(e) => set('fuel', e.target.value as Draft['fuel'])}>
            <option value="essence">Essence</option><option value="diesel">Diesel</option><option value="gpl">GPL</option>
          </select>
        </label>
        <label className="flex items-center gap-3 pt-6"><input type="checkbox" className="h-5 w-5 accent-emerald-500" checked={c.ac} onChange={(e) => set('ac', e.target.checked)} /> Climatisation</label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label><span className="label">Disponibilité</span>
          <select className="input" value={c.status} onChange={(e) => set('status', e.target.value as Draft['status'])}>
            <option value="available">Disponible</option><option value="rented">Louée</option><option value="maintenance">En réparation</option>
          </select>
        </label>
        {c.status !== 'available' && (
          <label><span className="label">Disponible à nouveau le (facultatif)</span><input className="input" type="date" value={c.availableFrom ?? ''} onChange={(e) => set('availableFrom', e.target.value)} /></label>
        )}
      </div>

      <label className="block"><span className="label">Conditions (une par ligne)</span>
        <textarea className="input min-h-[96px]" placeholder={'Kilométrage limité à 300 km/jour\nRendre avec le plein'} value={c.conditions} onChange={(e) => set('conditions', e.target.value)} />
      </label>
      <label className="block"><span className="label">Défauts ou limites à connaître (une par ligne)</span>
        <textarea className="input min-h-[80px]" placeholder="Petite rayure sur la porte arrière" value={c.issues} onChange={(e) => set('issues', e.target.value)} />
      </label>

      <div className="space-y-2">
        <span className="label">Photos (la première est la photo principale)</span>
        <div className="flex flex-wrap gap-2">
          {c.photos.map((p, i) => (
            <div key={p} className={`relative h-24 w-32 overflow-hidden rounded-xl border-2 ${i === 0 ? 'border-brand-500' : 'border-slate-200 dark:border-white/10'}`}>
              <img src={p} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1">
                {i > 0 ? <button className="rounded px-1.5 text-xs text-white" onClick={() => move(i)}>★ Principale</button> : <span className="px-1.5 text-xs text-white">★</span>}
                <button className="rounded px-1.5 text-xs text-white" aria-label="Retirer la photo" onClick={() => set('photos', c.photos.filter((x) => x !== p))}>✕</button>
              </div>
            </div>
          ))}
          {c.photos.length < 10 && (
            <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-sm text-slate-500 hover:border-brand-400 hover:bg-brand-500/5 dark:border-white/15 dark:text-slate-400">
              {busy === 'photo' ? <span className="spinner" /> : <><span className="text-2xl">+</span>Ajouter</>}
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => void upload(e.target.files)} />
            </label>
          )}
        </div>
      </div>

      <Err msg={err} />
      <div className="sticky bottom-3 z-10 grid grid-cols-2 gap-2 rounded-3xl glass p-2 shadow-2xl sm:static sm:flex sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
        <button className="btn-primary" disabled={!!busy} onClick={() => void save()}>{busy === 'save' ? <span className="spinner" /> : 'Enregistrer'}</button>
        <button className="btn" onClick={onCancel}>Annuler</button>
      </div>
    </section>
  );
}

function ShopForm({ shop, onSaved }: { shop: Shop; onSaved: (d: Data) => void }) {
  const [s, setS] = useState(shop);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const set = <K extends keyof Shop>(k: K, v: Shop[K]) => setS((x) => ({ ...x, [k]: v }));
  const save = async () => {
    setBusy(true);
    setMsg('');
    try {
      onSaved(await adminApi.saveShop({ ...s, whatsapp: s.whatsapp.replace(/\D/g, '') }));
      setMsg('Enregistré.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="card rise space-y-3 p-4 sm:p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Infos de l'agence</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label><span className="label">Nom de l'agence</span><input className="input" value={s.name} onChange={(e) => set('name', e.target.value)} /></label>
        <label><span className="label">Ville</span><input className="input" value={s.city} onChange={(e) => set('city', e.target.value)} /></label>
        <label><span className="label">Téléphone</span><input className="input" inputMode="tel" value={s.phone} onChange={(e) => set('phone', e.target.value)} /></label>
        <label><span className="label">WhatsApp (avec 213, sans le 0 ni +)</span><input className="input" inputMode="tel" placeholder="213555123456" value={s.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} /></label>
        <label className="sm:col-span-2"><span className="label">Adresse</span><input className="input" value={s.address} onChange={(e) => set('address', e.target.value)} /></label>
        <label className="sm:col-span-2"><span className="label">Horaires</span><input className="input" value={s.hours} onChange={(e) => set('hours', e.target.value)} /></label>
      </div>
      <label className="block"><span className="label">Conditions générales (une par ligne)</span><textarea className="input min-h-[110px]" value={s.rules} onChange={(e) => set('rules', e.target.value)} /></label>
      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={busy} onClick={() => void save()}>{busy ? <span className="spinner" /> : 'Enregistrer'}</button>
        {msg && <span className="text-sm muted">{msg}</span>}
      </div>
    </section>
  );
}

/** Example cars: add them to try the site, remove them before going live. The owner's own cars are never touched. */
function SampleCars({ onDone, onAuth }: { onDone: (d: Data) => void; onAuth: () => void }) {
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const run = async (what: 'add' | 'remove') => {
    if (what === 'remove' && !window.confirm("Retirer toutes les voitures d'exemple ? Vos propres voitures (et celles où vous avez ajouté vos photos) restent.")) return;
    setBusy(what);
    setMsg('');
    try {
      const d = await (what === 'add' ? adminApi.addSamples() : adminApi.removeSamples());
      onDone(d);
      setMsg(`${d.cars.length} voiture${d.cars.length > 1 ? 's' : ''} sur le site.`);
    } catch (e) {
      if (e instanceof AuthError) return onAuth();
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy('');
    }
  };
  return (
    <section className="card rise space-y-3 p-4 sm:p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Voitures d'exemple</h2>
      <p className="text-sm muted">Pour essayer le site avec beaucoup de voitures (environ 100, avec des images dessinées). À retirer avant d'ouvrir le site aux clients.</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button className="btn" disabled={!!busy} onClick={() => void run('add')}>{busy === 'add' ? <span className="spinner" /> : <><Ic.Plus /> Ajouter les voitures d'exemple</>}</button>
        <button className="btn-danger" disabled={!!busy} onClick={() => void run('remove')}>{busy === 'remove' ? <span className="spinner" /> : "Retirer les voitures d'exemple"}</button>
      </div>
      {msg && <p className="text-sm muted">{msg}</p>}
    </section>
  );
}

export function Admin() {
  const [logged, setLogged] = useState(!!session.get());
  const [data, setData] = useState<Data | null>(null);
  const [edit, setEdit] = useState<Draft | null>(null);
  const [tab, setTab] = useState<'cars' | 'shop' | 'security'>('cars');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (logged) getData().then(setData).catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, [logged]);
  // Any "session expired" answer sends the owner back to the login screen.
  useEffect(() => {
    const onErr = (e: PromiseRejectionEvent) => e.reason instanceof AuthError && setLogged(false);
    window.addEventListener('unhandledrejection', onErr);
    return () => window.removeEventListener('unhandledrejection', onErr);
  }, []);

  if (!logged) return <Auth onOk={() => setLogged(true)} />;
  if (err) return <p className="card p-5 text-red-600 dark:text-red-300">{err}</p>;
  if (!data) return <p className="p-6 muted"><span className="spinner" /> Chargement…</p>;

  const fail = (e: unknown) => {
    if (e instanceof AuthError) return setLogged(false);
    window.alert(e instanceof Error ? e.message : String(e));
  };
  const remove = async (c: Car) => {
    if (!window.confirm(`Retirer « ${c.name} ${c.year} » du site ? Ses photos seront supprimées.`)) return;
    try {
      setData(await adminApi.deleteCar(c.id));
    } catch (e) {
      fail(e);
    }
  };
  // Change availability straight from the list (the most frequent change).
  const quickStatus = async (c: Car, status: Car['status']) => {
    try {
      setData(await adminApi.saveCar({ ...c, status, availableFrom: status === 'available' ? undefined : c.availableFrom }));
    } catch (e) {
      fail(e);
    }
  };
  const saved = (d: Data) => {
    setData(d);
    setEdit(null);
    window.scrollTo({ top: 0 });
  };
  const tabCls = (on: boolean) => `chip ${on ? 'chip-on' : 'chip-off'}`;
  const free = data.cars.filter((c) => c.status === 'available').length;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bonjour 👋</h1>
          <p className="text-sm muted">{free} disponible{free > 1 ? 's' : ''} sur {data.cars.length} voiture{data.cars.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <a className="btn" href="/">Voir le site</a>
          <button className="btn" onClick={() => (session.clear(), setLogged(false))}>Se déconnecter</button>
        </div>
      </div>
      {data.sample && <p className="rounded-2xl bg-amber-500/10 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-500/30 dark:text-amber-200">Le site montre des voitures d'exemple. Modifiez-les ou retirez-les, et ajoutez les vôtres.</p>}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        <button className={tabCls(tab === 'cars')} onClick={() => (setTab('cars'), setEdit(null))}><Ic.Car className="h-4 w-4" /> Voitures ({data.cars.length})</button>
        <button className={tabCls(tab === 'shop')} onClick={() => setTab('shop')}><Ic.Info className="h-4 w-4" /> Agence</button>
        <button className={tabCls(tab === 'security')} onClick={() => setTab('security')}><Ic.Shield className="h-4 w-4" /> Mot de passe</button>
      </div>

      {tab === 'security' ? (
        <PasswordForm />
      ) : tab === 'shop' ? (
        <>
          <ShopForm shop={data.shop} onSaved={setData} />
          <SampleCars onDone={setData} onAuth={() => setLogged(false)} />
        </>
      ) : edit ? (
        <CarForm initial={edit} onSaved={saved} onCancel={() => setEdit(null)} />
      ) : (
        <>
          <button className="btn-primary w-full sm:w-auto" onClick={() => setEdit({ ...EMPTY })}><Ic.Plus /> Ajouter une voiture</button>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {data.cars.map((c, i) => (
              <li key={c.id} className="card rise space-y-3 p-3" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
                <div className="flex items-center gap-3">
                  <img src={c.photos[0]} alt="" className="h-16 w-20 shrink-0 rounded-2xl bg-slate-100 object-cover dark:bg-ink-800" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900 dark:text-white">{c.name} <span className="font-normal muted">{c.year}</span></p>
                    <p className="text-sm muted"><Money n={c.pricePerDay} /> / jour · caution <Money n={c.deposit} /></p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className={`min-h-[42px] min-w-0 flex-1 rounded-2xl border px-3 text-sm font-semibold ${c.status === 'available' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : c.status === 'rented' ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300' : 'border-slate-400/40 bg-slate-500/10 text-slate-700 dark:text-slate-300'}`}
                    value={c.status}
                    aria-label={`Disponibilité de ${c.name}`}
                    onChange={(e) => void quickStatus(c, e.target.value as Car['status'])}
                  >
                    <option value="available">● Disponible</option><option value="rented">● Louée</option><option value="maintenance">● Réparation</option>
                  </select>
                  <button className="btn !min-h-[42px] !px-3" onClick={() => setEdit({ ...c })}>Modifier</button>
                  <button className="btn-danger !min-h-[42px] !px-3" onClick={() => void remove(c)} aria-label={`Retirer ${c.name}`}>Retirer</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
