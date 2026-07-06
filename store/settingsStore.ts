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
  // The default employee id (scopes calendar/earnings/reports). Null → the user
  // has no employees yet and must complete onboarding.
  defaultEmployerId: string | null;
  loaded: boolean;
  setSettings: (s: Partial<SettingsState>) => void;
  /** Reset to defaults on logout so no profile data leaks into the next session. */
  reset: () => void;
}

const DEFAULTS = {
  displayName: '',
  email: '',
  currency: 'GBP',
  nativeCurrency: 'GBP',
  dateFormat: 'DD/MM/YYYY' as DateFormat,
  timeFormat: '12h' as TimeFormat,
  reportMonths: 1,
  clockInType: 'automatic' as ClockInType,
  defaultEmployerId: null as string | null,
  loaded: false,
};

// Persisted so global formatters have the user's preferences instantly on load,
// before the /api/settings fetch resolves.
export const settingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setSettings: (s) => set(s),
      reset: () => set(DEFAULTS),
    }),
    { name: 'rotapay-settings' }
  )
);
