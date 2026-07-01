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
  CalendarPlus,
  Wallet2,
  Check,
  StickyNote,
  CalendarDays,
  User as UserIcon,
} from 'lucide-react';
import { Shift, CalendarEntry, CalendarEntryType, Employer } from '@/lib/types';
import { listShifts, createShift } from '@/lib/services/shifts';
import { listCalendar, createCalendarEntry, deleteCalendarEntry } from '@/lib/services/calendar';
import { listEmployers } from '@/lib/services/employers';
import { listSalaries } from '@/lib/services/salaries';
import { listPaidMonths, markMonthPaid, unmarkMonthPaid, PaidMonth } from '@/lib/services/payments';
import { fmtTime } from '@/lib/format';

const GRADIENT = 'linear-gradient(135deg, #005ea3 0%, #006d30 100%)';
const primaryStyle = { background: GRADIENT };
const cardCls =
  'bg-white dark:bg-[#1f2937] rounded-[10px] border border-[rgba(0,94,163,0.08)] dark:border-[rgba(160,201,255,0.08)] shadow-[0_4px_6px_rgba(0,123,210,0.06),0_2px_4px_rgba(0,123,210,0.04)]';
const inputCls =
  'w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-3 focus:border-[#005ea3] focus:ring-2 focus:ring-[#005ea3]/10 outline-none transition-all text-sm';
const labelCls = 'block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2';
const primaryBtn =
  'inline-flex items-center justify-center gap-2 px-5 py-3 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg shadow-[0_4px_14px_rgba(0,94,163,0.25)] hover:-translate-y-0.5 transition-all disabled:opacity-60';
const chipBtn =
  'inline-flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-lg border border-[#005ea3]/20 text-[#005ea3] dark:text-[#a0c9ff] hover:bg-[#005ea3]/[0.06] transition-all';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const PALETTE = ['#005ea3', '#006d30', '#b45309', '#7c3aed', '#dc2626', '#0891b2'];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const toDateInput = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
// noon avoids any timezone day-shift when serialising a picked day.
const dayISO = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12).toISOString();
const tint = (hex: string) => `${hex}22`;

const typeIcon: Record<CalendarEntryType, typeof Clock> = {
  shift: Clock,
  event: CalendarDays,
  memo: StickyNote,
};

