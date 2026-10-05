import { useState } from 'react';

export type Theme = 'light' | 'dark';
const KEY = 'cl.theme';

/** Light / dark mode: starts from the phone's setting, remembered once the visitor switches. */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'));
  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
    setTheme(next);
  };
  return { theme, toggle };
}
