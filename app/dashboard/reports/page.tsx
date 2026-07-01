'use client';

import { useState } from 'react';
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
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { money } from '@/lib/format';
import { settingsStore } from '@/store/settingsStore';
import { generateReport } from '@/lib/services/reports';
import { exportReport, ReportFormat } from '@/lib/reportExport';

const GRADIENT = 'linear-gradient(135deg, #005ea3 0%, #006d30 100%)';
const primaryStyle = { background: GRADIENT };
const BAR_GRADIENT = 'linear-gradient(to top, #005ea3 0%, #37D36B 100%)';
const cardCls =
  'bg-white dark:bg-[#1f2937] rounded-[10px] border border-[rgba(0,94,163,0.08)] dark:border-[rgba(160,201,255,0.08)] shadow-[0_4px_6px_rgba(0,123,210,0.06),0_2px_4px_rgba(0,123,210,0.04)]';

type TabValue = 'weekly' | 'monthly' | 'yearly';

const DAILY_DATA = [
  { day: 'Monday', short: 'MON', hours: 8, earnings: 96, barPct: 65 },
  { day: 'Tuesday', short: 'TUE', hours: 8, earnings: 80, barPct: 45 },
  { day: 'Wednesday', short: 'WED', hours: 8, earnings: 80, barPct: 85 },
  { day: 'Thursday', short: 'THU', hours: 7, earnings: 84, barPct: 75 },
  { day: 'Friday', short: 'FRI', hours: 7, earnings: 84, barPct: 95 },
  { day: 'Saturday', short: 'SAT', hours: 0, earnings: 0, barPct: 12 },
  { day: 'Sunday', short: 'SUN', hours: 0, earnings: 0, barPct: 10 },
];
const MONTHLY_DATA = [
  { month: 'Jan', earnings: 1800, hours: 152 },
  { month: 'Feb', earnings: 2100, hours: 168 },
  { month: 'Mar', earnings: 1950, hours: 160 },
  { month: 'Apr', earnings: 2300, hours: 176 },
  { month: 'May', earnings: 2450, hours: 180 },
  { month: 'Jun', earnings: 2200, hours: 172 },
];
const YEARLY_DATA = [
  { year: '2021', earnings: 24000, hours: 1920 },
  { year: '2022', earnings: 27500, hours: 2080 },
  { year: '2023', earnings: 31200, hours: 2200 },
  { year: '2024', earnings: 28900, hours: 2040 },
];

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

function WeeklyContent() {
  const totalEarnings = DAILY_DATA.reduce((s, d) => s + d.earnings, 0);
  const totalHours = DAILY_DATA.reduce((s, d) => s + d.hours, 0);
  const avgRate = totalHours > 0 ? +(totalEarnings / totalHours).toFixed(2) : 0;
  const bars = DAILY_DATA.map((d) => ({ label: d.short, pct: d.barPct, value: money(d.earnings), dim: d.hours === 0 }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Weekly Earnings" value={money(totalEarnings)} icon={Wallet} trend={12} sub="vs last week" />
        <StatCard label="Hours Worked" value={`${totalHours}h`} icon={Clock} trend={5} sub="vs last week" />
        <StatCard label="Avg. Hourly Rate" value={money(avgRate)} icon={Gauge} trend={4} sub="vs last week" />
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
          <DataRows rows={DAILY_DATA.map((d) => ({ label: d.day.slice(0, 3), hours: d.hours, earnings: d.earnings }))} />
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
              You earned <span className="font-mono font-bold text-[#005ea3] dark:text-[#a0c9ff]">18% more</span> this week on
              Wednesdays by working late shifts. Consider picking up the upcoming Wednesday slot for a potential{' '}
              <span className="font-mono font-bold text-[#005ea3] dark:text-[#a0c9ff]">{money(9)}</span> bonus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthlyContent() {
  const totalEarnings = MONTHLY_DATA.reduce((s, d) => s + d.earnings, 0);
  const totalHours = MONTHLY_DATA.reduce((s, d) => s + d.hours, 0);
  const max = Math.max(...MONTHLY_DATA.map((d) => d.earnings));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Earnings (6M)" value={money(totalEarnings)} icon={Wallet} trend={8} sub="6-month view" />
        <StatCard label="Total Hours (6M)" value={`${totalHours}h`} icon={Clock} trend={3} sub="6-month view" />
        <StatCard label="Peak Month" value={money(max)} icon={CalendarRange} neutral trend={0} sub="best so far" />
      </div>
      <div className={`${cardCls} p-5`}>
        <h3 className="font-bold text-[#1b1c1c] dark:text-white mb-2">Monthly Earnings</h3>
        <BarChart bars={MONTHLY_DATA.map((d) => ({ label: d.month, pct: Math.round((d.earnings / max) * 90), value: money(d.earnings) }))} />
        <div className="mt-4">
          <DataRows rows={MONTHLY_DATA.map((d) => ({ label: d.month, hours: d.hours, earnings: d.earnings }))} />
        </div>
      </div>
    </div>
  );
}

function YearlyContent() {
  const totalEarnings = YEARLY_DATA.reduce((s, d) => s + d.earnings, 0);
  const max = Math.max(...YEARLY_DATA.map((d) => d.earnings));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Lifetime Earnings" value={money(totalEarnings)} icon={Wallet} sub="all time" />
        <StatCard label="Best Year" value={money(max)} icon={TrendingUp} sub="peak earnings" />
      </div>
      <div className={`${cardCls} p-5`}>
        <h3 className="font-bold text-[#1b1c1c] dark:text-white mb-2">Year-on-Year</h3>
        <BarChart bars={YEARLY_DATA.map((d) => ({ label: d.year, pct: Math.round((d.earnings / max) * 90), value: money(d.earnings) }))} />
        <div className="mt-4">
          <DataRows rows={YEARLY_DATA.map((d) => ({ label: d.year, hours: d.hours, earnings: d.earnings }))} />
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

        {tab === 'weekly' && <WeeklyContent />}
        {tab === 'monthly' && <MonthlyContent />}
        {tab === 'yearly' && <YearlyContent />}
      </div>
    </DashboardLayout>
  );
}
