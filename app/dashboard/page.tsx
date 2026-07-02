'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardGreeting } from '@/components/dashboard/DashboardGreeting';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authStore } from '@/store/authStore';
import {
  DollarSign,
  Clock,
  Calendar,
  Building2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CheckCircle2,
  Zap,
  Timer,
  Plus,
  FileText,
  Briefcase,
  ExternalLink,
  LogOut,
  LogIn,
  PlusCircle,
  UserCog,
  Wallet,
  Trash2,
  SquarePen,
  Coins,
  Bell,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Shift } from '@/lib/types';
import { notificationsStore } from '@/store/notificationsStore';
import { listShifts } from '@/lib/services/shifts';
import { listEmployers } from '@/lib/services/employers';
import { timeAgo, money, fmtDateShort, fmtTime } from '@/lib/format';

// Icon + colours per activity type for the dashboard timeline.
const ACTIVITY_META: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  shift_added: { icon: PlusCircle, color: '#0077cc', bg: 'rgba(0,119,204,0.12)' },
  shift_updated: { icon: SquarePen, color: '#0077cc', bg: 'rgba(0,119,204,0.12)' },
  shift_removed: { icon: Trash2, color: '#ba1a1a', bg: 'rgba(186,26,26,0.12)' },
  shift_reminder: { icon: Clock, color: '#005ea3', bg: 'rgba(0,94,163,0.12)' },
  profile_updated: { icon: UserCog, color: '#888', bg: 'rgba(136,136,136,0.1)' },
  payment_confirmed: { icon: Wallet, color: '#008557', bg: 'rgba(0,133,87,0.12)' },
  employee_added: { icon: Building2, color: '#0077cc', bg: 'rgba(0,119,204,0.12)' },
  wage_added: { icon: Coins, color: '#008557', bg: 'rgba(0,133,87,0.12)' },
  clock_in: { icon: LogIn, color: '#49e177', bg: 'rgba(73,225,119,0.15)' },
  clock_out: { icon: LogOut, color: '#49e177', bg: 'rgba(73,225,119,0.15)' },
};
const activityMeta = (type: string) =>
  ACTIVITY_META[type] ?? { icon: Bell, color: '#888', bg: 'rgba(136,136,136,0.1)' };

// ─── Types + derived-data helpers ─────────────────────────────────
type StatCardData = {
  title: string;
  value: string;
  icon: LucideIcon;
  change: number | null;
  trend: 'up' | 'down' | 'neutral';
  sub: string;
};

const DONUT_COLORS = ['#0077cc', '#6aff90', '#008557', '#005ea3', '#37D36B', '#a0c9ff'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Total pay attached to a shift (a shift can carry several wage rows).
const shiftEarnings = (s: Shift) => (s.salaries ?? []).reduce((sum, w) => sum + (w.salary ?? 0), 0);

// Monday-anchored start of the week for the given date.
function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const offset = (x.getDay() + 6) % 7; // Mon = 0 … Sun = 6
  x.setDate(x.getDate() - offset);
  return x;
}

// Turn a current-vs-previous pair into a StatCard trend.
function trendFrom(cur: number, prev: number): { change: number | null; trend: 'up' | 'down' | 'neutral' } {
  if (prev === 0) return cur > 0 ? { change: 100, trend: 'up' } : { change: null, trend: 'neutral' };
  const pct = Math.round(((cur - prev) / prev) * 100);
  return { change: Math.abs(pct), trend: pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral' };
}

const quickActions = [
  { label: 'Clock In', icon: Timer, href: '/dashboard/clock' },
  { label: 'Add Shift', icon: Plus, href: '/dashboard/shifts' },
  { label: 'Reports', icon: FileText, href: '/dashboard/reports' },
  { label: 'Employers', icon: Briefcase, href: '/dashboard/employers' },
];

// ─── Donut SVG helper ──────────────────────────────────────────────
function DonutChart({
  segments,
  centerValue,
}: {
  segments: { label: string; pct: number; color: string }[];
  centerValue: string;
}) {
  const r = 64;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;
  const slices = segments.map((seg) => {
    const offset = circumference * (1 - cumulative / 100);
    const dash = (seg.pct / 100) * circumference;
    cumulative += seg.pct;
    return { ...seg, offset, dash };
  });

  return (
    <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
      <svg viewBox="0 0 160 160" width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={18}
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset + circumference}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        ))}
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <span style={{ fontSize: 10, fontFamily: 'Montserrat', fontWeight: 700, color: '#404752', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total</span>
        <span style={{ fontSize: 16, fontFamily: '"JetBrains Mono", monospace', fontWeight: 500, color: '#005ea3' }}>{centerValue}</span>
      </div>
    </div>
  );
}

