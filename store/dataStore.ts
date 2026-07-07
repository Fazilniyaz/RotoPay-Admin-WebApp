// store/dataStore.ts
// ─────────────────────────────────────────────
// Central client-side data cache for the whole dashboard.
//
// The problem it solves: every page used to fetch its own shifts / wages /
// employers / calendar / clock data on mount, so navigating between pages meant
// re-hitting the API and staring at a spinner each time. This store fetches ALL
// module data ONCE right after login (see `useDataSync`, mounted in
// DashboardLayout), keeps it in memory, and lets every page render instantly
// from the cache while a silent background refresh keeps it fresh.
//
// On logout the whole cache is wiped via `clear()` so no user's data ever bleeds
// into the next session. It is deliberately NOT persisted to localStorage — an
// in-memory cache is both faster and safer (nothing to leak on a shared device).
// ─────────────────────────────────────────────
import { create } from 'zustand';
import { Shift, Employer, Salary, CalendarEntry, ClockSession } from '@/lib/types';
import { listShifts, getShiftAnalytics, ShiftAnalytics } from '@/lib/services/shifts';
import { listEmployers, setDefaultEmployer as apiSetDefaultEmployer } from '@/lib/services/employers';
import { listSalaries } from '@/lib/services/salaries';
import { listCalendar } from '@/lib/services/calendar';
import { listClock } from '@/lib/services/clock';
import { listPaidMonths, PaidMonth } from '@/lib/services/payments';
import { settingsStore } from '@/store/settingsStore';

// A generous calendar window so the dashboard (which looks a couple of months
// back and ~2 months ahead) and the calendar page both have data to show
// without an extra request. Pages needing more can call refreshCalendar().
const CAL_BACK_MONTHS = 6;
const CAL_FWD_MONTHS = 6;
function calendarWindow(): { from: string; to: string } {
  const from = new Date();
  from.setMonth(from.getMonth() - CAL_BACK_MONTHS);
  const to = new Date();
  to.setMonth(to.getMonth() + CAL_FWD_MONTHS);
  return { from: from.toISOString(), to: to.toISOString() };
}

interface DataState {
  shifts: Shift[];
  employers: Employer[];
  wages: Salary[];
  calendar: CalendarEntry[];
  clock: ClockSession[];
  paidMonths: PaidMonth[];
  analytics: ShiftAnalytics | null;

  // The employee currently scoping calendar / earnings / reports. Null → the
  // user has no employees yet (onboarding must complete first).
  defaultEmployerId: string | null;

  // `loaded` flips true after the first successful loadAll — pages use it to
  // decide between "render cache now" and "show the first-load skeleton".
  loaded: boolean;
  loading: boolean;

  /** Fetch every module in parallel. No-op if already loaded unless force=true. */
  loadAll: (opts?: { force?: boolean }) => Promise<void>;

  // Targeted refreshers — call after a create/update/delete so only the
  // affected slice re-fetches instead of everything.
  refreshShifts: () => Promise<void>;
  refreshWages: () => Promise<void>;
  refreshEmployers: () => Promise<void>;
  refreshCalendar: () => Promise<void>;
  refreshClock: () => Promise<void>;
  refreshPaidMonths: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;

  /**
   * Make an employee the default and re-scope everything to them. The calendar,
   * earnings and paid-months all follow the default employee, so switching it
   * refreshes exactly those slices (+ employers, for the badge).
   */
  setDefaultEmployer: (employerId: string) => Promise<void>;

  /** Wipe the whole cache — called on logout / account deletion. */
  clear: () => void;
}

const EMPTY = {
  shifts: [] as Shift[],
  employers: [] as Employer[],
  wages: [] as Salary[],
  calendar: [] as CalendarEntry[],
  clock: [] as ClockSession[],
  paidMonths: [] as PaidMonth[],
  analytics: null as ShiftAnalytics | null,
  defaultEmployerId: null as string | null,
};

export const dataStore = create<DataState>((set, get) => ({
  ...EMPTY,
  loaded: false,
  loading: false,

  loadAll: async (opts) => {
    if (get().loading) return;
    if (get().loaded && !opts?.force) return;
    set({ loading: true });
    const win = calendarWindow();
    try {
      const [shiftRes, empRes, wageRes, cal, clockRes, paid, analytics] = await Promise.all([
        listShifts({ limit: 500 }),
        listEmployers({ limit: 200 }),
        listSalaries({ limit: 500 }),
        listCalendar(win),
        listClock({ limit: 200 }),
        listPaidMonths(),
        getShiftAnalytics().catch(() => null),
      ]);
      set({
        shifts: shiftRes.data,
        employers: empRes.data,
        wages: wageRes.data,
        calendar: cal,
        clock: clockRes.data,
        paidMonths: paid,
        analytics,
        defaultEmployerId: empRes.defaultEmployerId ?? null,
        loaded: true,
        loading: false,
      });
    } catch {
      // Keep whatever we had; just release the loading latch so a later call
      // (or a page-level refresh) can retry.
      set({ loading: false });
    }
  },

  refreshShifts: async () => {
    const res = await listShifts({ limit: 500 });
    set({ shifts: res.data });
  },
  refreshWages: async () => {
    const res = await listSalaries({ limit: 500 });
    set({ wages: res.data });
  },
  refreshEmployers: async () => {
    const res = await listEmployers({ limit: 200 });
    set({ employers: res.data, defaultEmployerId: res.defaultEmployerId ?? null });
  },
  refreshCalendar: async () => {
    const cal = await listCalendar(calendarWindow());
    set({ calendar: cal });
  },
  refreshClock: async () => {
    const res = await listClock({ limit: 200 });
    set({ clock: res.data });
  },
  refreshPaidMonths: async () => {
    set({ paidMonths: await listPaidMonths() });
  },
  refreshAnalytics: async () => {
    set({ analytics: await getShiftAnalytics().catch(() => null) });
  },

  setDefaultEmployer: async (employerId) => {
    // The critical call — if this throws, the switch genuinely failed.
    await apiSetDefaultEmployer(employerId);
    // Reflect the new default immediately, then re-pull everything it scopes.
    set({ defaultEmployerId: employerId });
    settingsStore.getState().setSettings({ defaultEmployerId: employerId });
    // Refreshes are best-effort: a failing refresh must NOT make a successful
    // switch look like it failed.
    await Promise.allSettled([
      get().refreshEmployers(),
      get().refreshCalendar(),
      get().refreshAnalytics(),
      get().refreshPaidMonths(),
    ]);
  },

  clear: () => set({ ...EMPTY, loaded: false, loading: false }),
}));
