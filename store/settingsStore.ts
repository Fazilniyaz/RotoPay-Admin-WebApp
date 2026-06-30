import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';

export interface SettingsState {
  displayName: string;
  email: string;
  currency: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
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
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      loaded: false,
      setSettings: (s) => set(s),
    }),
    { name: 'rotapay-settings' }
  )
);
