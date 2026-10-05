import type { ReactNode } from 'react';

const I = ({ children, className = 'h-5 w-5' }: { children: ReactNode; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{children}</svg>
);
type P = { className?: string };
export const Phone = (p: P) => <I {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></I>;
export const Chat = (p: P) => <I {...p}><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5Z" /><path d="M9 10h.01M12 10h.01M15 10h.01" /></I>;
export const Key = (p: P) => <I {...p}><circle cx="8" cy="15" r="4" /><path d="m10.8 12.2 8.7-8.7M17 6l2.5 2.5M14.5 8.5 17 11" /></I>;
export const Sun = (p: P) => <I {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></I>;
export const Moon = (p: P) => <I {...p}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" /></I>;
export const Car = (p: P) => <I {...p}><path d="M5 17h14v-4l-2-5H7l-2 5v4Z" /><path d="M3 13h18M7 17v2M17 17v2" /><circle cx="7.5" cy="13.5" r=".5" /><circle cx="16.5" cy="13.5" r=".5" /></I>;
export const Info = (p: P) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></I>;
export const Close = (p: P) => <I {...p}><path d="M6 6l12 12M18 6 6 18" /></I>;
export const Gear = (p: P) => <I {...p}><circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M5.6 5.6 7 7M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4 7 17M17 7l1.4-1.4" /></I>;
export const Fuel = (p: P) => <I {...p}><path d="M4 20V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15M3 20h12M14 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-3-3M7 8h4" /></I>;
export const Seat = (p: P) => <I {...p}><path d="M7 4v9a2 2 0 0 0 2 2h7l2 5M7 13h9M9 4h0" /><circle cx="9" cy="4" r="1" /></I>;
export const Snow = (p: P) => <I {...p}><path d="M12 2v20M4.9 7l14.2 10M19.1 7 4.9 17M9 4l3 2 3-2M9 20l3-2 3 2" /></I>;
export const Calendar = (p: P) => <I {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></I>;
export const Shield = (p: P) => <I {...p}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></I>;
export const Cash = (p: P) => <I {...p}><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 9v.01M18 15v.01" /></I>;
export const Warn = (p: P) => <I {...p}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4M12 17h.01" /></I>;
export const Pin = (p: P) => <I {...p}><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></I>;
export const Clock = (p: P) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></I>;
export const Back = (p: P) => <I {...p}><path d="M15 6l-6 6 6 6" /></I>;
export const Plus = (p: P) => <I {...p}><path d="M12 5v14M5 12h14" /></I>;
export const Sort = (p: P) => <I {...p}><path d="M7 4v16M4 17l3 3 3-3M14 6h7M14 12h5M14 18h3" /></I>;
