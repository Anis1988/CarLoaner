import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '../lib/i18n';
import * as Ic from './Icons';

/**
 * Photo gallery: swipe on phones, big arrows everywhere, "2 / 5" counter, tappable thumbnails,
 * keyboard arrows on computers. Each photo is shown whole (never cropped) over a blurred copy of itself.
 */
export function Gallery({ photos, alt, full = false, start = 0, keys = true, onIndex, onOpenFull }: {
  photos: string[];
  alt: string;
  full?: boolean; // full-screen viewer
  start?: number;
  keys?: boolean; // react to the keyboard arrows (off while the full-screen viewer is open)
  onIndex?: (i: number) => void;
  onOpenFull?: (i: number) => void;
}) {
  const { t, lang } = useLang();
  const strip = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(start);
  const many = photos.length > 1;
  const rtl = lang === 'ar';

  const goTo = useCallback((n: number, smooth = true) => {
    const el = strip.current;
    if (!el) return;
    const k = Math.max(0, Math.min(photos.length - 1, n));
    el.scrollTo({ left: (rtl ? -1 : 1) * k * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
    setI(k);
  }, [photos.length, rtl]);

  useEffect(() => goTo(start, false), [start, goTo]);
  useEffect(() => onIndex?.(i), [i, onIndex]);
  useEffect(() => {
    if (!many || !keys) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const forward = (e.key === 'ArrowRight') !== rtl;
      goTo(i + (forward ? 1 : -1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [i, many, keys, rtl, goTo]);

  const onScroll = () => {
    const el = strip.current;
    if (el) setI(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
  };

  const arrow = (side: 'prev' | 'next') => {
    const disabled = side === 'prev' ? i === 0 : i === photos.length - 1;
    return (
      <button
        type="button"
        onClick={(e) => (e.stopPropagation(), goTo(i + (side === 'next' ? 1 : -1)))}
        disabled={disabled}
        aria-label={side === 'next' ? t.nextPhoto : t.prevPhoto}
        className={`absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg ring-1 ring-black/5 backdrop-blur transition hover:scale-110 active:scale-95 disabled:pointer-events-none disabled:opacity-0 dark:bg-ink-900/85 dark:text-white dark:ring-white/10 ${side === 'prev' ? 'start-3' : 'end-3'}`}
      >
        <Ic.Back className={`h-6 w-6 ${(side === 'next') !== rtl ? 'rotate-180' : ''}`} />
      </button>
    );
  };

  return (
    <div className={full ? 'flex h-full flex-col' : ''}>
      <div className={`relative overflow-hidden bg-slate-900 ${full ? 'min-h-0 flex-1' : 'aspect-[4/3]'}`}>
        <div ref={strip} onScroll={onScroll} className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain">
          {photos.map((p, n) => (
            <button
              type="button"
              key={p + n}
              onClick={() => onOpenFull?.(n)}
              className={`relative h-full w-full shrink-0 snap-center overflow-hidden ${onOpenFull ? 'cursor-zoom-in' : 'cursor-default'}`}
              aria-label={onOpenFull ? `${t.photoOf(n + 1, photos.length)} · ${t.fullscreen}` : t.photoOf(n + 1, photos.length)}
              tabIndex={onOpenFull ? 0 : -1}
            >
              {/* blurred copy fills the frame, the real photo sits on top, whole */}
              <img src={p} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
              <img src={p} alt={`${alt} – ${t.photoOf(n + 1, photos.length)}`} loading={n === 0 ? 'eager' : 'lazy'} decoding="async" draggable={false} className={`relative h-full w-full select-none object-contain ${n === 0 && !full ? 'zoom-in' : ''}`} />
            </button>
          ))}
        </div>
        {many && arrow('prev')}
        {many && arrow('next')}
        {many && <span className="pointer-events-none absolute bottom-3 start-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur"><bdi dir="ltr">{i + 1} / {photos.length}</bdi></span>}
        {onOpenFull && <span className="pointer-events-none absolute bottom-3 end-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur"><Ic.Expand className="h-4 w-4" /></span>}
      </div>
      {many && (
        <div className={`no-scrollbar flex gap-2 overflow-x-auto p-2 ${full ? 'justify-center bg-black' : 'bg-slate-100 dark:bg-ink-800'}`}>
          {photos.map((p, n) => (
            <button
              type="button"
              key={p + n}
              onClick={() => goTo(n)}
              aria-label={t.photoOf(n + 1, photos.length)}
              aria-current={n === i}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition ${n === i ? 'scale-105 ring-brand-500' : 'opacity-70 ring-transparent hover:opacity-100'}`}
            >
              <img src={p} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Full-screen photo viewer (tap a photo in the details). */
export function Lightbox({ photos, alt, start, onClose }: { photos: string[]; alt: string; start: number; onClose: () => void }) {
  const { t } = useLang();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (e.stopPropagation(), onClose());
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);
  // Drawn at the top of the page (not inside the sliding details panel), so it really fills the screen.
  return createPortal(
    <div data-lightbox className="fade fixed inset-0 z-[60] bg-black" role="dialog" aria-modal="true" aria-label={alt}>
      <button className="absolute end-3 top-3 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25" style={{ marginTop: 'env(safe-area-inset-top)' }} onClick={onClose} aria-label={t.close}><Ic.Close className="h-6 w-6" /></button>
      <div className="h-full" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <Gallery photos={photos} alt={alt} full start={start} />
      </div>
    </div>,
    document.body,
  );
}
