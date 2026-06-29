'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, TrendingUp, DollarSign, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';

type EventType = 'shift' | 'event' | 'meeting' | 'overtime';

interface CalEvent {
  type: EventType;
  title: string;
  employer?: string;
  time?: string;
}

const EVENT_STYLES: Record<EventType, string> = {
  shift: 'bg-gradient-to-r from-[#0077cc] to-[#005ea3] text-white',
  event: 'bg-gradient-to-r from-[#008557] to-[#006a44] text-white',
  meeting: 'bg-gradient-to-r from-[#0077cc] to-[#008557] text-white',
  overtime: 'bg-gradient-to-r from-[#0077cc] to-[#008557] text-white',
};

const MOCK_EVENTS: Record<number, CalEvent[]> = {
  2: [{ type: 'shift', title: 'Day Shift', employer: 'Coffee Co', time: '09:00' }],
  4: [{ type: 'meeting', title: 'Client Meeting', time: '11:00' }],
  6: [{ type: 'shift', title: 'Night Shift', employer: 'Retail Plus', time: '22:00' }],
  10: [
    { type: 'meeting', title: 'Review Call', time: '14:00' },
    { type: 'event', title: 'Gym Session' },
  ],
  12: [{ type: 'shift', title: 'Morning Shift', employer: 'Coffee Co', time: '08:00' }],
  17: [{ type: 'event', title: 'Dental Appt.' }],
  18: [
    { type: 'shift', title: 'Work', employer: 'Coffee Co' },
    { type: 'event', title: 'Meeting' },
  ],
  19: [{ type: 'shift', title: 'Work', employer: 'Retail Plus' }],
  20: [{ type: 'shift', title: 'Work', employer: 'Coffee Co' }],
  21: [{ type: 'overtime', title: 'Overtime', employer: 'Delivery Co', time: '18:00' }],
};

const UPCOMING = [
  { date: 'Today, 14:00', title: 'Coffee Co Shift', type: 'shift' as EventType },
  { date: 'Tomorrow, 09:00', title: 'Retail Plus Shift', type: 'shift' as EventType },
  { date: 'This week, 10:00', title: 'Coffee Co Shift', type: 'shift' as EventType },
];

const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'];
const BAR_HEIGHTS = ['40%', '65%', '85%', '95%', '50%', '30%', '60%'];

type ViewMode = 'Month' | 'Week' | 'Day';

