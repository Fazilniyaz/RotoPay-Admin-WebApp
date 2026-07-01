'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Play,
  Square,
  Clock as ClockIcon,
  Wallet,
  Timer,
  Loader2,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { ClockSession, Salary } from '@/lib/types';
import { listSalaries } from '@/lib/services/salaries';
import { getActiveClocks, clockIn, clockOut, listClock } from '@/lib/services/clock';
import { money, currencySymbol, fmtDateShort as fmtDate, fmtTime } from '@/lib/format';

const GRADIENT = 'linear-gradient(135deg, #005ea3 0%, #006d30 100%)';
const primaryStyle = { background: GRADIENT };
const cardCls =
  'bg-white dark:bg-[#1f2937] rounded-[10px] border border-[rgba(0,94,163,0.08)] dark:border-[rgba(160,201,255,0.08)] shadow-[0_4px_6px_rgba(0,123,210,0.06),0_2px_4px_rgba(0,123,210,0.04)]';

const pad = (n: number) => String(n).padStart(2, '0');
const fmtElapsed = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};
const initials = (name?: string | null) =>
  (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

const salaryLabel = (s: Salary) => {
  const emp = s.employer?.employerName ?? 'Unknown';
  const when = s.shift?.date ? fmtDate(s.shift.date) : 'no shift';
  const rate = s.hourlyPayRate != null ? `${currencySymbol()}${s.hourlyPayRate}/h` : '—';
  return `${emp} · ${when} · ${rate}`;
};

export default function ClockPage() {
  const [active, setActive] = useState<ClockSession[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [sessions, setSessions] = useState<ClockSession[]>([]);
  const [summary, setSummary] = useState({ totalHours: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedSalaryId, setSelectedSalaryId] = useState('');
  const [busyIn, setBusyIn] = useState(false);
  const [busyOut, setBusyOut] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [act, salRes, hist] = await Promise.all([
        getActiveClocks(),
        listSalaries({ limit: 100 }),
        listClock({ status: 'completed', limit: 50 }),
      ]);
      setActive(act);
      setSalaries(salRes.data);
      setSessions(hist.data);
      setSummary({
        totalHours: hist.meta?.summary?.totalHours ?? 0,
        totalEarnings: hist.meta?.summary?.totalEarnings ?? 0,
      });
    } catch {
      toast.error('Failed to load clock data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const activeSalaryIds = useMemo(() => new Set(active.map((a) => a.salaryId)), [active]);
  const clockable = useMemo(
    () => salaries.filter((s) => s.employer && s.shift && !activeSalaryIds.has(s.id)),
    [salaries, activeSalaryIds]
  );

  // Live total of everything currently running (for the hero stat).
  const liveEarnings = useMemo(
    () =>
      active.reduce((sum, s) => {
        const ms = now.getTime() - new Date(s.clockInTime).getTime();
        return sum + (ms / 3_600_000) * (s.salary?.hourlyPayRate ?? 0);
      }, 0),
    [active, now]
  );

  const doClockIn = async () => {
    if (!selectedSalaryId) {
      toast.error('Select an employer/shift to clock in');
      return;
    }
    setBusyIn(true);
    try {
      await clockIn(selectedSalaryId);
      toast.success('Clocked in');
      setSelectedSalaryId('');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Clock in failed');
    } finally {
      setBusyIn(false);
    }
  };

  const doClockOut = async (id: string) => {
    setBusyOut(id);
    try {
      const done = await clockOut(id);
      toast.success(`Clocked out · ${money(done.earnings)} earned`);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Clock out failed');
      setBusyOut(null);
    }
  };

  const currentTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const currentDate = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const stats = [
    { label: 'On The Clock', value: String(active.length), icon: Zap },
    { label: 'Total Hours', value: `${summary.totalHours}h`, icon: ClockIcon },
    { label: 'Total Earnings', value: money(summary.totalEarnings), icon: Wallet },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-[#005ea3]">Time Clock</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track worked hours &amp; earnings in real time</p>
        </div>

        {/* Gradient hero: live clock + clock-in control */}
        <div
          className="relative overflow-hidden rounded-[10px] p-6 sm:p-8 text-white shadow-[0_8px_24px_rgba(0,94,163,0.25)]"
          style={primaryStyle}
        >
          <div className="absolute -right-12 -top-14 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-20 w-52 h-52 rounded-full bg-[#6aff90]/15 blur-2xl pointer-events-none" />

          <div className="relative grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            {/* Live clock */}
            <div className="text-center lg:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                {currentDate}
              </p>
              <p className="font-mono text-5xl sm:text-6xl font-bold tracking-tight mt-1">
                {currentTime}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-white/80">
                <TrendingUp className="h-3.5 w-3.5" />
                {active.length > 0
                  ? `${active.length} on the clock · ≈ ${money(liveEarnings)} accruing`
                  : 'No one is currently clocked in'}
              </div>
            </div>

            {/* Clock-in control */}
            <div className="rounded-[10px] bg-white/10 backdrop-blur-sm border border-white/15 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2">
                Clock someone in
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <select
                  value={selectedSalaryId}
                  onChange={(e) => setSelectedSalaryId(e.target.value)}
                  className="flex-1 rounded-md px-3.5 py-3 text-sm text-[#1b1c1c] bg-white outline-none"
                  disabled={clockable.length === 0}
                >
                  <option value="">
                    {clockable.length === 0 ? 'No employees available' : 'Select employer / shift…'}
                  </option>
                  {clockable.map((s) => (
                    <option key={s.id} value={s.id}>
                      {salaryLabel(s)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={doClockIn}
                  disabled={busyIn || clockable.length === 0}
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#005ea3] px-6 py-3 rounded-md text-[12px] font-bold uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {busyIn ? '…' : 'Clock In'}
                </button>
              </div>
              {clockable.length === 0 && active.length === 0 && (
                <p className="text-[11px] text-white/70 mt-2">
                  Assign an employer &amp; salary to a shift first, then clock into it.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className={`${cardCls} p-4 sm:p-5`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.07em] text-[#707783] dark:text-gray-400 mb-1">
                      {c.label}
                    </p>
                    <p className="font-mono text-lg sm:text-2xl font-medium text-[#005ea3] dark:text-[#a0c9ff] truncate">
                      {c.value}
                    </p>
                  </div>
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={primaryStyle}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={2} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[160px] text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            {/* Active live cards */}
            {active.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#707783] dark:text-gray-400 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-glow" />
                  Currently Clocked In
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {active.map((s) => {
                    const elapsedMs = now.getTime() - new Date(s.clockInTime).getTime();
                    const rate = s.salary?.hourlyPayRate ?? 0;
                    const est = Math.round((elapsedMs / 3_600_000) * rate * 100) / 100;
                    const name = s.salary?.employer?.employerName ?? 'Shift';
                    return (
                      <div key={s.id} className={`${cardCls} overflow-hidden`}>
                        <div className="h-1 w-full" style={primaryStyle} />
                        <div className="p-5">
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
                                style={primaryStyle}
                              >
                                {initials(name)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-[#1b1c1c] dark:text-white truncate">
                                  {name}
                                </p>
                                <p className="text-[11px] text-[#707783] dark:text-gray-400 truncate">
                                  {s.salary?.shift?.date ? fmtDate(s.salary.shift.date) : 'No shift'} · in{' '}
                                  {fmtTime(s.clockInTime)}
                                </p>
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 flex-shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-glow" />
                              Live
                            </span>
                          </div>

                          <p className="font-mono text-4xl font-bold text-center text-[#1b1c1c] dark:text-white tracking-tight">
                            {fmtElapsed(elapsedMs)}
                          </p>

                          <div className="grid grid-cols-2 rounded-md bg-[#005ea3]/[0.04] dark:bg-white/5 border border-[#005ea3]/[0.06] dark:border-white/5 p-2.5 my-4">
                            <div className="text-center">
                              <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-[#707783] dark:text-gray-400 mb-0.5">
                                Est. Pay
                              </p>
                              <p className="font-mono text-sm font-semibold text-[#006d30] dark:text-emerald-400">
                                {money(est)}
                              </p>
                            </div>
                            <div className="text-center border-l border-[#005ea3]/[0.06] dark:border-white/5">
                              <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-[#707783] dark:text-gray-400 mb-0.5">
                                Rate
                              </p>
                              <p className="font-mono text-sm font-semibold text-[#005ea3] dark:text-[#a0c9ff]">
                                {currencySymbol()}{rate}/h
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => doClockOut(s.id)}
                            disabled={busyOut === s.id}
                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-md text-[11px] font-bold uppercase tracking-widest text-white bg-[#b3261e] hover:bg-[#9b1f18] transition-colors disabled:opacity-60"
                          >
                            <Square className="h-3.5 w-3.5 fill-current" />
                            {busyOut === s.id ? 'Clocking out…' : 'Clock Out'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* History */}
            <div className={`${cardCls} p-5 sm:p-6`}>
              <h3 className="font-bold text-[#1b1c1c] dark:text-white mb-4 flex items-center gap-2">
                <Timer className="h-4 w-4 text-[#005ea3]" /> Recent Sessions
              </h3>

              {sessions.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No completed sessions yet.</p>
              ) : (
                <>
                  {/* Desktop table */}
                  <table className="w-full hidden sm:table">
                    <thead>
                      <tr className="border-b border-[#005ea3]/[0.08] dark:border-white/10">
                        {['Employer', 'Date', 'In', 'Out', 'Hours', 'Earnings'].map((h, i) => (
                          <th
                            key={h}
                            className={`pb-3 text-[10px] font-bold uppercase tracking-[0.07em] text-[#707783] dark:text-gray-400 ${
                              i >= 4 ? 'text-right' : 'text-left'
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s) => {
                        const name = s.salary?.employer?.employerName ?? 'Shift';
                        return (
                          <tr
                            key={s.id}
                            className="border-b border-[#005ea3]/[0.05] dark:border-white/5 last:border-0"
                          >
                            <td className="py-3">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                                  style={primaryStyle}
                                >
                                  {initials(name)}
                                </div>
                                <span className="font-semibold text-sm text-[#1b1c1c] dark:text-white">
                                  {name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-sm text-[#707783] dark:text-gray-400">
                              {fmtDate(s.clockInTime)}
                            </td>
                            <td className="py-3 text-sm font-mono text-[#1b1c1c] dark:text-gray-200">
                              {fmtTime(s.clockInTime)}
                            </td>
                            <td className="py-3 text-sm font-mono text-[#1b1c1c] dark:text-gray-200">
                              {fmtTime(s.clockOutTime)}
                            </td>
                            <td className="py-3 text-sm font-mono text-right text-[#1b1c1c] dark:text-gray-200">
                              {s.totalHours ?? 0}h
                            </td>
                            <td className="py-3 text-sm font-mono font-bold text-right text-[#006d30] dark:text-emerald-400">
                              {money(s.earnings)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Mobile cards */}
                  <div className="space-y-2.5 sm:hidden">
                    {sessions.map((s) => {
                      const name = s.salary?.employer?.employerName ?? 'Shift';
                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between gap-3 rounded-md border border-[#005ea3]/[0.08] dark:border-white/10 p-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-9 h-9 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                              style={primaryStyle}
                            >
                              {initials(name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-[#1b1c1c] dark:text-white truncate">
                                {name}
                              </p>
                              <p className="text-xs text-[#707783] dark:text-gray-400 font-mono mt-0.5">
                                {fmtDate(s.clockInTime)} · {fmtTime(s.clockInTime)}–{fmtTime(s.clockOutTime)} · {s.totalHours ?? 0}h
                              </p>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-[#006d30] dark:text-emerald-400 flex-shrink-0">
                            {money(s.earnings)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
