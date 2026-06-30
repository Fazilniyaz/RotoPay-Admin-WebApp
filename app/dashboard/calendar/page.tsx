'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Modal, ConfirmDialog } from '@/components/ui/modal';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  Clock,
  Users,
  Trash2,
  CalendarDays,
} from 'lucide-react';
import { Shift, CalendarEntry, ClockSession, ShiftType } from '@/lib/types';
import { listShifts } from '@/lib/services/shifts';
import { listCalendar, createCalendarEntry, deleteCalendarEntry } from '@/lib/services/calendar';
import { listClock } from '@/lib/services/clock';

const GRADIENT = 'linear-gradient(135deg, #005ea3 0%, #006d30 100%)';
const primaryStyle = { background: GRADIENT };
const cardCls =
  'bg-white dark:bg-[#1f2937] rounded-[10px] border border-[rgba(0,94,163,0.08)] dark:border-[rgba(160,201,255,0.08)] shadow-[0_4px_6px_rgba(0,123,210,0.06),0_2px_4px_rgba(0,123,210,0.04)]';
const inputCls =
  'w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-3 focus:border-[#005ea3] focus:ring-2 focus:ring-[#005ea3]/10 outline-none transition-all text-sm';
const labelCls = 'block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const typeDot: Record<ShiftType, string> = { day: 'bg-amber-500', night: 'bg-indigo-500', rotational: 'bg-teal-500' };

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const fmtTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—';
const within = (day: Date, startISO?: string | null, endISO?: string | null) => {
  if (!startISO || !endISO) return false;
  const s = new Date(startISO); s.setHours(0, 0, 0, 0);
  const e = new Date(endISO); e.setHours(23, 59, 59, 999);
  return day >= s && day <= e;
};
const toDateInput = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function CalendarPage() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Add-entry modal
  const [addOpen, setAddOpen] = useState(false);
  const [addDate, setAddDate] = useState<string>(toDateInput(new Date()));
  const [addTitle, setAddTitle] = useState('');
  const [addShiftId, setAddShiftId] = useState('');
  const [saving, setSaving] = useState(false);

  // Shift popup (who's clocked in)
  const [shiftPopup, setShiftPopup] = useState<Shift | null>(null);
  const [clockedIn, setClockedIn] = useState<ClockSession[]>([]);
  const [loadingClocked, setLoadingClocked] = useState(false);

  // Day detail popup
  const [dayPopup, setDayPopup] = useState<Date | null>(null);

  // Delete entry
  const [delTarget, setDelTarget] = useState<CalendarEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const cells = useMemo(() => {
    const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // days since Monday
    const gridStart = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
    return Array.from({ length: 42 }, (_, i) =>
      new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
    );
  }, [viewDate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const from = cells[0];
      const to = cells[cells.length - 1];
      const [shiftRes, entryRes] = await Promise.all([
        listShifts({ limit: 100 }),
        listCalendar({ from: from.toISOString(), to: new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59).toISOString() }),
      ]);
      setShifts(shiftRes.data);
      setEntries(entryRes);
    } catch {
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [cells]);

  useEffect(() => {
    load();
  }, [load]);

  const today = startOfDay(new Date());
  const monthLabel = viewDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const dayShifts = (d: Date) => shifts.filter((s) => within(d, s.startDate, s.endDate));
  const dayEntries = (d: Date) => entries.filter((e) => isSameDay(new Date(e.date), d));

  const openAdd = (d: Date) => {
    setAddDate(toDateInput(d));
    setAddTitle('');
    setAddShiftId('');
    setAddOpen(true);
  };

  const wordCount = addTitle.trim() ? addTitle.trim().split(/\s+/).length : 0;

  const submitAdd = async () => {
    if (!addTitle.trim()) {
      toast.error('Enter a title');
      return;
    }
    if (wordCount > 15) {
      toast.error('Title must be 15 words or fewer');
      return;
    }
    setSaving(true);
    try {
      await createCalendarEntry({
        date: new Date(addDate).toISOString(),
        title: addTitle.trim(),
        shiftId: addShiftId || undefined,
      });
      toast.success('Added to calendar');
      setAddOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add');
    } finally {
      setSaving(false);
    }
  };

  const openShift = async (shift: Shift) => {
    setShiftPopup(shift);
    setLoadingClocked(true);
    setClockedIn([]);
    try {
      const res = await listClock({ shiftId: shift.id, status: 'active', limit: 100 });
      setClockedIn(res.data);
    } catch {
      // ignore
    } finally {
      setLoadingClocked(false);
    }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    setDeleting(true);
    try {
      await deleteCalendarEntry(delTarget.id);
      toast.success('Entry removed');
      setDelTarget(null);
      load();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const addShiftOptions = shifts.filter((s) => within(new Date(addDate), s.startDate, s.endDate));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-[#005ea3]">Calendar</h1>
            <p className="text-sm text-gray-400 mt-0.5">Shifts and your day notes at a glance</p>
          </div>
          <button
            onClick={() => openAdd(new Date())}
            className="inline-flex items-center gap-2 px-5 py-3 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg shadow-[0_4px_14px_rgba(0,94,163,0.25)] hover:-translate-y-0.5 transition-all"
            style={primaryStyle}
          >
            <Plus className="h-4 w-4" />
            Add Entry
          </button>
        </div>

        {/* Month bar */}
        <div className={`${cardCls} p-3 sm:p-4 flex items-center justify-between`}>
          <button
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
            className="w-9 h-9 rounded-md flex items-center justify-center text-[#005ea3] hover:bg-[#005ea3]/[0.06] transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg text-[#1b1c1c] dark:text-white">{monthLabel}</h2>
            <button
              onClick={() => setViewDate(new Date())}
              className="text-[10px] font-bold uppercase tracking-widest text-[#005ea3] border border-[#005ea3]/20 rounded-md px-2.5 py-1 hover:bg-[#005ea3]/[0.06] transition-colors"
            >
              Today
            </button>
          </div>
          <button
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
            className="w-9 h-9 rounded-md flex items-center justify-center text-[#005ea3] hover:bg-[#005ea3]/[0.06] transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Grid */}
        <div className={`${cardCls} p-2 sm:p-3`}>
          {/* Weekday header */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#707783] dark:text-gray-400 py-2">
                <span className="hidden sm:inline">{w}</span>
                <span className="sm:hidden">{w[0]}</span>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px] text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {cells.map((d, i) => {
                const inMonth = d.getMonth() === viewDate.getMonth();
                const isToday = isSameDay(d, today);
                const ds = dayShifts(d);
                const de = dayEntries(d);
                const markers = [
                  ...ds.map((s) => ({ kind: 'shift' as const, s })),
                  ...de.map((e) => ({ kind: 'entry' as const, e })),
                ];
                return (
                  <div
                    key={i}
                    onClick={() => setDayPopup(d)}
                    className={`group relative min-h-[78px] sm:min-h-[108px] rounded-md border p-1 sm:p-1.5 transition-colors cursor-pointer hover:border-[#005ea3]/25 ${
                      inMonth
                        ? 'bg-white dark:bg-[#1f2937] border-[#005ea3]/[0.06] dark:border-white/5'
                        : 'bg-gray-50/60 dark:bg-white/[0.02] border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] sm:text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday
                            ? 'text-white'
                            : inMonth
                            ? 'text-[#1b1c1c] dark:text-gray-200'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                        style={isToday ? primaryStyle : undefined}
                      >
                        {d.getDate()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAdd(d);
                        }}
                        aria-label="Add entry"
                        className="w-5 h-5 rounded-md flex items-center justify-center text-[#005ea3] bg-[#005ea3]/[0.08] hover:bg-[#005ea3]/15 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-1 space-y-1">
                      {markers.slice(0, 3).map((m, j) =>
                        m.kind === 'shift' ? (
                          <button
                            key={`s${j}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              openShift(m.s);
                            }}
                            className="w-full flex items-center gap-1 px-1.5 py-0.5 rounded text-white text-[9px] sm:text-[10px] font-semibold truncate hover:opacity-90"
                            style={primaryStyle}
                          >
                            <Clock className="h-2.5 w-2.5 flex-shrink-0" />
                            <span className="truncate">{m.s.shiftName || m.s.shiftType || 'Shift'}</span>
                          </button>
                        ) : (
                          <button
                            key={`e${j}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDelTarget(m.e);
                            }}
                            className="w-full flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium truncate bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 hover:opacity-90"
                            title={m.e.title}
                          >
                            <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                            <span className="truncate">{m.e.title}</span>
                          </button>
                        )
                      )}
                      {markers.length > 3 && (
                        <p className="text-[9px] text-[#707783] dark:text-gray-400 pl-1">
                          +{markers.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#707783] dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={primaryStyle} /> Shift
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-400" /> Note
          </span>
        </div>
      </div>

      {/* Add entry modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add to Calendar"
        footer={
          <>
            <button
              onClick={() => setAddOpen(false)}
              className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-md border border-gray-200 dark:border-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={submitAdd}
              disabled={saving}
              className="flex-[2] inline-flex items-center justify-center gap-2 px-5 py-3 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg shadow-[0_4px_14px_rgba(0,94,163,0.25)] disabled:opacity-60"
              style={primaryStyle}
            >
              {saving ? 'Saving…' : 'Add Entry'}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" value={addDate} onChange={(e) => setAddDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Title (custom)</label>
              <span className={`text-[10px] font-mono ${wordCount > 15 ? 'text-red-500' : 'text-gray-400'}`}>
                {wordCount}/15 words
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. Gym session, Holiday…"
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              className={inputCls}
            />
          </div>
          {addShiftOptions.length > 0 && (
            <div>
              <label className={labelCls}>Link to a shift (optional)</label>
              <select value={addShiftId} onChange={(e) => setAddShiftId(e.target.value)} className={inputCls}>
                <option value="">None</option>
                {addShiftOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shiftType ?? 'Shift'} · {fmtTime(s.startTime)}–{fmtTime(s.endTime)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Modal>

      {/* Day detail popup */}
      <Modal
        open={!!dayPopup}
        onClose={() => setDayPopup(null)}
        title={
          dayPopup
            ? dayPopup.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : 'Day'
        }
        maxWidth="max-w-md"
      >
        {dayPopup && (
          <div className="space-y-5">
            {/* Shifts */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#707783] dark:text-gray-400 mb-2">
                Shifts ({dayShifts(dayPopup).length})
              </p>
              {dayShifts(dayPopup).length === 0 ? (
                <p className="text-xs text-gray-400">No shifts on this day.</p>
              ) : (
                <div className="space-y-2">
                  {dayShifts(dayPopup).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setDayPopup(null);
                        openShift(s);
                      }}
                      className="w-full text-left rounded-md border border-[#005ea3]/[0.08] dark:border-white/10 p-3 hover:bg-[#005ea3]/[0.04] transition-colors flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={primaryStyle}>
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-[#1b1c1c] dark:text-white truncate">
                          {s.shiftName || `${s.shiftType ?? ''} shift`.trim() || 'Shift'}
                        </p>
                        <p className="text-xs text-[#707783] dark:text-gray-400 font-mono">
                          {fmtTime(s.startTime)} – {fmtTime(s.endTime)} · {s.totalHours}h
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#707783] dark:text-gray-400">
                  Notes ({dayEntries(dayPopup).length})
                </p>
                <button
                  onClick={() => {
                    const d = dayPopup;
                    setDayPopup(null);
                    openAdd(d);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#005ea3] hover:underline"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
              {dayEntries(dayPopup).length === 0 ? (
                <p className="text-xs text-gray-400">No notes yet.</p>
              ) : (
                <div className="space-y-2">
                  {dayEntries(dayPopup).map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-900/10 p-3"
                    >
                      <span className="flex items-center gap-2 text-sm text-[#1b1c1c] dark:text-white min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="truncate">{e.title}</span>
                      </span>
                      <button
                        onClick={() => {
                          setDayPopup(null);
                          setDelTarget(e);
                        }}
                        className="text-red-400 hover:text-red-500 flex-shrink-0"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Shift popup — who's clocked in */}
      <Modal
        open={!!shiftPopup}
        onClose={() => setShiftPopup(null)}
        title="Shift Details"
        maxWidth="max-w-md"
      >
        {shiftPopup && (
          <div className="space-y-4">
            <div className="rounded-md bg-[#005ea3]/[0.04] dark:bg-white/5 border border-[#005ea3]/[0.06] dark:border-white/5 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={primaryStyle}>
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-[#1b1c1c] dark:text-white truncate">
                  {shiftPopup.shiftName || `${shiftPopup.shiftType ?? ''} shift`.trim()}
                </p>
                <p className="text-xs text-[#707783] dark:text-gray-400 font-mono">
                  {shiftPopup.shiftType ? `${shiftPopup.shiftType} · ` : ''}
                  {fmtTime(shiftPopup.startTime)} – {fmtTime(shiftPopup.endTime)} · {shiftPopup.totalHours}h
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-bold text-[#1b1c1c] dark:text-white">
              <Users className="h-4 w-4 text-[#005ea3]" />
              Currently clocked in
              <span className="ml-auto font-mono text-[#005ea3] dark:text-[#a0c9ff]">
                {loadingClocked ? '…' : clockedIn.length}
              </span>
            </div>

            {loadingClocked ? (
              <div className="flex justify-center py-6 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : clockedIn.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No one is clocked in for this shift right now.</p>
            ) : (
              <div className="space-y-2">
                {clockedIn.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-md border border-[#005ea3]/[0.08] dark:border-white/10 p-3">
                    <span className="font-semibold text-sm text-[#1b1c1c] dark:text-white">
                      {c.salary?.employer?.employerName ?? 'Employee'}
                    </span>
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                      ● since {fmtTime(c.clockInTime)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!delTarget}
        title="Remove entry?"
        message={`Remove "${delTarget?.title}" from the calendar?`}
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDelTarget(null)}
      />
    </DashboardLayout>
  );
}
