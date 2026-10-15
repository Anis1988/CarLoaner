import type { ReactNode } from 'react';
import { useLang } from '../lib/i18n';

export interface DockItem {
  key: string;
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  /** An action instead of a place: drawn with a coloured round icon, never gets the sliding pill. */
  tone?: 'call' | 'wa';
}

const TONE = {
  call: 'bg-gradient-to-br from-brand-500 to-cyan-500 text-white shadow-glow dark:text-ink-950',
  wa: 'bg-[#25D366] text-white shadow-[0_8px_20px_-8px_rgba(37,211,102,.7)] dark:text-ink-950',
} as const;

/** Floating glass bar at the bottom of phones (thumb reach), with a pill that slides to the active place. Mirrors in Arabic. */
export function Dock({ items, active, label }: { items: DockItem[]; active: string | null; label: string }) {
  useLang(); // redraw when the language (and so the direction) changes
  const rtl = document.documentElement.dir === 'rtl';
  const idx = items.findIndex((x) => x.key === active && !x.tone);
  const n = items.length;
  return (
    <nav className="dock edge md:hidden" aria-label={label}>
      <span
        className="dock-pill bg-gradient-to-br from-brand-500/15 to-cyan-500/15 ring-1 ring-brand-500/30 dark:from-brand-400/20 dark:to-cyan-400/10 dark:ring-brand-300/25"
        style={{ width: `calc((100% - 0.75rem) / ${n})`, transform: `translateX(${(rtl ? -1 : 1) * Math.max(idx, 0) * 100}%)`, opacity: idx < 0 ? 0 : 1 }}
        aria-hidden="true"
      />
      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {items.map((it) => {
          const on = it.key === active && !it.tone;
          const cls = `dock-item tap ${on ? 'text-brand-700 dark:text-brand-200' : 'text-slate-600 dark:text-slate-300'} ${it.tone && !it.href && !it.onClick ? 'pointer-events-none opacity-40' : ''}`;
          const inner = (
            <>
              {it.tone ? <span className={`flex h-8 w-8 items-center justify-center rounded-full ${TONE[it.tone]}`}>{it.icon}</span> : <span className={`flex h-8 items-center justify-center transition-transform duration-300 ${on ? '-translate-y-px' : ''}`}>{it.icon}</span>}
              <span className="max-w-full truncate">{it.label}</span>
            </>
          );
          return it.href ? (
            <a key={it.key} className={cls} href={it.href} {...(it.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{inner}</a>
          ) : (
            <button key={it.key} type="button" className={cls} onClick={it.onClick} aria-current={on ? 'page' : undefined}>{inner}</button>
          );
        })}
      </div>
    </nav>
  );
}
