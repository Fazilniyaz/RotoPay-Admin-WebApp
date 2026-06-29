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
  PlusCircle,
  UserCog,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';

// ─── Mock Data ────────────────────────────────────────────────────
const mockStats = [
  {
    title: 'Total Earnings (This Month)',
    value: '£2,450.00',
    icon: DollarSign,
    change: 12.5,
    trend: 'up' as const,
    sub: 'vs last month',
  },
  {
    title: 'Hours Worked (This Week)',
    value: '38.5h',
    icon: Clock,
    change: 4.2,
    trend: 'up' as const,
    sub: 'vs last week',
  },
  {
    title: 'Upcoming Shifts (7 Days)',
    value: '5',
    icon: Calendar,
    change: 2.1,
    trend: 'down' as const,
    sub: 'vs last period',
  },
  {
    title: 'Active Employers',
    value: '3',
    icon: Building2,
    change: null,
    trend: 'neutral' as const,
    sub: 'Stabilized',
  },
];

const barData = [
  { day: 'Mon', income: 60, expense: 30 },
  { day: 'Tue', income: 85, expense: 45 },
  { day: 'Wed', income: 40, expense: 20 },
  { day: 'Thu', income: 95, expense: 10 },
  { day: 'Fri', income: 70, expense: 50 },
];

const donutSegments = [
  { label: 'Coffee Co', pct: 45, color: '#0077cc' },
  { label: 'Tech Solutions', pct: 35, color: '#6aff90' },
  { label: 'Retail Hub', pct: 20, color: '#008557' },
];

const mockUpcomingShifts = [
  { id: 1, employer: 'Coffee Co', date: 'Tomorrow', time: '09:00 – 17:00', icon: '☕' },
  { id: 2, employer: 'Tech Solutions', date: 'Wed, 25 Oct', time: '10:00 – 18:00', icon: '💻' },
  { id: 3, employer: 'Retail Hub', date: 'Fri, 27 Oct', time: '12:00 – 20:00', icon: '🛍️' },
];

const mockActivities = [
  { id: 1, icon: LogOut, color: '#49e177', bg: 'rgba(73,225,119,0.15)', text: 'Clocked out from Coffee Co', time: '2 hours ago' },
  { id: 2, icon: PlusCircle, color: '#0077cc', bg: 'rgba(0,119,204,0.12)', text: 'New shift added: Retail Hub', time: 'Yesterday, 18:45' },
  { id: 3, icon: UserCog, color: '#888', bg: 'rgba(136,136,136,0.1)', text: 'Profile updated', time: 'Saturday, 14:20' },
  { id: 4, icon: Wallet, color: '#008557', bg: 'rgba(0,133,87,0.12)', text: 'Payment confirmed: £420.00', time: 'Oct 20, 09:00' },
];

const quickActions = [
  { label: 'Clock In', icon: Timer, href: '/dashboard/clock' },
  { label: 'Add Shift', icon: Plus, href: '/dashboard/shifts' },
  { label: 'Reports', icon: FileText, href: '/dashboard/reports' },
  { label: 'Employers', icon: Briefcase, href: '/dashboard/employers' },
];

// ─── Donut SVG helper ──────────────────────────────────────────────
function DonutChart() {
  const r = 64;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;
  const slices = donutSegments.map((seg) => {
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
        <span style={{ fontSize: 16, fontFamily: '"JetBrains Mono", monospace', fontWeight: 500, color: '#005ea3' }}>£2,450</span>
      </div>
    </div>
  );
}

// ─── Bar Chart ─────────────────────────────────────────────────────
function BarChart() {
  return (
    <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 16, padding: '0 8px' }}>
      {barData.map((d) => (
        <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }}>
          <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', gap: 3 }}>
            <div
              style={{
                flex: 1,
                height: `${d.income}%`,
                background: 'linear-gradient(180deg, #005ea3 0%, #006d30 100%)',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.4s ease',
              }}
            />
            <div
              style={{
                flex: 1,
                height: `${d.expense}%`,
                background: '#6aff90',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.4s ease',
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
function StatCard({ title, value, icon: Icon, change, trend, sub }: typeof mockStats[0]) {
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

  useEffect(() => {
    if (isHydrated) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated || isLoading || !user) {
    return (
      <DashboardLayout>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 120, borderRadius: 16, background: '#efeded', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  const now = new Date();
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
          border-radius: 14px;
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
          border-radius: 16px;
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
          border-radius: 10px;
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
          border-radius: 16px;
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
          border-radius: 8px;
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
          border-radius: 8px;
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
          border-radius: 10px;
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
          {mockStats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="rp-charts-row">
          {/* Income & Expense Bar Chart */}
          <div className="rp-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h4 className="rp-card-title" style={{ margin: 0 }}>Income &amp; Expense Tracking</h4>
              <div className="rp-chart-legend">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="rp-legend-dot" style={{ background: '#005ea3' }} />
                  <span className="rp-legend-label">Income</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="rp-legend-dot" style={{ background: '#6aff90' }} />
                  <span className="rp-legend-label">Expenses</span>
                </div>
              </div>
            </div>
            <BarChart />
            <div className="rp-chart-footer">
              <div>
                <p className="rp-chart-footer-label">Weekly Total</p>
                <p className="rp-chart-footer-val" style={{ color: '#005ea3' }}>£642.50</p>
              </div>
              <div>
                <p className="rp-chart-footer-label">Monthly Target</p>
                <p className="rp-chart-footer-val" style={{ color: '#1b1c1c' }}>£3,000.00</p>
              </div>
              <div>
                <p className="rp-chart-footer-label">Target Pace</p>
                <p className="rp-chart-footer-val" style={{ color: '#006d30' }}>1.2x</p>
              </div>
            </div>
          </div>

          {/* Salary Donut */}
          <div className="rp-card">
            <h4 className="rp-card-title">Salary Overview</h4>
            <div className="rp-donut-section">
              <DonutChart />
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
                  {mockUpcomingShifts.map((shift) => (
                    <tr key={shift.id}>
                      <td>
                        <div className="rp-employer-cell">
                          <div className="rp-employer-icon">{shift.icon}</div>
                          <span className="rp-employer-name">{shift.employer}</span>
                        </div>
                      </td>
                      <td style={{ color: '#707783' }}>{shift.date}</td>
                      <td className="rp-time-cell">{shift.time}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="rp-details-btn">Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rp-card">
            <h4 className="rp-card-title">Recent Activity</h4>
            <div className="rp-timeline">
              {mockActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="rp-timeline-item">
                    <div
                      className="rp-timeline-dot"
                      style={{ background: act.bg }}
                    >
                      <Icon size={12} color={act.color} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="rp-timeline-text">{act.text}</p>
                      <p className="rp-timeline-time">{act.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="rp-see-all-btn">See All Activity</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}