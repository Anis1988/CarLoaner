import { useEffect, useState } from 'react';
import { adminApi, getData, ownerPass, shrinkPhoto, type Data } from '../lib/api';
import type { Car, Shop } from '../lib/types';
import { money } from '../lib/i18n';

type Draft = Omit<Car, 'id' | 'updatedAt'> & { id?: string };
const EMPTY: Draft = {
  name: '', year: new Date().getFullYear(), category: 'berline', transmission: 'manual', fuel: 'essence', seats: 5, ac: true,
  pricePerDay: 0, deposit: 0, status: 'available', conditions: '', issues: '', photos: [],
};

function Login({ onOk }: { onOk: () => void }) {
  const [p, setP] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const submit = async () => {
    setBusy(true);
    setErr('');
    try {
      await adminApi.login(p);
      ownerPass.set(p);
      onOk();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="card mx-auto mt-10 max-w-sm space-y-3 p-5">
      <h1 className="text-xl font-bold">Espace propriétaire</h1>
      <p className="text-sm text-slate-600">Entrez le mot de passe pour ajouter, modifier ou retirer des voitures.</p>
      <input className="input" type="password" autoComplete="current-password" value={p} onChange={(e) => setP(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && p && void submit()} aria-label="Mot de passe" />
      {err && <p className="text-sm text-red-700">{err}</p>}
      <button className="btn-primary w-full" disabled={!p || busy} onClick={() => void submit()}>{busy ? <span className="spinner" /> : 'Entrer'}</button>
      <a className="block text-center text-sm text-slate-500 underline" href="/">← Retour au site</a>
    </div>
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
    <section className="card space-y-4 p-4 sm:p-5">
      <h2 className="text-xl font-bold">{c.id ? `Modifier : ${initial.name}` : 'Ajouter une voiture'}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
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
        <label className="flex items-center gap-3 pt-6"><input type="checkbox" className="h-5 w-5 accent-brand-600" checked={c.ac} onChange={(e) => set('ac', e.target.checked)} /> Climatisation</label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
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
            <div key={p} className={`relative h-24 w-32 overflow-hidden rounded-xl border-2 ${i === 0 ? 'border-brand-600' : 'border-slate-200'}`}>
              <img src={p} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1">
                {i > 0 ? <button className="rounded px-1.5 text-xs text-white" onClick={() => move(i)}>★ Principale</button> : <span className="px-1.5 text-xs text-white">★</span>}
                <button className="rounded px-1.5 text-xs text-white" aria-label="Retirer la photo" onClick={() => set('photos', c.photos.filter((x) => x !== p))}>✕</button>
              </div>
            </div>
          ))}
          {c.photos.length < 10 && (
            <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-sm text-slate-500 hover:bg-slate-50">
              {busy === 'photo' ? <span className="spinner" /> : <><span className="text-2xl">+</span>Ajouter</>}
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => void upload(e.target.files)} />
            </label>
          )}
        </div>
      </div>

      {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
      <div className="flex flex-wrap gap-2">
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
    <section className="card space-y-3 p-4 sm:p-5">
      <h2 className="text-xl font-bold">Infos de l'agence</h2>
      <div className="grid gap-3 sm:grid-cols-2">
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
        {msg && <span className="text-sm text-slate-600">{msg}</span>}
      </div>
    </section>
  );
}

export function Admin() {
  const [logged, setLogged] = useState(!!ownerPass.get());
  const [data, setData] = useState<Data | null>(null);
  const [edit, setEdit] = useState<Draft | null>(null);
  const [tab, setTab] = useState<'cars' | 'shop'>('cars');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (logged) getData().then(setData).catch((e) => setErr(e instanceof Error ? e.message : String(e)));
  }, [logged]);

  if (!logged) return <Login onOk={() => setLogged(true)} />;
  if (err) return <p className="card p-4 text-red-700">{err}</p>;
  if (!data) return <p className="p-6 text-slate-500"><span className="spinner" /> Chargement…</p>;

  const remove = async (c: Car) => {
    if (!window.confirm(`Retirer « ${c.name} ${c.year} » du site ? Ses photos seront supprimées.`)) return;
    try {
      setData(await adminApi.deleteCar(c.id));
    } catch (e) {
      window.alert(e instanceof Error ? e.message : String(e));
    }
  };
  // Change availability straight from the list (the most frequent change).
  const quickStatus = async (c: Car, status: Car['status']) => {
    try {
      setData(await adminApi.saveCar({ ...c, status, availableFrom: status === 'available' ? undefined : c.availableFrom }));
    } catch (e) {
      window.alert(e instanceof Error ? e.message : String(e));
    }
  };
  const saved = (d: Data) => {
    setData(d);
    setEdit(null);
    window.scrollTo({ top: 0 });
  };
  const tabCls = (on: boolean) => `chip ${on ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white text-slate-700'}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Espace propriétaire</h1>
        <div className="flex gap-2">
          <a className="btn" href="/">Voir le site</a>
          <button className="btn" onClick={() => (ownerPass.clear(), setLogged(false))}>Se déconnecter</button>
        </div>
      </div>
      {data.sample && <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200">Le site montre des voitures d'exemple. Dès votre premier enregistrement, ce sont vos données qui s'affichent (les exemples restent jusqu'à ce que vous les retiriez).</p>}
      <div className="flex gap-2">
        <button className={tabCls(tab === 'cars')} onClick={() => setTab('cars')}>Voitures ({data.cars.length})</button>
        <button className={tabCls(tab === 'shop')} onClick={() => setTab('shop')}>Infos de l'agence</button>
      </div>

      {tab === 'shop' ? (
        <ShopForm shop={data.shop} onSaved={setData} />
      ) : edit ? (
        <CarForm initial={edit} onSaved={saved} onCancel={() => setEdit(null)} />
      ) : (
        <>
          <button className="btn-primary" onClick={() => setEdit({ ...EMPTY })}>+ Ajouter une voiture</button>
          <ul className="space-y-2">
            {data.cars.map((c) => (
              <li key={c.id} className="card flex items-center gap-3 p-3">
                <img src={c.photos[0]} alt="" className="h-16 w-20 shrink-0 rounded-lg bg-slate-100 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{c.name} <span className="font-normal text-slate-500">{c.year}</span></p>
                  <p className="text-sm text-slate-600">{money(c.pricePerDay, 'fr')} / jour</p>
                  <select
                    className={`mt-1 max-w-full rounded-lg border px-2 py-1 text-sm font-medium ${c.status === 'available' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : c.status === 'rented' ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-300 bg-slate-100 text-slate-700'}`}
                    value={c.status}
                    aria-label={`Disponibilité de ${c.name}`}
                    onChange={(e) => void quickStatus(c, e.target.value as Car['status'])}
                  >
                    <option value="available">● Disponible</option><option value="rented">● Louée</option><option value="maintenance">● En réparation</option>
                  </select>
                </div>
                <div className="flex w-[92px] shrink-0 flex-col gap-1.5 sm:w-auto sm:flex-row">
                  <button className="btn !min-h-[38px]" onClick={() => setEdit({ ...c })}>Modifier</button>
                  <button className="btn-danger !min-h-[38px]" onClick={() => void remove(c)}>Retirer</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