// ─── Bar Chart ─────────────────────────────────────────────────────
function BarChart({ bars }: { bars: { day: string; amount: number }[] }) {
  const max = Math.max(1, ...bars.map((b) => b.amount));
  return (
    <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 16, padding: '0 8px' }}>
      {bars.map((d) => (
        <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
          <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} className="group" title={money(d.amount)}>
            <div
              style={{
                width: '60%',
                height: `${d.amount > 0 ? Math.max(4, (d.amount / max) * 100) : 2}%`,
                background: 'linear-gradient(180deg, #005ea3 0%, #006d30 100%)',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.4s ease',
                opacity: d.amount > 0 ? 1 : 0.25,
              }}
            />
          </div>
          <span style={{ fontSize: 11, fontFamily: 'Montserrat', fontWeight: 700, color: '#707783', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {d.day}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, change, trend, sub }: StatCardData) {
  const isUp = trend === 'up';
  const isDown = trend === 'down';

  return (
    <div className="rp-stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p className="rp-stat-label">{title}</p>
          <h3 className="rp-stat-value">{value}</h3>
        </div>
        <div className="rp-stat-icon">
          <Icon size={20} color="white" strokeWidth={2} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {isUp && <TrendingUp size={14} color="#007433" strokeWidth={2.5} />}
        {isDown && <TrendingDown size={14} color="#ba1a1a" strokeWidth={2.5} />}
        {change !== null && (
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 13,
              fontWeight: 500,
              color: isUp ? '#007433' : isDown ? '#ba1a1a' : '#005ea3',
            }}
          >
            {change}%
          </span>
        )}
        <span style={{ fontSize: 12, color: '#707783', fontFamily: 'Montserrat', fontWeight: 400 }}>{sub}</span>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = authStore();
  const [isLoading, setIsLoading] = useState(true);
  // Recent-activity feed comes from the shared notifications store.
  const allActivities = notificationsStore((s) => s.items);
  const activitiesLoaded = notificationsStore((s) => s.loaded);
  const activities = allActivities.slice(0, 6);
  const activitiesLoading = !activitiesLoaded;
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [activeEmployers, setActiveEmployers] = useState(0);

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, isHydrated, router]);

  // Shifts (with wage rows) + employers drive every stat, chart and table below.
  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    let active = true;
    Promise.all([listShifts({ limit: 500 }), listEmployers({ limit: 100 })])
      .then(([shiftRes, empRes]) => {
        if (!active) return;
        setShifts(shiftRes.data);
        setActiveEmployers(empRes.data.filter((e) => e.isActive).length);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isHydrated, isAuthenticated]);

  // ── Derive every dashboard figure from the loaded shifts ──
  const now = new Date();
  const weekStart = startOfWeek(now);
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const inRange = (iso: string, from: Date, to: Date) => {
    const d = new Date(iso);
    return d >= from && d < to;
  };

  // Earnings this/last month; hours this/last week.
  const earnThisMonth = shifts.filter((s) => inRange(s.date, monthStart, now)).reduce((a, s) => a + shiftEarnings(s), 0);
  const earnLastMonth = shifts.filter((s) => inRange(s.date, lastMonthStart, monthStart)).reduce((a, s) => a + shiftEarnings(s), 0);
  const hoursThisWeek = shifts.filter((s) => inRange(s.date, weekStart, now)).reduce((a, s) => a + (s.totalHours ?? 0), 0);
  const hoursLastWeek = shifts.filter((s) => inRange(s.date, lastWeekStart, weekStart)).reduce((a, s) => a + (s.totalHours ?? 0), 0);
  const upcomingShifts = shifts.filter((s) => s.status === 'upcoming');

  const monthTrend = trendFrom(earnThisMonth, earnLastMonth);
  const weekTrend = trendFrom(hoursThisWeek, hoursLastWeek);

  const stats: StatCardData[] = [
    { title: 'This Month Earnings', value: money(earnThisMonth), icon: DollarSign, change: monthTrend.change, trend: monthTrend.trend, sub: 'vs last month' },
    { title: 'Work This Week', value: `${Math.round(hoursThisWeek * 10) / 10}h`, icon: Clock, change: weekTrend.change, trend: weekTrend.trend, sub: 'vs last week' },
    { title: 'Upcoming Shifts', value: String(upcomingShifts.length), icon: Calendar, change: null, trend: 'neutral', sub: 'scheduled ahead' },
    { title: 'Active Employers', value: String(activeEmployers), icon: Building2, change: null, trend: 'neutral', sub: 'currently active' },
  ];

  // Weekly earnings per weekday (Mon–Sun) for the bar chart.
  const weekBars = WEEKDAYS.map((day, i) => {
    const dayStart = new Date(weekStart);
    dayStart.setDate(dayStart.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const amount = shifts.filter((s) => inRange(s.date, dayStart, dayEnd)).reduce((a, s) => a + shiftEarnings(s), 0);
    return { day, amount };
  });
  const weekTotal = weekBars.reduce((a, b) => a + b.amount, 0);

  // Salary overview donut — earnings share per employer (top 5 + Other).
  const totalEarned = shifts.reduce((a, s) => a + shiftEarnings(s), 0);
  const byEmployer = new Map<string, number>();
  for (const s of shifts) {
    for (const w of s.salaries ?? []) {
      const name = w.employer?.employerName ?? 'Unassigned';
      byEmployer.set(name, (byEmployer.get(name) ?? 0) + (w.salary ?? 0));
    }
  }
  const sortedEmployers = [...byEmployer.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const topEmployers = sortedEmployers.slice(0, 5);
  const otherTotal = sortedEmployers.slice(5).reduce((a, [, v]) => a + v, 0);
  const donutSegments = [
    ...topEmployers.map(([label, v], i) => ({ label, color: DONUT_COLORS[i % DONUT_COLORS.length], pct: totalEarned > 0 ? Math.round((v / totalEarned) * 100) : 0 })),
    ...(otherTotal > 0 ? [{ label: 'Other', color: DONUT_COLORS[5], pct: Math.round((otherTotal / totalEarned) * 100) }] : []),
  ];

  // Next upcoming shifts for the table (soonest first).
  const upcomingRows = [...upcomingShifts]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4)
    .map((s) => ({
      id: s.id,
      employer: s.salaries?.[0]?.employer?.employerName || s.shiftName || s.shiftType || 'Shift',
      date: fmtDateShort(s.date),
      time: `${fmtTime(s.startTime)} – ${fmtTime(s.endTime)}`,
    }));

  if (!isHydrated || isLoading || !user) {
    return (
      <DashboardLayout>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 120, borderRadius: 10, background: '#efeded', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  const dateStr = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <DashboardLayout>
      <style>{`
        .rp-page { font-family: 'Montserrat', sans-serif; }

        /* Greeting */
        .rp-greeting h2 {
          font-size: 28px;
          font-weight: 700;
          color: #1b1c1c;
          margin: 0 0 4px;
          letter-spacing: -0.01em;
        }
        .dark .rp-greeting h2 { color: #f9fafb; }
        .rp-greeting p {
          font-size: 14px;
          color: #707783;
          margin: 0;
          font-weight: 400;
        }

        /* Quick actions */
        .rp-quick-actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        .rp-quick-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, #005ea3 0%, #006d30 100%);
          color: white;
          border: none;
          border-radius: 9px;
          padding: 16px 12px;
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.18s, box-shadow 0.18s;
          box-shadow: 0 4px 14px rgba(0, 94, 163, 0.25);
        }
        .rp-quick-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 20px rgba(0, 94, 163, 0.35);
          color: white;
        }

        /* Stat cards */
        .rp-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 28px;
        }
        .rp-stat-card {
          background: white;
          border-radius: 10px;
          padding: 24px;
          border: 1px solid rgba(0, 94, 163, 0.08);
          box-shadow: 0 4px 6px rgba(0, 123, 210, 0.06), 0 2px 4px rgba(0, 123, 210, 0.04);
          transition: transform 0.25s, box-shadow 0.25s;
          position: relative;
          overflow: hidden;
        }
        .rp-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(0, 94, 163, 0.12);
        }
        .dark .rp-stat-card {
          background: #1f2937;
          border-color: rgba(160, 201, 255, 0.08);
        }
        .rp-stat-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #707783;
          margin: 0 0 6px;
        }
        .dark .rp-stat-label { color: #9ca3af; }
        .rp-stat-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 22px;
          font-weight: 500;
          color: #005ea3;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .dark .rp-stat-value { color: #a0c9ff; }
        .rp-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 7px;
          background: linear-gradient(135deg, #005ea3 0%, #006d30 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Charts row */
        .rp-charts-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          margin-bottom: 28px;
        }

        /* Cards */
        .rp-card {
          background: white;
          border-radius: 10px;
          padding: 24px;
          border: 1px solid rgba(0, 94, 163, 0.08);
          box-shadow: 0 4px 6px rgba(0, 123, 210, 0.06);
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .rp-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 94, 163, 0.10);
        }
        .dark .rp-card {
          background: #1f2937;
          border-color: rgba(160, 201, 255, 0.08);
        }
        .rp-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #1b1c1c;
          margin: 0 0 24px;
        }
        .dark .rp-card-title { color: #f9fafb; }

        /* Chart legend */
        .rp-chart-legend {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .rp-legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .rp-legend-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #707783;
        }
        .rp-chart-footer {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(0, 94, 163, 0.08);
        }
        .rp-chart-footer-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #707783;
          margin: 0 0 4px;
        }
        .rp-chart-footer-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px;
          font-weight: 500;
          margin: 0;
        }

        /* Donut section */
        .rp-donut-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          margin-top: 8px;
        }
        .rp-donut-legends {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .rp-donut-legend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
        }
        .rp-donut-legend-left {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1b1c1c;
          font-weight: 500;
        }
        .dark .rp-donut-legend-left { color: #f3f4f6; }
        .rp-donut-pct {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #707783;
        }

        /* Bottom row */
        .rp-bottom-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }

        /* Shifts table */
        .rp-shifts-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .rp-view-link {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #005ea3;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .rp-view-link:hover { text-decoration: underline; }
        .rp-table { width: 100%; border-collapse: collapse; }
        .rp-table th {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #707783;
          padding: 0 0 12px;
          text-align: left;
          border-bottom: 1px solid rgba(0, 94, 163, 0.08);
        }
        .rp-table th:last-child { text-align: right; }
        .rp-table td {
          padding: 14px 0;
          font-size: 14px;
          color: #1b1c1c;
          border-bottom: 1px solid rgba(0, 94, 163, 0.06);
        }
        .dark .rp-table td { color: #f3f4f6; }
        .rp-table tr:last-child td { border-bottom: none; }
        .rp-employer-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .rp-employer-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: rgba(0, 94, 163, 0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }
        .rp-employer-name {
          font-weight: 600;
          font-size: 14px;
        }
        .rp-time-cell {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: #1b1c1c;
        }
        .dark .rp-time-cell { color: #d1d5db; }
        .rp-details-btn {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 6px;
          border: 1px solid rgba(0, 94, 163, 0.15);
          background: transparent;
          color: #005ea3;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .rp-details-btn:hover {
          background: #005ea3;
          color: white;
        }

        /* Activity timeline */
        .rp-timeline {
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
          padding-left: 2px;
        }
        .rp-timeline::before {
          content: '';
          position: absolute;
          left: 11px;
          top: 8px;
          bottom: 8px;
          width: 1.5px;
          background: rgba(0, 94, 163, 0.10);
        }
        .rp-timeline-item {
          display: flex;
          gap: 12px;
          padding-left: 8px;
          position: relative;
        }
        .rp-timeline-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          ring: 3px white;
          box-shadow: 0 0 0 3px white;
          z-index: 1;
        }
        .dark .rp-timeline-dot { box-shadow: 0 0 0 3px #1f2937; }
        .rp-timeline-text {
          font-size: 13px;
          color: #1b1c1c;
          font-weight: 400;
          line-height: 1.5;
          margin: 0;
        }
        .dark .rp-timeline-text { color: #d1d5db; }
        .rp-timeline-time {
          font-size: 11px;
          color: #707783;
          margin: 3px 0 0;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .rp-see-all-btn {
          width: 100%;
          margin-top: 16px;
          padding: 9px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #005ea3;
          border: none;
          background: transparent;
          border-radius: 7px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .rp-see-all-btn:hover { background: rgba(0, 94, 163, 0.06); }

        @media (max-width: 1024px) {
          .rp-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .rp-charts-row { grid-template-columns: 1fr; }
          .rp-bottom-row { grid-template-columns: 1fr; }
          .rp-quick-actions { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .rp-stats-grid { grid-template-columns: 1fr; }
          .rp-quick-actions { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="rp-page">
        {/* Greeting */}
        <div className="rp-greeting" style={{ marginBottom: 28 }}>
          <h2>{greeting}, {user.displayName}! 👋</h2>
          <p>{dateStr}</p>
        </div>

        {/* Quick Actions */}
        <div className="rp-quick-actions">
          {quickActions.map(({ label, icon: Icon, href }) => (
            <Link key={href} href={href} className="rp-quick-btn">
              <Icon size={18} strokeWidth={2.2} />
              {label}
            </Link>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="rp-stats-grid">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="rp-charts-row">
          {/* Weekly Earnings Bar Chart */}
          <div className="rp-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h4 className="rp-card-title" style={{ margin: 0 }}>This Week&apos;s Earnings</h4>
              <div className="rp-chart-legend">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="rp-legend-dot" style={{ background: '#005ea3' }} />
                  <span className="rp-legend-label">Earnings</span>
                </div>
              </div>
            </div>
            <BarChart bars={weekBars} />
            <div className="rp-chart-footer">
              <div>
                <p className="rp-chart-footer-label">Weekly Total</p>
                <p className="rp-chart-footer-val" style={{ color: '#005ea3' }}>{money(weekTotal)}</p>
              </div>
              <div>
                <p className="rp-chart-footer-label">This Month</p>
                <p className="rp-chart-footer-val" style={{ color: '#1b1c1c' }}>{money(earnThisMonth)}</p>
              </div>
              <div>
                <p className="rp-chart-footer-label">Hours / Week</p>
                <p className="rp-chart-footer-val" style={{ color: '#006d30' }}>{Math.round(hoursThisWeek * 10) / 10}h</p>
              </div>
            </div>
          </div>

          {/* Salary Donut */}
          <div className="rp-card">
            <h4 className="rp-card-title">Salary Overview</h4>
            {donutSegments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 8px', color: '#9ca3af' }}>
                <Building2 size={22} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ fontSize: 13 }}>No earnings recorded yet.</p>
              </div>
            ) : (
              <div className="rp-donut-section">
                <DonutChart segments={donutSegments} centerValue={money(totalEarned)} />
                <div className="rp-donut-legends">
                  {donutSegments.map((seg) => (
                    <div key={seg.label} className="rp-donut-legend-row">
                      <div className="rp-donut-legend-left">
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
                        <span>{seg.label}</span>
                      </div>
                      <span className="rp-donut-pct">{seg.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="rp-bottom-row">
          {/* Upcoming Shifts */}
          <div className="rp-card">
            <div className="rp-shifts-header">
              <h4 className="rp-card-title" style={{ margin: 0 }}>Upcoming Shifts</h4>
              <Link href="/dashboard/calendar" className="rp-view-link">
                View Calendar <ExternalLink size={12} />
              </Link>
            </div>
            {upcomingRows.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 8px', color: '#9ca3af' }}>
                <Calendar size={22} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ fontSize: 13 }}>No upcoming shifts scheduled.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th>Employer</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingRows.map((shift) => (
                      <tr key={shift.id}>
                        <td>
                          <div className="rp-employer-cell">
                            <div className="rp-employer-icon">
                              <Briefcase size={15} color="#005ea3" />
                            </div>
                            <span className="rp-employer-name">{shift.employer}</span>
                          </div>
                        </td>
                        <td style={{ color: '#707783' }}>{shift.date}</td>
                        <td className="rp-time-cell">{shift.time}</td>
                        <td style={{ textAlign: 'right' }}>
                          <Link href="/dashboard/calendar" className="rp-details-btn" style={{ textDecoration: 'none' }}>
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="rp-card">
            <h4 className="rp-card-title">Recent Activity</h4>
            {activitiesLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0', color: '#9ca3af' }}>
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 8px', color: '#9ca3af' }}>
                <Bell size={22} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ fontSize: 13 }}>No activity yet. Your actions will appear here.</p>
              </div>
            ) : (
              <div className="rp-timeline">
                {activities.map((act) => {
                  const meta = activityMeta(act.type);
                  const Icon = meta.icon;
                  return (
                    <div key={act.id} className="rp-timeline-item">
                      <div className="rp-timeline-dot" style={{ background: meta.bg }}>
                        <Icon size={12} color={meta.color} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="rp-timeline-text">{act.message}</p>
                        <p className="rp-timeline-time">{timeAgo(act.scheduledAt ?? act.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Link href="/dashboard/notifications" className="rp-see-all-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              See All Activity
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}