'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Clock, CalendarRange, Wallet, Coins, Loader2, type LucideIcon } from 'lucide-react';
import { Shift, Salary } from '@/lib/types';
import { getShiftAnalytics, listShifts, ShiftAnalytics } from '@/lib/services/shifts';
import { listSalaries } from '@/lib/services/salaries';
import { getRate } from '@/lib/services/currency';
import { settingsStore } from '@/store/settingsStore';
import { money, moneyIn, currencySymbol } from '@/lib/format';

const GRADIENT = 'linear-gradient(135deg, #005ea3 0%, #006d30 100%)';
const primaryStyle = { background: GRADIENT };
const cardCls =
  'bg-white dark:bg-[#1f2937] rounded-[10px] border border-[rgba(0,94,163,0.08)] dark:border-[rgba(160,201,255,0.08)] shadow-[0_4px_6px_rgba(0,123,210,0.06),0_2px_4px_rgba(0,123,210,0.04)]';
const BAR_GRADIENT = 'linear-gradient(to top, #005ea3 0%, #37D36B 100%)';
const DONUT_COLORS = ['#0077cc', '#37D36B', '#008557', '#005ea3', '#7c3aed', '#b45309'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const shiftEarnings = (s: Shift) => (s.salaries ?? []).reduce((sum, w) => sum + (w.salary ?? 0), 0);

function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

function StatCard({ label, value, icon: Icon, caption }: { label: string; value: string; icon: LucideIcon; caption?: string }) {
  return (
    <div className={`${cardCls} p-5 sm:p-6`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#707783] dark:text-gray-400 mb-1.5">{label}</p>
          <p className="font-mono text-xl sm:text-2xl font-medium text-[#005ea3] dark:text-[#a0c9ff] truncate">{value}</p>
          {caption && <p className="text-[10px] text-gray-400 mt-1 truncate">{caption}</p>}
        </div>
        <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-sm" style={primaryStyle}>
          <Icon className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

// Simple SVG donut (share per employer).
function Donut({ segments }: { segments: { label: string; pct: number; color: string }[] }) {
  const r = 64, c = 2 * Math.PI * r;
  let cum = 0;
  return (
    <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
      <svg viewBox="0 0 160 160" width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
        {segments.map((s, i) => {
          const dash = (s.pct / 100) * c;
          const off = c * (1 - cum / 100);
          cum += s.pct;
          return (
            <circle key={i} cx={80} cy={80} r={r} fill="none" stroke={s.color} strokeWidth={18}
              strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-(-off + c)} style={{ transition: 'stroke-dasharray .5s' }} />
          );
        })}
      </svg>
    </div>
  );
}

export default function EarningsPage() {
  const [analytics, setAnalytics] = useState<ShiftAnalytics | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [native, setNative] = useState<{ pay: number | null; code: string; rate: number | null }>({ pay: null, code: 'GBP', rate: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [a, s, sal] = await Promise.all([getShiftAnalytics(), listShifts({ limit: 500 }), listSalaries({ limit: 500 })]);
        if (!active) return;
        setAnalytics(a);
        setShifts(s.data);
        setSalaries(sal.data);

        const global = settingsStore.getState().currency;
        const nativeCode = settingsStore.getState().nativeCurrency || global;
        if (nativeCode === global) {
          setNative({ pay: a.totalPay, code: global, rate: 1 });
        } else {
          try {
            const r = await getRate(global, nativeCode);
            if (active) setNative({ pay: a.totalPay * r.rate, code: nativeCode, rate: r.rate });
          } catch {
            if (active) setNative({ pay: null, code: nativeCode, rate: null });
          }
        }
      } catch {
        if (active) toast.error('Failed to load earnings');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Weekly hours per weekday (bar chart).
  const weekBars = useMemo(() => {
    const ws = startOfWeek(new Date());
    return WEEKDAYS.map((day, i) => {
      const from = new Date(ws); from.setDate(from.getDate() + i);
      const to = new Date(from); to.setDate(to.getDate() + 1);
      const hours = shifts
        .filter((s) => { const d = new Date(s.date); return d >= from && d < to; })
        .reduce((a, s) => a + (s.totalHours ?? 0), 0);
      return { day, hours: Math.round(hours * 10) / 10 };
    });
  }, [shifts]);
  const maxHours = Math.max(1, ...weekBars.map((b) => b.hours));

  // Earnings share per employer (donut).
  const donut = useMemo(() => {
    const by = new Map<string, number>();
    for (const s of salaries) {
      const name = s.employer?.employerName ?? 'Unassigned';
      by.set(name, (by.get(name) ?? 0) + (s.salary ?? 0));
    }
    const rows = [...by.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const total = rows.reduce((a, [, v]) => a + v, 0);
    return { total, segments: rows.slice(0, 6).map(([label, v], i) => ({ label, value: v, color: DONUT_COLORS[i % DONUT_COLORS.length], pct: total > 0 ? Math.round((v / total) * 100) : 0 })) };
  }, [salaries]);

  const globalCode = settingsStore.getState().currency;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#005ea3]">Earnings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your hours and pay at a glance</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px] text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            {/* Stat tabs (moved here from Shifts) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Hours" value={`${analytics?.totalHours ?? 0}h`} icon={Clock} />
              <StatCard label="This Month Pay" value={money(analytics?.thisMonthPay)} icon={CalendarRange} />
              <StatCard label="Total Pay" value={money(analytics?.totalPay)} icon={Wallet} />
              <StatCard
                label="Native Pay"
                value={native.pay == null ? '—' : moneyIn(native.code, native.pay)}
                icon={Coins}
                caption={native.rate == null ? 'Rate unavailable' : native.rate === 1 ? 'Same as global' : `1 ${globalCode} = ${native.rate.toFixed(2)} ${native.code}`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Weekly hours bar chart */}
              <div className={`${cardCls} p-5`}>
                <h3 className="font-bold text-[#1b1c1c] dark:text-white mb-4">Hours This Week</h3>
                <div className="flex items-end justify-between gap-2 h-48">
                  {weekBars.map((b) => (
                    <div key={b.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                      <div className="absolute -top-1 text-[10px] font-mono font-bold text-[#005ea3] dark:text-[#a0c9ff] opacity-0 group-hover:opacity-100 transition">{b.hours}h</div>
                      <div className="w-full max-w-[34px] rounded-t-md transition-all" style={{ height: `${b.hours > 0 ? Math.max(4, (b.hours / maxHours) * 100) : 2}%`, background: BAR_GRADIENT, opacity: b.hours > 0 ? 1 : 0.25 }} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#707783] dark:text-gray-400">{b.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Earnings by employer donut */}
              <div className={`${cardCls} p-5`}>
                <h3 className="font-bold text-[#1b1c1c] dark:text-white mb-4">Earnings by Employer</h3>
                {donut.segments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <Wallet className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No earnings recorded yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Donut segments={donut.segments} />
                    <div className="flex-1 w-full space-y-2">
                      {donut.segments.map((s) => (
                        <div key={s.label} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-[#1b1c1c] dark:text-gray-200 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                            <span className="truncate">{s.label}</span>
                          </span>
                          <span className="font-mono text-[#707783] dark:text-gray-400">{money(s.value)}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between text-sm border-t border-[#005ea3]/[0.08] dark:border-white/10 pt-2 mt-2">
                        <span className="font-bold text-[#1b1c1c] dark:text-white">Total</span>
                        <span className="font-mono font-semibold text-[#005ea3] dark:text-[#a0c9ff]">{money(donut.total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pay comparison bars */}
            <div className={`${cardCls} p-5`}>
              <h3 className="font-bold text-[#1b1c1c] dark:text-white mb-4">Pay Overview</h3>
              {(() => {
                const items = [
                  { label: 'This Month Pay', value: analytics?.thisMonthPay ?? 0 },
                  { label: 'Total Pay', value: analytics?.totalPay ?? 0 },
                  { label: `Native (${native.code})`, value: native.pay ?? 0 },
                ];
                const max = Math.max(1, ...items.map((i) => i.value));
                return (
                  <div className="space-y-3">
                    {items.map((i) => (
                      <div key={i.label}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#707783] dark:text-gray-400 font-medium">{i.label}</span>
                          <span className="font-mono text-[#005ea3] dark:text-[#a0c9ff]">
                            {i.label.startsWith('Native') ? `${currencySymbol(native.code)}${(Math.round(i.value * 100) / 100).toLocaleString()}` : money(i.value)}
                          </span>
                        </div>
                        <div className="h-3 rounded-full bg-[#005ea3]/[0.06] dark:bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.max(2, (i.value / max) * 100)}%`, background: GRADIENT }} />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