export default function CalendarPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [viewMode, setViewMode] = useState<ViewMode>('Month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const emptySlots = Array.from({ length: firstDayOfWeek }, () => null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const allDays = [...emptySlots, ...days];

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const goToPrev = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNext = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

  const monthLabel = currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1280px] mx-auto">

        {/* ── Page Header ── */}
        <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#005ea3]">Calendar</h1>
            <p className="text-sm text-[#404752] dark:text-gray-200 mt-0.5">View your schedule at a glance</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
            style={{ background: 'linear-gradient(135deg,#0077cc 0%,#005ea3 100%)' }}>
            <Plus className="h-4 w-4" />
            Add Event
          </button>
        </section>

        {/* ── Controls Row ── */}
        <section className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#f5f3f3] dark:bg-gray-800 p-4 rounded-xl border border-[#c0c7d4] dark:border-gray-700/30 dark:border-gray-700/80 shadow-sm">
          {/* Month Nav */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white dark:bg-[#1f2937] border border-[#c0c7d4] dark:border-gray-700/40 dark:border-gray-700/80 rounded-lg overflow-hidden">
              <button onClick={goToPrev}
                className="p-2 text-[#005ea3] hover:bg-[#efeded] dark:bg-gray-700 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-5 py-1.5 font-semibold text-[#005ea3] text-sm whitespace-nowrap">
                {monthLabel}
              </span>
              <button onClick={goToNext}
                className="p-2 text-[#005ea3] hover:bg-[#efeded] dark:bg-gray-700 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button onClick={goToToday}
              className="px-4 py-2 bg-white dark:bg-[#1f2937] border border-[#c0c7d4] dark:border-gray-700/40 dark:border-gray-700/80 rounded-lg text-sm font-bold text-[#404752] dark:text-gray-200 hover:text-[#005ea3] dark:hover:text-[#a0c9ff] transition-colors">
              Today
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex bg-white dark:bg-[#1f2937] border border-[#c0c7d4] dark:border-gray-700/40 dark:border-gray-700/80 rounded-lg overflow-hidden p-1 gap-1">
            {(['Month', 'Week', 'Day'] as ViewMode[]).map(v => (
              <button key={v}
                onClick={() => setViewMode(v)}
                className={`px-5 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === v
                    ? 'bg-[#0077cc] text-white shadow-sm'
                    : 'text-[#404752] dark:text-gray-200 hover:text-[#005ea3] dark:hover:text-[#a0c9ff]'
                  }`}>
                {v}
              </button>
            ))}
          </div>
        </section>

        {/* ── Calendar Grid ── */}
        <section className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-lg border border-[#c0c7d4] dark:border-gray-700/30 dark:border-gray-700/80 overflow-hidden">
          {/* Day-name headers */}
          <div className="grid grid-cols-7 border-b border-[#c0c7d4] dark:border-gray-700/20 dark:border-gray-700/80 bg-[#f5f3f3]/60 dark:bg-gray-80060">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-3 text-center text-[10px] font-bold tracking-widest uppercase text-[#404752] dark:text-gray-200/60 dark:text-gray-400">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {allDays.map((day, idx) => {
              const events = day ? MOCK_EVENTS[day] ?? [] : [];
              const todayCell = day !== null && isToday(day);

              return (
                <div
                  key={idx}
                  className={[
                    'min-h-[100px] sm:min-h-[120px] p-2 border-r border-b border-[#c0c7d4] dark:border-gray-700/20 dark:border-gray-700/80 transition-colors duration-150',
                    day
                      ? todayCell
                        ? 'bg-[#005ea3]/5 dark:bg-[#a0c9ff]/10 ring-2 ring-inset ring-[#005ea3]'
                        : 'hover:bg-[#f5f3f3] dark:bg-gray-800 cursor-pointer'
                      : 'bg-[#efeded]/30 dark:bg-gray-70030',
                    // remove right border on last col
                    (idx + 1) % 7 === 0 ? 'border-r-0' : '',
                  ].join(' ')}
                >
                  {day && (
                    <>
                      {/* Day number */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-bold ${todayCell ? 'text-[#005ea3]' : 'text-[#1b1c1c] dark:text-white'}`}>
                          {day}
                        </span>
                        {todayCell && (
                          <span className="text-[9px] font-bold text-[#005ea3] bg-[#005ea3]/10 dark:bg-[#a0c9ff]/20 px-1.5 py-0.5 rounded">
                            TODAY
                          </span>
                        )}
                      </div>

                      {/* Events */}
                      <div className="space-y-1 overflow-hidden">
                        {events.map((ev, i) => (
                          <div
                            key={i}
                            title={ev.employer ? `${ev.title}${ev.time ? ' ' + ev.time : ''} — ${ev.employer}` : ev.title}
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold truncate shadow-sm ${EVENT_STYLES[ev.type]}`}
                          >
                            {ev.time ? `${ev.title}: ${ev.time}` : ev.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {/* Faded prev-month numbers */}
                  {!day && idx < 7 && (
                    <span className="text-xs text-[#404752] dark:text-gray-200/30 dark:text-gray-500 dark:text-gray-400">
                      {new Date(year, month, idx - firstDayOfWeek + 1).getDate() ||
                        new Date(year, month, 0).getDate() - (firstDayOfWeek - idx - 1)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Bottom Widgets ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">

          {/* Monthly Utilisation Bar Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1f2937] p-6 rounded-2xl border border-[#c0c7d4] dark:border-gray-700/20 dark:border-gray-700/80 shadow-sm">
            <h3 className="flex items-center gap-2 text-base font-bold text-[#005ea3] mb-4">
              <TrendingUp className="h-5 w-5" />
              Monthly Utilisation
            </h3>
            <div className="flex items-end justify-between h-36 gap-2">
              {BAR_HEIGHTS.map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-1 w-full">
                  <div
                    className={`w-full rounded-t-md transition-all hover:opacity-90 ${i === 3
                        ? 'bg-gradient-to-t from-[#005ea3] to-[#0077cc]'
                        : 'bg-[#efeded] dark:bg-gray-700 hover:bg-[#e4e2e2]'
                      }`}
                    style={{ height: h }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {WEEKS.map(w => (
                <span key={w} className="text-[10px] font-bold tracking-widest uppercase text-[#404752] dark:text-gray-200/50 dark:text-gray-400 w-full text-center">
                  {w}
                </span>
              ))}
            </div>
          </div>

          {/* Upcoming Earnings Card */}
          <div
            className="relative overflow-hidden p-6 rounded-2xl shadow-xl flex flex-col justify-between text-white"
            style={{ background: 'linear-gradient(135deg,#0077cc 0%,#005ea3 100%)' }}
          >
            {/* Atmospheric glow */}
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-white dark:bg-[#1f2937]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <p className="text-[10px] font-bold tracking-widest uppercase opacity-80 mb-1">
                Upcoming Earnings
              </p>
              <h4 className="text-3xl font-extrabold font-mono">$2,450.80</h4>
              <p className="text-xs opacity-80 mt-2 leading-relaxed">
                Estimated total for {currentDate.toLocaleDateString('en-GB', { month: 'long' })} based on scheduled shifts.
              </p>
            </div>

            {/* Upcoming shifts list */}
            <div className="relative mt-5 space-y-2">
              {UPCOMING.map((ev, i) => (
                <div key={i} className="flex items-center gap-3 bg-white dark:bg-[#1f2937]/15 backdrop-blur-sm rounded-lg px-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#42e09c] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{ev.title}</p>
                    <p className="text-[10px] opacity-70">{ev.date}</p>
                  </div>
                </div>
              ))}
              <button className="w-full mt-2 bg-white dark:bg-[#1f2937]/20 hover:bg-white dark:bg-[#1f2937]/30 transition-colors py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                View Details <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
}