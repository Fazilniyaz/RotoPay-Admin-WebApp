// lib/format.ts
// Global formatters driven by the user's saved settings (currency / date / time).
// Pure functions read the settings store snapshot, so any page that (re)renders
// picks up the latest preferences — making currency/date/time formatting global.
import { settingsStore } from '@/store/settingsStore';

const SYMBOLS: Record<string, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  JPY: '¥',
  AED: 'د.إ',
};

export const CURRENCIES = Object.keys(SYMBOLS);

export function currencySymbol(code?: string): string {
  const c = code ?? settingsStore.getState().currency;
  return SYMBOLS[c] ?? `${c} `;
}

// Money — symbol + grouped number (2dp only when needed).
export function money(n?: number | null): string {
  const v = n ?? 0;
  const str = Number.isInteger(v) ? v.toLocaleString() : v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${currencySymbol()}${str}`;
}

// Money formatted in a specific currency code (e.g. the native currency). Always
// shows 2dp — conversions are rarely whole numbers.
export function moneyIn(code: string, n?: number | null): string {
  const v = n ?? 0;
  return `${currencySymbol(code)}${v.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const localeFor = (f: string) => (f === 'MM/DD/YYYY' ? 'en-US' : f === 'YYYY-MM-DD' ? 'sv-SE' : 'en-GB');

// Numeric date in the user's chosen format (e.g. 01/07/2025).
export function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(localeFor(settingsStore.getState().dateFormat), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Short, friendly date that still honours the locale (e.g. 1 Jul 2025 / Jul 1, 2025).
export function fmtDateShort(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(localeFor(settingsStore.getState().dateFormat), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Relative "time ago" for the activity feed (e.g. "5 minutes ago", "Yesterday").
export function timeAgo(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 45) return 'Just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  const day = Math.round(hr / 24);
  if (day === 1) return 'Yesterday';
  if (day < 7) return `${day} days ago`;
  return fmtDateShort(iso);
}

export function fmtTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: settingsStore.getState().timeFormat === '12h',
  });
}
