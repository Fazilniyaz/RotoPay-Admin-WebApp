'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Download, TrendingUp, TrendingDown, Minus, Sparkles, BarChart3 } from 'lucide-react';
import { useState } from 'react';

type TabValue = 'weekly' | 'monthly' | 'yearly';

/* ── Static data ── */
const DAILY_DATA = [
  { day: 'Monday', short: 'MON', hours: 8, earnings: 96, barPct: 65 },
  { day: 'Tuesday', short: 'TUE', hours: 8, earnings: 80, barPct: 45 },
  { day: 'Wednesday', short: 'WED', hours: 8, earnings: 80, barPct: 85 },
  { day: 'Thursday', short: 'THU', hours: 7, earnings: 84, barPct: 75 },
  { day: 'Friday', short: 'FRI', hours: 7, earnings: 84, barPct: 95 },
  { day: 'Saturday', short: 'SAT', hours: 0, earnings: 0, barPct: 30 },
  { day: 'Sunday', short: 'SUN', hours: 0, earnings: 0, barPct: 25 },
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

/* ── Helpers ── */
const fmt = (n: number, prefix = '£') => `${prefix}${n.toLocaleString()}`;

function TrendBadge({ pct, neutral }: { pct: number; neutral?: boolean }) {
  if (neutral || pct === 0) return (
    <span className="flex items-center gap-0.5 text-[#404752] dark:text-gray-200 text-xs font-bold">
      <Minus className="h-3 w-3" /> 0%
    </span>
  );
  const up = pct > 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-bold ${up ? 'text-[#006d30]' : 'text-[#ba1a1a]'}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(pct)}%
    </span>
  );
}

