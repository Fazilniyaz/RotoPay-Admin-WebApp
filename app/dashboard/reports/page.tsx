'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Wallet,
  Clock,
  Gauge,
  CalendarRange,
  FileSpreadsheet,
  FileText,
  FileType2,
  Loader2,
  BarChart3,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { money } from '@/lib/format';
import { settingsStore } from '@/store/settingsStore';
import { generateReport } from '@/lib/services/reports';
import { listShifts } from '@/lib/services/shifts';
import { Shift } from '@/lib/types';
import { exportReport, ReportFormat } from '@/lib/reportExport';

const GRADIENT = 'linear-gradient(135deg, #005ea3 0%, #006d30 100%)';
const primaryStyle = { background: GRADIENT };
const BAR_GRADIENT = 'linear-gradient(to top, #005ea3 0%, #37D36B 100%)';
const cardCls =
  'bg-white dark:bg-[#1f2937] rounded-[10px] border border-[rgba(0,94,163,0.08)] dark:border-[rgba(160,201,255,0.08)] shadow-[0_4px_6px_rgba(0,123,210,0.06),0_2px_4px_rgba(0,123,210,0.04)]';

type TabValue = 'weekly' | 'monthly' | 'yearly';

interface DayDatum { day: string; short: string; hours: number; earnings: number }
interface MonthDatum { month: string; earnings: number; hours: number }
interface YearDatum { year: string; earnings: number; hours: number }

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Total pay attached to a shift (a shift can carry several wage rows).
const shiftEarnings = (s: Shift) => (s.salaries ?? []).reduce((sum, w) => sum + (w.salary ?? 0), 0);

// Monday-anchored start of the week for the given date.
function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const offset = (x.getDay() + 6) % 7; // Mon = 0 … Sun = 6
  x.setDate(x.getDate() - offset);
  return x;
}

// Percent change of current vs previous (0 when there's no basis).
function pctChange(cur: number, prev: number): number {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
}

// ── Build the three report datasets from raw shifts ──
function buildWeekly(shifts: Shift[], weekStart: Date): DayDatum[] {
  return DAY_NAMES.map((day, i) => {
    const from = new Date(weekStart);
    from.setDate(from.getDate() + i);
    const to = new Date(from);
    to.setDate(to.getDate() + 1);
    const dayShifts = shifts.filter((s) => {
      const d = new Date(s.date);
      return d >= from && d < to;
    });
    return {
      day,
      short: DAY_SHORT[i],
      hours: Math.round(dayShifts.reduce((a, s) => a + (s.totalHours ?? 0), 0) * 10) / 10,
      earnings: Math.round(dayShifts.reduce((a, s) => a + shiftEarnings(s), 0) * 100) / 100,
    };
  });
}

function buildMonthly(shifts: Shift[], now: Date): MonthDatum[] {
  const out: MonthDatum[] = [];
  for (let i = 5; i >= 0; i--) {
    const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthShifts = shifts.filter((s) => {
      const d = new Date(s.date);
      return d >= from && d < to;
    });
    out.push({
      month: MONTH_SHORT[from.getMonth()],
      earnings: Math.round(monthShifts.reduce((a, s) => a + shiftEarnings(s), 0) * 100) / 100,
      hours: Math.round(monthShifts.reduce((a, s) => a + (s.totalHours ?? 0), 0) * 10) / 10,
    });
  }
  return out;
}

function buildYearly(shifts: Shift[]): YearDatum[] {
  const map = new Map<number, { earnings: number; hours: number }>();
  for (const s of shifts) {
    const y = new Date(s.date).getFullYear();
    const e = map.get(y) ?? { earnings: 0, hours: 0 };
    e.earnings += shiftEarnings(s);
    e.hours += s.totalHours ?? 0;
    map.set(y, e);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, v]) => ({
      year: String(year),
      earnings: Math.round(v.earnings * 100) / 100,
      hours: Math.round(v.hours * 10) / 10,
    }));
}