export default function CalendarPage() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [paidMonths, setPaidMonths] = useState<PaidMonth[]>([]);
  const [loading, setLoading] = useState(true);

  // Employee scope (null = the user's own calendar).
  const [scopeEmployer, setScopeEmployer] = useState<Employer | null>(null);
  const [scopeShiftIds, setScopeShiftIds] = useState<Set<string> | null>(null);

  // Day detail popup
  const [dayPopup, setDayPopup] = useState<Date | null>(null);
  const [addKind, setAddKind] = useState<'event' | 'memo' | null>(null);
  const [addTitle, setAddTitle] = useState('');
  const [addColor, setAddColor] = useState(PALETTE[0]);
  const [shiftColor, setShiftColor] = useState(PALETTE[0]);
  const [busy, setBusy] = useState(false);

  // Delete entry
  const [delTarget, setDelTarget] = useState<CalendarEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Employee picker
  const [empOpen, setEmpOpen] = useState(false);

  // Mark month paid
  const [markOpen, setMarkOpen] = useState(false);
  const [payYear, setPayYear] = useState(() => new Date().getFullYear());
  const [payMonth, setPayMonth] = useState(() => new Date().getMonth() + 1);
  const [marking, setMarking] = useState(false);

  // Add-shift modal (from the calendar)
  const [scOpen, setScOpen] = useState(false);
  const [scDate, setScDate] = useState(toDateInput(new Date()));
  const [scName, setScName] = useState('');
  const [scStart, setScStart] = useState('09:00');
  const [scEnd, setScEnd] = useState('17:00');
  const [scHours, setScHours] = useState('8');
  const [scType, setScType] = useState('day');
  const [scSaving, setScSaving] = useState(false);

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
      const employerId = scopeEmployer?.id;
      const [shiftRes, entryRes, empRes, paidRes] = await Promise.all([
        listShifts({ limit: 100 }),
        listCalendar({
          from: from.toISOString(),
          to: new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59).toISOString(),
          employerId,
        }),
        listEmployers({ limit: 100 }),
        listPaidMonths(),
      ]);
      setShifts(shiftRes.data);
      setEntries(entryRes);
      setEmployers(empRes.data);
      setPaidMonths(paidRes);

      // When scoped to an employee, restrict "available shifts" to that
      // employee's wage-linked shifts.
      if (employerId) {
        const wageRes = await listSalaries({ employerId, limit: 200 });
        setScopeShiftIds(new Set(wageRes.data.map((w) => w.shiftId).filter(Boolean) as string[]));
      } else {
        setScopeShiftIds(null);
      }
    } catch {
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [cells, scopeEmployer]);

  useEffect(() => {
    load();
  }, [load]);

  const today = startOfDay(new Date());
  const monthLabel = viewDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const dayEntries = (d: Date) => entries.filter((e) => isSameDay(new Date(e.date), d));
  const availableShifts = (d: Date) =>
    shifts.filter(
      (s) => isSameDay(new Date(s.date), d) && (!scopeShiftIds || scopeShiftIds.has(s.id))
    );
  const isPaid = (year: number, month: number) =>
    paidMonths.some((p) => p.year === year && p.month === month);

  const shiftLabelText = (s: Shift) => s.shiftName || `${s.shiftType ?? 'Shift'}`;

  // ── Entry creation ───────────────────────────
  const addEntry = async (type: CalendarEntryType, title: string, color: string, shiftId?: string) => {
    if (!dayPopup) return;
    setBusy(true);
    try {
      await createCalendarEntry({
        date: dayISO(dayPopup),
        type,
        title,
        color,
        shiftId,
        employerId: scopeEmployer?.id,
      });
      toast.success('Added to calendar');
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add');
    } finally {
      setBusy(false);
    }
  };

  const submitAddNote = async () => {
    if (!addKind) return;
    const t = addTitle.trim();
    if (!t) {
      toast.error('Enter a name');
      return;
    }
    if (t.split(/\s+/).length > 15) {
      toast.error('Name must be 15 words or fewer');
      return;
    }
    await addEntry(addKind, t, addColor);
    setAddKind(null);
    setAddTitle('');
  };

  const showShiftOnCalendar = (s: Shift) => addEntry('shift', shiftLabelText(s), shiftColor, s.id);

  const confirmDelete = async () => {
    if (!delTarget) return;
    setDeleting(true);
    try {
      await deleteCalendarEntry(delTarget.id);
      toast.success('Removed');
      setDelTarget(null);
      load();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  // ── Mark month paid ──────────────────────────
  const submitMark = async () => {
    setMarking(true);
    try {
      await markMonthPaid(payYear, payMonth);
      toast.success(`${MONTHS[payMonth - 1]} ${payYear} marked as paid`);
      setMarkOpen(false);
      const paid = await listPaidMonths();
      setPaidMonths(paid);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to mark paid');
    } finally {
      setMarking(false);
    }
  };

  const toggleUnmark = async (p: PaidMonth) => {
    try {
      await unmarkMonthPaid(p.year, p.month);
      setPaidMonths((prev) => prev.filter((x) => x.id !== p.id));
      toast.success('Unmarked');
    } catch {
      toast.error('Failed to unmark');
    }
  };

  // ── Add shift from calendar ──────────────────
  const openAddShift = (d: Date) => {
    setScDate(toDateInput(d));
    setScName('');
    setScStart('09:00');
    setScEnd('17:00');
    setScHours('8');
    setScType('day');
    setScOpen(true);
  };

  // keep total hours in sync (overnight-aware)
  useEffect(() => {
    const start = new Date(`${scDate}T${scStart}`).getTime();
    let end = new Date(`${scDate}T${scEnd}`).getTime();
    if (isNaN(start) || isNaN(end)) return;
    if (end <= start) end += 86_400_000;
    const hours = (end - start) / 3_600_000;
    if (hours > 0) setScHours(String(Math.round(hours * 100) / 100));
  }, [scDate, scStart, scEnd]);

  const submitAddShift = async () => {
    if (!scType.trim()) {
      toast.error('Shift type is required');
      return;
    }
    setScSaving(true);
    try {
      await createShift({
        shiftName: scName.trim() || undefined,
        date: new Date(scDate).toISOString(),
        startTime: new Date(`${scDate}T${scStart}`).toISOString(),
        endTime: new Date(`${scDate}T${scEnd}`).toISOString(),
        totalHours: Number(scHours) || 0,
        shiftType: scType.trim(),
      });
      toast.success('Shift created');
      setScOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create shift');
    } finally {
      setScSaving(false);
    }
  };

  const currentMonthPaid = isPaid(viewDate.getFullYear(), viewDate.getMonth() + 1);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-[#005ea3]">Calendar</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {scopeEmployer ? (
                <span className="inline-flex items-center gap-1">
                  <UserIcon className="h-3.5 w-3.5" /> {scopeEmployer.employerName}’s schedule
                </span>
              ) : (
                'Your events, memos and shift labels'
              )}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setEmpOpen(true)} className={chipBtn}>
              <Users className="h-4 w-4" />
              {scopeEmployer ? 'Switch employee' : 'By employee'}
            </button>
            <button onClick={() => setMarkOpen(true)} className={chipBtn}>
              <Wallet2 className="h-4 w-4" />
              Mark month paid
            </button>
          </div>
        </div>

        {/* Month bar */}
        <div className={`${cardCls} p-3 sm:p-4 flex items-center justify-between`}>
          <button
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
            className="w-9 h-9 rounded-md flex items-center justify-center text-[#005ea3] hover:bg-[#005ea3]/[0.06] transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <h2 className="font-bold text-lg text-[#1b1c1c] dark:text-white">{monthLabel}</h2>
            {currentMonthPaid && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#006d30] bg-[#006d30]/10 rounded-full px-2 py-0.5">
                <Check className="h-3 w-3" /> Paid
              </span>
            )}
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
                const de = dayEntries(d);
                const nShifts = availableShifts(d).length;
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
                      <div className="flex items-center gap-1">
                        {nShifts > 0 && (
                          <span
                            className="text-[8px] font-bold text-[#005ea3] bg-[#005ea3]/[0.08] rounded px-1 py-0.5"
                            title={`${nShifts} shift(s) available`}
                          >
                            {nShifts}▪
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDayPopup(d);
                          }}
                          aria-label="Open day"
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[#005ea3] bg-[#005ea3]/[0.08] hover:bg-[#005ea3]/15 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-1 space-y-1">
                      {de.slice(0, 3).map((e) => (
                        <div
                          key={e.id}
                          className="w-full flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold truncate"
                          style={{ backgroundColor: tint(e.color || '#005ea3'), color: e.color || '#005ea3' }}
                          title={e.title}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: e.color || '#005ea3' }}
                          />
                          <span className="truncate">{e.title}</span>
                        </div>
                      ))}
                      {de.length > 3 && (
                        <p className="text-[9px] text-[#707783] dark:text-gray-400 pl-1">
                          +{de.length - 3} more
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
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#707783] dark:text-gray-400 flex-wrap">
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Shift label</span>
          <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Event</span>
          <span className="flex items-center gap-1.5"><StickyNote className="h-3.5 w-3.5" /> Memo</span>
          <span className="text-gray-400 normal-case tracking-normal">Tap any day to compose it.</span>
        </div>
      </div>

      {/* Day detail popup */}
      <Modal
        open={!!dayPopup}
        onClose={() => {
          setDayPopup(null);
          setAddKind(null);
          setAddTitle('');
        }}
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
          <div className="space-y-6">
            {/* On the calendar */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#707783] dark:text-gray-400 mb-2">
                On this day ({dayEntries(dayPopup).length})
              </p>
              {dayEntries(dayPopup).length === 0 ? (
                <p className="text-xs text-gray-400">Nothing on this day yet.</p>
              ) : (
                <div className="space-y-2">
                  {dayEntries(dayPopup).map((e) => {
                    const Icon = typeIcon[e.type];
                    return (
                      <div
                        key={e.id}
                        className="flex items-center justify-between gap-2 rounded-md border p-3"
                        style={{ borderColor: tint(e.color || '#005ea3'), backgroundColor: tint(e.color || '#005ea3') }}
                      >
                        <span className="flex items-center gap-2 text-sm min-w-0" style={{ color: e.color || '#005ea3' }}>
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate font-semibold">{e.title}</span>
                          <span className="text-[9px] uppercase tracking-wider opacity-70">{e.type}</span>
                        </span>
                        <button
                          onClick={() => setDelTarget(e)}
                          className="text-red-400 hover:text-red-500 flex-shrink-0"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Available shifts on this day */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#707783] dark:text-gray-400">
                  Available shifts ({availableShifts(dayPopup).length})
                </p>
                <button
                  onClick={() => {
                    const d = dayPopup;
                    setDayPopup(null);
                    openAddShift(d);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#005ea3] hover:underline"
                >
                  <CalendarPlus className="h-3.5 w-3.5" /> Add new shift
                </button>
              </div>
              {availableShifts(dayPopup).length === 0 ? (
                <p className="text-xs text-gray-400">No shifts on this day.</p>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] text-gray-400">Label colour:</span>
                    {PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => setShiftColor(c)}
                        className={`w-5 h-5 rounded-full border-2 ${shiftColor === c ? 'border-gray-500' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                        aria-label={`Colour ${c}`}
                      />
                    ))}
                  </div>
                  <div className="space-y-2">
                    {availableShifts(dayPopup).map((s) => {
                      const shown = dayEntries(dayPopup).some((e) => e.type === 'shift' && e.shiftId === s.id);
                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between gap-2 rounded-md border border-[#005ea3]/[0.08] dark:border-white/10 p-3"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-[#1b1c1c] dark:text-white truncate">
                              {shiftLabelText(s)}
                            </p>
                            <p className="text-xs text-[#707783] dark:text-gray-400 font-mono">
                              {fmtTime(s.startTime)} – {fmtTime(s.endTime)} · {s.totalHours}h
                            </p>
                          </div>
                          <button
                            disabled={shown || busy}
                            onClick={() => showShiftOnCalendar(s)}
                            className="text-[10px] font-bold uppercase tracking-widest text-[#005ea3] border border-[#005ea3]/20 rounded-md px-2.5 py-1.5 hover:bg-[#005ea3]/[0.06] transition-colors disabled:opacity-50 flex-shrink-0"
                          >
                            {shown ? 'Shown' : 'Show'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Add event / memo */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              {!addKind ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAddKind('event');
                      setAddColor(PALETTE[3]);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-md border border-[#005ea3]/20 text-[#005ea3] dark:text-[#a0c9ff] text-[11px] font-bold uppercase tracking-widest hover:bg-[#005ea3]/[0.06] transition-colors"
                  >
                    <CalendarDays className="h-4 w-4" /> Add event
                  </button>
                  <button
                    onClick={() => {
                      setAddKind('memo');
                      setAddColor(PALETTE[2]);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-md border border-[#005ea3]/20 text-[#005ea3] dark:text-[#a0c9ff] text-[11px] font-bold uppercase tracking-widest hover:bg-[#005ea3]/[0.06] transition-colors"
                  >
                    <StickyNote className="h-4 w-4" /> Add memo
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className={labelCls}>{addKind === 'event' ? 'Event name' : 'Memo name'}</label>
                  <input
                    type="text"
                    autoFocus
                    placeholder={addKind === 'event' ? 'e.g. Team meeting' : 'e.g. Bring uniform'}
                    value={addTitle}
                    onChange={(ev) => setAddTitle(ev.target.value)}
                    className={inputCls}
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400">Colour:</span>
                    {PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => setAddColor(c)}
                        className={`w-5 h-5 rounded-full border-2 ${addColor === c ? 'border-gray-500' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                        aria-label={`Colour ${c}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setAddKind(null);
                        setAddTitle('');
                      }}
                      className="flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitAddNote}
                      disabled={busy}
                      className={`flex-[2] ${primaryBtn}`}
                      style={primaryStyle}
                    >
                      {busy ? 'Adding…' : `Add ${addKind}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Employee picker */}
      <Modal open={empOpen} onClose={() => setEmpOpen(false)} title="Show calendar for" maxWidth="max-w-sm">
        <div className="space-y-2">
          <button
            onClick={() => {
              setScopeEmployer(null);
              setEmpOpen(false);
            }}
            className={`w-full flex items-center gap-3 rounded-md border p-3 text-left transition-colors ${
              !scopeEmployer ? 'border-[#005ea3] bg-[#005ea3]/[0.04]' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={primaryStyle}>
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-sm text-[#1b1c1c] dark:text-white">My calendar</span>
          </button>
          {employers.length === 0 && (
            <p className="text-xs text-gray-400 py-2">No employees yet — add them on the Employers page.</p>
          )}
          {employers.map((emp) => (
            <button
              key={emp.id}
              onClick={() => {
                setScopeEmployer(emp);
                setEmpOpen(false);
              }}
              className={`w-full flex items-center gap-3 rounded-md border p-3 text-left transition-colors ${
                scopeEmployer?.id === emp.id ? 'border-[#005ea3] bg-[#005ea3]/[0.04]' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#005ea3]/10 text-[#005ea3] font-bold text-sm">
                {emp.employerName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[#1b1c1c] dark:text-white truncate">{emp.employerName}</p>
                <p className="text-xs text-gray-400 truncate">{emp.store}</p>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Mark month paid */}
      <Modal
        open={markOpen}
        onClose={() => setMarkOpen(false)}
        title="Mark this month as paid"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              onClick={() => setMarkOpen(false)}
              className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-md border border-gray-200 dark:border-gray-700"
            >
              Close
            </button>
            <button onClick={submitMark} disabled={marking} className={`flex-[2] ${primaryBtn}`} style={primaryStyle}>
              {marking ? 'Saving…' : 'Confirm'}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <p className="text-xs text-gray-400">
            Marking a month paid records the total wages of that month’s shifts and updates the
            <span className="font-semibold text-[#005ea3]"> This Month Pay</span> and
            <span className="font-semibold text-[#005ea3]"> Total Pay</span> tabs on Shifts.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Month</label>
              <select value={payMonth} onChange={(e) => setPayMonth(Number(e.target.value))} className={inputCls}>
                {MONTHS.map((m, idx) => (
                  <option key={m} value={idx + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Year</label>
              <select value={payYear} onChange={(e) => setPayYear(Number(e.target.value))} className={inputCls}>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {paidMonths.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#707783] dark:text-gray-400 mb-2">
                Paid months
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {paidMonths.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-md border border-[#006d30]/20 bg-[#006d30]/[0.04] p-2.5">
                    <span className="text-sm text-[#1b1c1c] dark:text-white">
                      {MONTHS[p.month - 1]} {p.year}
                    </span>
                    <button
                      onClick={() => toggleUnmark(p)}
                      className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-500"
                    >
                      Unmark
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Add shift from calendar */}
      <Modal
        open={scOpen}
        onClose={() => setScOpen(false)}
        title="Add Shift"
        maxWidth="max-w-lg"
        footer={
          <>
            <button
              onClick={() => setScOpen(false)}
              className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-md border border-gray-200 dark:border-gray-700"
            >
              Cancel
            </button>
            <button onClick={submitAddShift} disabled={scSaving} className={`flex-[2] ${primaryBtn}`} style={primaryStyle}>
              {scSaving ? 'Saving…' : 'Save Shift'}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Shift Name (optional)</label>
            <input type="text" value={scName} onChange={(e) => setScName(e.target.value)} className={inputCls} placeholder="e.g. Morning Floor" />
          </div>
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" value={scDate} onChange={(e) => setScDate(e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Start Time</label>
              <input type="time" value={scStart} onChange={(e) => setScStart(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Time</label>
              <input type="time" value={scEnd} onChange={(e) => setScEnd(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Total Hours</label>
              <input type="number" min={0} step="0.25" value={scHours} onChange={(e) => setScHours(e.target.value)} className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className={labelCls}>Shift Type</label>
              <input type="text" value={scType} onChange={(e) => setScType(e.target.value)} className={inputCls} placeholder="day / night / custom" />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!delTarget}
        title="Remove from calendar?"
        message={`Remove "${delTarget?.title}" from the calendar?`}
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDelTarget(null)}
      />
    </DashboardLayout>
  );
}