/* ── Chart ── */
function BarChart({ bars }: { bars: { label: string; pct: number; value: string; dim?: boolean }[] }) {
  return (
    <div className="flex items-end justify-between gap-2 h-56 pt-8 border-b border-[#c0c7d4] dark:border-gray-700/20 dark:border-gray-700/80 relative">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 py-8">
        {[0, 1, 2].map(i => <div key={i} className="border-b border-[#1b1c1c] w-full" />)}
      </div>

      {bars.map(({ label, pct, value, dim }) => (
        <div key={label} className="relative group flex flex-col items-center flex-1">
          {/* Tooltip */}
          <div className="absolute -top-7 bg-[#006a44] text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {value}
          </div>
          <div
            className={`w-full rounded-t-lg transition-all duration-500 hover:brightness-110 ${dim ? 'opacity-40' : ''}`}
            style={{
              height: `${pct}%`,
              background: 'linear-gradient(to top, #49e177, #42e09c)',
            }}
          />
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#404752] dark:text-gray-200/60 dark:text-gray-400 mt-2">{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Weekly tab ── */
function WeeklyContent() {
  const totalEarnings = DAILY_DATA.reduce((s, d) => s + d.earnings, 0);
  const totalHours = DAILY_DATA.reduce((s, d) => s + d.hours, 0);
  const avgRate = totalHours > 0 ? +(totalEarnings / totalHours).toFixed(2) : 0;

  const bars = DAILY_DATA.map(d => ({
    label: d.short,
    pct: d.barPct,
    value: fmt(d.earnings),
    dim: d.hours === 0,
  }));

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'WEEKLY EARNINGS', value: fmt(totalEarnings), trend: 12, color: 'text-[#005ea3]' },
          { label: 'HOURS WORKED', value: `${totalHours}h`, trend: 5, color: 'text-[#1b1c1c] dark:text-white' },
          { label: 'AVG. HOURLY RATE', value: fmt(avgRate), trend: 4, color: 'text-[#006a44]' },
        ].map(({ label, value, trend, color }) => (
          <div key={label}
            className="bg-white dark:bg-[#1f2937]/85 backdrop-blur-sm border border-[#e2e8f0]/80 dark:border-gray-700/80 rounded-xl p-5 shadow-sm hover:-translate-y-0.5 transition-transform duration-200">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#404752] dark:text-gray-200 mb-3">{label}</p>
            <div className="flex items-end gap-2 mb-1">
              <span className={`text-3xl font-extrabold font-mono ${color}`}>{value}</span>
              <div className="pb-1"><TrendBadge pct={trend} /></div>
            </div>
            <p className="text-xs text-[#404752] dark:text-gray-200/60 dark:text-gray-400">vs Last Week</p>
          </div>
        ))}
      </div>

      {/* Chart + Table bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1f2937]/85 backdrop-blur-sm border border-[#e2e8f0]/80 dark:border-gray-700/80 rounded-xl p-5 shadow-sm hover:-translate-y-0.5 transition-transform duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-[#1b1c1c] dark:text-white">Daily Earnings Breakdown</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#006a44]" />
              <span className="text-xs text-[#404752] dark:text-gray-200">Earnings</span>
            </div>
          </div>
          <BarChart bars={bars} />
        </div>

        {/* Detail table */}
        <div className="bg-white dark:bg-[#1f2937]/85 backdrop-blur-sm border border-[#e2e8f0]/80 dark:border-gray-700/80 rounded-xl p-5 shadow-sm hover:-translate-y-0.5 transition-transform duration-200">
          <h3 className="text-base font-bold text-[#1b1c1c] dark:text-white mb-4">Earnings Detail</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#c0c7d4] dark:border-gray-700/30 dark:border-gray-700/80">
                  {['DAY', 'HRS', 'EARN'].map(h => (
                    <th key={h} className="pb-2.5 text-[10px] font-bold tracking-widest uppercase text-[#404752] dark:text-gray-200 last:text-right">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c0c7d4]/10">
                {DAILY_DATA.map(({ day, hours, earnings }) => (
                  <tr key={day} className="hover:bg-[#f5f3f3] dark:bg-gray-800 transition-colors">
                    <td className="py-3 text-sm font-medium text-[#1b1c1c] dark:text-white">{day.slice(0, 3)}</td>
                    <td className="py-3 text-sm font-mono text-[#404752] dark:text-gray-200">{hours}h</td>
                    <td className={`py-3 text-sm font-mono font-bold text-right ${earnings > 0 ? 'text-[#005ea3]' : 'text-[#404752] dark:text-gray-200/40 dark:text-gray-500 dark:text-gray-400'}`}>
                      {fmt(earnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Smart Insight */}
      <div className="bg-white dark:bg-[#1f2937]/85 backdrop-blur-sm border-l-4 border-[#65fdb6] border border-[#e2e8f0]/80 dark:border-gray-700/80 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-[#008557] p-2.5 rounded-full flex-shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-base mb-1">Smart Insight</h4>
            <p className="text-sm text-[#404752] dark:text-gray-200 leading-relaxed">
              You earned{' '}
              <span className="font-mono font-bold text-[#005ea3]">18% more</span>{' '}
              this week on Wednesdays by working late shifts. Consider picking up the upcoming Wednesday slot for a potential{' '}
              <span className="font-mono font-bold text-[#005ea3]">£9</span> bonus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Monthly tab ── */
function MonthlyContent() {
  const totalEarnings = MONTHLY_DATA.reduce((s, d) => s + d.earnings, 0);
  const totalHours = MONTHLY_DATA.reduce((s, d) => s + d.hours, 0);
  const max = Math.max(...MONTHLY_DATA.map(d => d.earnings));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'TOTAL EARNINGS (6M)', value: fmt(totalEarnings), trend: 8, color: 'text-[#005ea3]' },
          { label: 'TOTAL HOURS (6M)', value: `${totalHours}h`, trend: 3, color: 'text-[#1b1c1c] dark:text-white' },
          { label: 'PEAK MONTH', value: fmt(max), trend: 0, color: 'text-[#006a44]', neutral: true },
        ].map(({ label, value, trend, color, neutral }) => (
          <div key={label}
            className="bg-white dark:bg-[#1f2937]/85 backdrop-blur-sm border border-[#e2e8f0]/80 dark:border-gray-700/80 rounded-xl p-5 shadow-sm hover:-translate-y-0.5 transition-transform duration-200">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#404752] dark:text-gray-200 mb-3">{label}</p>
            <div className="flex items-end gap-2 mb-1">
              <span className={`text-3xl font-extrabold font-mono ${color}`}>{value}</span>
              <div className="pb-1"><TrendBadge pct={trend} neutral={neutral} /></div>
            </div>
            <p className="text-xs text-[#404752] dark:text-gray-200/60 dark:text-gray-400">6-month view</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1f2937]/85 backdrop-blur-sm border border-[#e2e8f0]/80 dark:border-gray-700/80 rounded-xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-[#1b1c1c] dark:text-white mb-4">Monthly Earnings Breakdown</h3>
        <BarChart bars={MONTHLY_DATA.map(d => ({
          label: d.month,
          pct: Math.round((d.earnings / max) * 90),
          value: fmt(d.earnings),
        }))} />
        <div className="mt-5 divide-y divide-[#c0c7d4]/10">
          {MONTHLY_DATA.map(({ month, hours, earnings }) => (
            <div key={month} className="flex items-center justify-between py-3 hover:bg-[#f5f3f3] dark:bg-gray-800 px-2 rounded transition-colors">
              <span className="text-sm font-medium text-[#1b1c1c] dark:text-white w-16">{month}</span>
              <span className="text-sm font-mono text-[#404752] dark:text-gray-200">{hours}h</span>
              <span className="text-sm font-mono font-bold text-[#005ea3]">{fmt(earnings)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Yearly tab ── */
function YearlyContent() {
  const totalEarnings = YEARLY_DATA.reduce((s, d) => s + d.earnings, 0);
  const max = Math.max(...YEARLY_DATA.map(d => d.earnings));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[
          { label: 'LIFETIME EARNINGS', value: fmt(totalEarnings), color: 'text-[#005ea3]' },
          { label: 'BEST YEAR', value: fmt(max), color: 'text-[#006a44]' },
        ].map(({ label, value, color }) => (
          <div key={label}
            className="bg-white dark:bg-[#1f2937]/85 backdrop-blur-sm border border-[#e2e8f0]/80 dark:border-gray-700/80 rounded-xl p-5 shadow-sm hover:-translate-y-0.5 transition-transform duration-200">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#404752] dark:text-gray-200 mb-3">{label}</p>
            <span className={`text-3xl font-extrabold font-mono ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1f2937]/85 backdrop-blur-sm border border-[#e2e8f0]/80 dark:border-gray-700/80 rounded-xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-[#1b1c1c] dark:text-white mb-4">Year-on-Year Earnings</h3>
        <BarChart bars={YEARLY_DATA.map(d => ({
          label: d.year,
          pct: Math.round((d.earnings / max) * 90),
          value: fmt(d.earnings),
        }))} />
        <div className="mt-5 divide-y divide-[#c0c7d4]/10">
          {YEARLY_DATA.map(({ year, hours, earnings }) => (
            <div key={year} className="flex items-center justify-between py-3 hover:bg-[#f5f3f3] dark:bg-gray-800 px-2 rounded transition-colors">
              <span className="text-sm font-medium text-[#1b1c1c] dark:text-white w-16">{year}</span>
              <span className="text-sm font-mono text-[#404752] dark:text-gray-200">{hours}h</span>
              <span className="text-sm font-mono font-bold text-[#005ea3]">{fmt(earnings)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function ReportsPage() {
  const [tab, setTab] = useState<TabValue>('weekly');

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1280px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#005ea3]">Reports</h1>
            <p className="text-sm text-[#404752] dark:text-gray-200 mt-0.5">Analyze your earnings and work patterns</p>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
            style={{ background: 'linear-gradient(135deg,#0077cc 0%,#006a44 100%)' }}
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-[#c0c7d4] dark:border-gray-700/30 dark:border-gray-700/80">
          {(['weekly', 'monthly', 'yearly'] as TabValue[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-7 py-3.5 text-sm font-bold capitalize transition-all relative ${tab === t
                  ? 'text-[#006a44]'
                  : 'text-[#404752] dark:text-gray-200 hover:text-[#005ea3] dark:hover:text-[#a0c9ff]'
                }`}
            >
              {t}
              {tab === t && (
                <div
                  className="absolute inset-x-0 bottom-0 h-0.5 rounded-t"
                  style={{ background: 'linear-gradient(135deg,#0077cc 0%,#006a44 100%)' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'weekly' && <WeeklyContent />}
        {tab === 'monthly' && <MonthlyContent />}
        {tab === 'yearly' && <YearlyContent />}

      </div>
    </DashboardLayout>
  );
}