function TrendBadge({ pct, neutral }: { pct: number; neutral?: boolean }) {
  if (neutral || pct === 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-gray-400 text-[11px] font-bold">
        <Minus className="h-3 w-3" /> 0%
      </span>
    );
  const up = pct > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${up ? 'text-[#006d30]' : 'text-[#ba1a1a]'}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(pct)}%
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  neutral,
  sub,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  neutral?: boolean;
  sub?: string;
}) {
  return (
    <div className={`${cardCls} p-5`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#707783] dark:text-gray-400 mb-1.5">{label}</p>
          <p className="font-mono text-2xl font-medium text-[#005ea3] dark:text-[#a0c9ff] truncate">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm" style={primaryStyle}>
          <Icon className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
      </div>
      {(trend !== undefined || sub) && (
        <div className="flex items-center gap-2 mt-2">
          {trend !== undefined && <TrendBadge pct={trend} neutral={neutral} />}
          {sub && <span className="text-[11px] text-gray-400">{sub}</span>}
        </div>
      )}
    </div>
  );
}

function BarChart({ bars }: { bars: { label: string; pct: number; value: string; dim?: boolean }[] }) {
  return (
    <div className="flex items-end justify-between gap-2 sm:gap-3 h-52 pt-8 relative">
      <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-b border-[#005ea3]/[0.06] dark:border-white/5 w-full" />
        ))}
      </div>
      {bars.map(({ label, pct, value, dim }) => (
        <div key={label} className="relative group flex flex-col items-center flex-1 h-full justify-end">
          <div className="absolute -top-1 bg-[#1b1c1c] text-white text-[10px] font-mono font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {value}
          </div>
          <div
            className={`w-full max-w-[34px] rounded-t-md transition-all duration-500 group-hover:brightness-110 ${dim ? 'opacity-30' : ''}`}
            style={{ height: `${Math.max(4, pct)}%`, background: BAR_GRADIENT }}
          />
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-[#707783] dark:text-gray-400 mt-2">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

function DataRows({ rows }: { rows: { label: string; hours: number; earnings: number }[] }) {
  return (
    <div className="divide-y divide-[#005ea3]/[0.06] dark:divide-white/5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between py-2.5">
          <span className="text-sm font-medium text-[#1b1c1c] dark:text-white w-20">{r.label}</span>
          <span className="text-sm font-mono text-[#707783] dark:text-gray-400">{r.hours}h</span>
          <span className={`text-sm font-mono font-bold ${r.earnings > 0 ? 'text-[#005ea3] dark:text-[#a0c9ff]' : 'text-gray-300 dark:text-gray-600'}`}>
            {money(r.earnings)}
          </span>
        </div>
      ))}
    </div>
  );
}

function WeeklyContent({ data, prevWeek }: { data: DayDatum[]; prevWeek: DayDatum[] }) {
  const totalEarnings = data.reduce((s, d) => s + d.earnings, 0);
  const totalHours = data.reduce((s, d) => s + d.hours, 0);
  const avgRate = totalHours > 0 ? +(totalEarnings / totalHours).toFixed(2) : 0;
  const max = Math.max(1, ...data.map((d) => d.earnings));
  const bars = data.map((d) => ({ label: d.short, pct: Math.round((d.earnings / max) * 90), value: money(d.earnings), dim: d.hours === 0 }));

  const prevEarnings = prevWeek.reduce((s, d) => s + d.earnings, 0);
  const prevHours = prevWeek.reduce((s, d) => s + d.hours, 0);
  const prevRate = prevHours > 0 ? prevEarnings / prevHours : 0;

  // The most productive day this week — a genuinely computed insight.
  const best = data.reduce((a, b) => (b.earnings > a.earnings ? b : a), data[0]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Weekly Earnings" value={money(totalEarnings)} icon={Wallet} trend={pctChange(totalEarnings, prevEarnings)} sub="vs last week" />
        <StatCard label="Hours Worked" value={`${totalHours}h`} icon={Clock} trend={pctChange(totalHours, prevHours)} sub="vs last week" />
        <StatCard label="Avg. Hourly Rate" value={money(avgRate)} icon={Gauge} trend={pctChange(avgRate, prevRate)} sub="vs last week" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${cardCls} p-5 lg:col-span-2`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-[#1b1c1c] dark:text-white">Daily Earnings</h3>
            <span className="flex items-center gap-1.5 text-[11px] text-[#707783] dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: BAR_GRADIENT }} /> Earnings
            </span>
          </div>
          <BarChart bars={bars} />
        </div>
        <div className={`${cardCls} p-5`}>
          <h3 className="font-bold text-[#1b1c1c] dark:text-white mb-3">Detail</h3>
          <DataRows rows={data.map((d) => ({ label: d.day.slice(0, 3), hours: d.hours, earnings: d.earnings }))} />
        </div>
      </div>

      <div className={`${cardCls} p-5 border-l-[3px] border-l-[#006d30]`}>
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg flex-shrink-0" style={primaryStyle}>
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#1b1c1c] dark:text-white mb-1">Smart Insight</h4>
            <p className="text-sm text-[#404752] dark:text-gray-300 leading-relaxed">
              {totalEarnings > 0 ? (
                <>
                  Your best day this week was{' '}
                  <span className="font-mono font-bold text-[#005ea3] dark:text-[#a0c9ff]">{best.day}</span>, earning{' '}
                  <span className="font-mono font-bold text-[#005ea3] dark:text-[#a0c9ff]">{money(best.earnings)}</span> across{' '}
                  <span className="font-mono font-bold text-[#005ea3] dark:text-[#a0c9ff]">{best.hours}h</span>. You&apos;re{' '}
                  {pctChange(totalEarnings, prevEarnings) >= 0 ? 'up' : 'down'}{' '}
                  <span className="font-mono font-bold text-[#005ea3] dark:text-[#a0c9ff]">{Math.abs(pctChange(totalEarnings, prevEarnings))}%</span> versus last week.
                </>
              ) : (
                <>No earnings recorded this week yet. Add shifts and wages to see insights here.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthlyContent({ data }: { data: MonthDatum[] }) {
  const totalEarnings = data.reduce((s, d) => s + d.earnings, 0);
  const totalHours = data.reduce((s, d) => s + d.hours, 0);
  const max = Math.max(1, ...data.map((d) => d.earnings));
  const peak = data.reduce((a, b) => (b.earnings > a.earnings ? b : a), data[0] ?? { earnings: 0 });
  // Trend = most recent month vs the one before it.
  const last = data[data.length - 1]?.earnings ?? 0;
  const prev = data[data.length - 2]?.earnings ?? 0;
  const lastH = data[data.length - 1]?.hours ?? 0;
  const prevH = data[data.length - 2]?.hours ?? 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Earnings (6M)" value={money(totalEarnings)} icon={Wallet} trend={pctChange(last, prev)} sub="latest vs prior month" />
        <StatCard label="Total Hours (6M)" value={`${totalHours}h`} icon={Clock} trend={pctChange(lastH, prevH)} sub="latest vs prior month" />
        <StatCard label="Peak Month" value={money(peak.earnings)} icon={CalendarRange} neutral trend={0} sub="best in 6 months" />
      </div>
      <div className={`${cardCls} p-5`}>
        <h3 className="font-bold text-[#1b1c1c] dark:text-white mb-2">Monthly Earnings</h3>
        <BarChart bars={data.map((d) => ({ label: d.month, pct: Math.round((d.earnings / max) * 90), value: money(d.earnings) }))} />
        <div className="mt-4">
          <DataRows rows={data.map((d) => ({ label: d.month, hours: d.hours, earnings: d.earnings }))} />
        </div>
      </div>
    </div>
  );
}

function YearlyContent({ data }: { data: YearDatum[] }) {
  const totalEarnings = data.reduce((s, d) => s + d.earnings, 0);
  const max = Math.max(1, ...data.map((d) => d.earnings));
  const bestYear = data.reduce((a, b) => (b.earnings > a.earnings ? b : a), data[0] ?? { earnings: 0 });

  if (data.length === 0) {
    return (
      <div className={`${cardCls} p-10 flex flex-col items-center justify-center text-center`}>
        <BarChart3 className="h-10 w-10 text-gray-300 mb-3" />
        <p className="text-sm text-gray-400">No yearly data yet — add shifts to build your history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Lifetime Earnings" value={money(totalEarnings)} icon={Wallet} sub="all time" />
        <StatCard label="Best Year" value={money(bestYear.earnings)} icon={TrendingUp} sub={`peak · ${bestYear.year}`} />
      </div>
      <div className={`${cardCls} p-5`}>
        <h3 className="font-bold text-[#1b1c1c] dark:text-white mb-2">Year-on-Year</h3>
        <BarChart bars={data.map((d) => ({ label: d.year, pct: Math.round((d.earnings / max) * 90), value: money(d.earnings) }))} />
        <div className="mt-4">
          <DataRows rows={data.map((d) => ({ label: d.year, hours: d.hours, earnings: d.earnings }))} />
        </div>
      </div>
    </div>
  );
}

const TABS: TabValue[] = ['weekly', 'monthly', 'yearly'];

const EXPORT_FORMATS: { value: ReportFormat; label: string; icon: LucideIcon }[] = [
  { value: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
  { value: 'csv', label: 'CSV (.csv)', icon: FileType2 },
  { value: 'pdf', label: 'PDF (.pdf)', icon: FileText },
];

export default function ReportsPage() {
  const [tab, setTab] = useState<TabValue>('weekly');
  const [menuOpen, setMenuOpen] = useState(false);
  const [exporting, setExporting] = useState<ReportFormat | null>(null);
  const reportMonths = settingsStore((s) => s.reportMonths);

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listShifts({ limit: 1000 })
      .then((r) => active && setShifts(r.data))
      .catch(() => active && toast.error('Failed to load report data'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Derive the three datasets from the loaded shifts (recomputed on data change).
  const { weekly, prevWeek, monthly, yearly } = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    return {
      weekly: buildWeekly(shifts, weekStart),
      prevWeek: buildWeekly(shifts, lastWeekStart),
      monthly: buildMonthly(shifts, now),
      yearly: buildYearly(shifts),
    };
  }, [shifts]);

  const handleExport = async (format: ReportFormat) => {
    setExporting(format);
    setMenuOpen(false);
    try {
      // No months arg → backend uses the saved Report Range setting (authoritative).
      const data = await generateReport();
      await exportReport(data, format);
      const m = data.period.months;
      toast.success(`Report exported (last ${m} month${m > 1 ? 's' : ''})`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to export report');
    } finally {
      setExporting(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#005ea3]">Reports</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Analyse your earnings and work patterns · export covers the last{' '}
              {reportMonths} month{reportMonths > 1 ? 's' : ''}
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              disabled={exporting !== null}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg shadow-[0_4px_14px_rgba(0,94,163,0.25)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
              style={primaryStyle}
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? 'Exporting…' : 'Export Report'}
              {!exporting && <ChevronDown className="h-4 w-4" />}
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className={`${cardCls} absolute right-0 mt-2 w-56 p-1.5 z-20`}>
                  {EXPORT_FORMATS.map((f) => {
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.value}
                        onClick={() => handleExport(f.value)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[#1b1c1c] dark:text-gray-200 hover:bg-[#005ea3]/[0.06] transition-colors"
                      >
                        <Icon className="h-4 w-4 text-[#005ea3]" />
                        {f.label}
                      </button>
                    );
                  })}
                  <p className="text-[10px] text-gray-400 px-3 pt-1.5 pb-1">
                    Last {reportMonths} month{reportMonths > 1 ? 's' : ''} · change in Settings
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest capitalize transition-all ${
                tab === t
                  ? 'text-white shadow-md'
                  : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              style={tab === t ? primaryStyle : undefined}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px] text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            {tab === 'weekly' && <WeeklyContent data={weekly} prevWeek={prevWeek} />}
            {tab === 'monthly' && <MonthlyContent data={monthly} />}
            {tab === 'yearly' && <YearlyContent data={yearly} />}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
