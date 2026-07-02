import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';
export type ClockInType = 'automatic' | 'manual';

export interface SettingsState {
  displayName: string;
  email: string;
  currency: string; // global currency (used app-wide)
  nativeCurrency: string; // home currency (for the "Native Pay" figure)
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  reportMonths: number; // report export window (1–3)
  clockInType: ClockInType; // automatic (default) | manual
  loaded: boolean;
  setSettings: (s: Partial<SettingsState>) => void;
}

// Persisted so global formatters have the user's preferences instantly on load,
// before the /api/settings fetch resolves.
export const settingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      displayName: '',
      email: '',
      currency: 'GBP',
      nativeCurrency: 'GBP',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      reportMonths: 1,
      clockInType: 'automatic',
      loaded: false,
      setSettings: (s) => set(s),
    }),
    { name: 'rotapay-settings' }
  )
);
