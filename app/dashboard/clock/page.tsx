'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Play, Square } from 'lucide-react';

const mockEmployers = [
  { id: 1, name: 'Coffee Co', rate: 10 },
  { id: 2, name: 'Retail Plus', rate: 12 },
  { id: 3, name: 'Delivery Co', rate: 15 },
];

const mockSessions = [
  { id: 1, employer: 'Coffee Co', clockIn: '09:00', clockOut: '17:00', hours: 8, earnings: 80 },
  { id: 2, employer: 'Retail Plus', clockIn: '18:00', clockOut: '21:00', hours: 3, earnings: 96 },
  { id: 3, employer: 'Delivery Co', clockIn: '09:00', clockOut: '12:30', hours: 3.5, earnings: 52.5 },
];

export default function ClockPage() {
  const [isClocked, setIsClocked] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [clockInTime, setClockInTime] = useState('');

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // Active session timer
  useEffect(() => {
    if (!isClocked) return;
    const timer = setInterval(() => setSecondsElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isClocked]);

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const activeEmployer = mockEmployers.find((e) => e.id.toString() === selectedEmployer);
  const estimatedEarnings = activeEmployer
    ? ((secondsElapsed / 3600) * activeEmployer.rate).toFixed(2)
    : '0.00';

  const dailyTotal = mockSessions.reduce((sum, s) => sum + s.earnings, 0);
  const dailyHours = mockSessions.reduce((sum, s) => sum + s.hours, 0);

  const handleClockIn = () => {
    if (!selectedEmployer) return;
    setIsClocked(true);
    setSecondsElapsed(0);
    setClockInTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
  };

  const handleClockOut = () => {
    setIsClocked(false);
    setSelectedEmployer('');
    setSecondsElapsed(0);
    setClockInTime('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-[#005ea3]">Clock In/Out</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track your working hours in real-time</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left: Main Clock + Active Session */}
          <div className="lg:col-span-7 space-y-6">

            {/* Main Clock Card */}
            <div className="bg-white rounded-xl border border-gray-200/80 p-10 flex flex-col items-center text-center"
              style={{ boxShadow: '0 4px 6px -1px rgba(0,94,163,0.08)' }}>
              {/* Live Time */}
              <div className="font-mono text-[64px] leading-tight font-medium text-[#005ea3] tracking-tighter mb-1">
                {currentTime || '00:00:00'}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-10">
                {currentDate}
              </div>

              {/* Employer Select */}
              <div className="w-full max-w-md space-y-5">
                <div className="relative">
                  <label className="absolute -top-2.5 left-4 bg-white px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 z-10">
                    Employer
                  </label>
                  <select
                    value={selectedEmployer}
                    onChange={(e) => setSelectedEmployer(e.target.value)}
                    disabled={isClocked}
                    className="w-full h-14 bg-gray-50 border border-gray-200 rounded-lg px-4 text-sm text-gray-800 focus:ring-2 focus:ring-[#005ea3] focus:border-transparent outline-none appearance-none transition-all disabled:opacity-50"
                  >
                    <option value="">Select an employer to clock in...</option>
                    {mockEmployers.map((e) => (
                      <option key={e.id} value={e.id.toString()}>
                        {e.name} — £{e.rate}/h
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>

                {/* Clock Button */}
                {!isClocked ? (
                  <button
                    onClick={handleClockIn}
                    disabled={!selectedEmployer}
                    className="w-full h-16 rounded-lg text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{ background: 'linear-gradient(135deg, #005ea3 0%, #006a44 100%)' }}
                  >
                    <Play className="h-6 w-6 fill-white" />
                    Clock In
                  </button>
                ) : (
                  <button
                    onClick={handleClockOut}
                    className="w-full h-16 rounded-lg text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 bg-red-500 hover:bg-red-600"
                  >
                    <Square className="h-6 w-6 fill-white" />
                    Clock Out
                  </button>
                )}
              </div>
            </div>

            {/* Active Session Card */}
            {isClocked && (
              <div className="bg-white rounded-xl border-l-4 border-[#006a44] border border-gray-200/80 overflow-hidden"
                style={{ boxShadow: '0 4px 12px rgba(0,106,68,0.12)' }}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      {/* Pulse dot */}
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                      <h4 className="font-bold text-gray-900">Active Session</h4>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                      In Progress
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Clocked In</p>
                      <p className="font-mono text-lg font-semibold text-gray-900">{clockInTime}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Duration</p>
                      <p className="font-mono text-lg font-semibold text-[#005ea3]">{formatDuration(secondsElapsed)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Est. Earnings</p>
                      <p className="font-mono text-lg font-semibold text-[#006a44]">£{estimatedEarnings}</p>
                    </div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1 bg-gray-100">
                  <div
                    className="h-full bg-[#006a44] transition-all duration-1000"
                    style={{ width: `${Math.min((secondsElapsed / 28800) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Daily Summary + Recent Sessions */}
          <div className="lg:col-span-5 space-y-6">

            {/* Daily Summary Card */}
            <div
              className="rounded-xl p-6 text-white relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #005ea3 0%, #006a44 100%)' }}
            >
              <div className="relative z-10">
                <h4 className="font-bold mb-5">Daily Summary</h4>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Total Hours</p>
                    <p className="font-mono text-5xl font-bold">{dailyHours.toFixed(1)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Daily Total</p>
                    <p className="font-mono text-3xl font-medium">£{dailyTotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              {/* Decorative blobs */}
              <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute right-10 top-0 w-16 h-16 bg-green-400/20 rounded-full blur-2xl" />
            </div>

            {/* Recent Sessions Table */}
            <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden flex flex-col"
              style={{ boxShadow: '0 4px 6px -1px rgba(0,94,163,0.08)' }}>
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h4 className="font-bold text-gray-900">Recent Sessions</h4>
                <button className="text-[11px] font-bold uppercase tracking-widest text-[#005ea3] hover:underline">
                  View All
                </button>
              </div>

              <div className="overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Employer</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Time</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-sm text-gray-900 truncate">{session.employer}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                            Completed
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm text-gray-800">{session.clockIn} – {session.clockOut}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{session.hours}h</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-mono font-bold text-[#006a44]">£{session.earnings.toFixed(2)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}