'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Modal, ConfirmDialog } from '@/components/ui/modal';
import {
  Plus,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Loader2,
  CalendarRange,
  Search,
  Wallet2,
  Building2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Employer, Shift, ShiftStatus, Salary } from '@/lib/types';
import { listEmployers } from '@/lib/services/employers';
import {
  listShifts,
  createShift,
  updateShift,
  deleteShift,
} from '@/lib/services/shifts';
import { listSalaries, createSalary } from '@/lib/services/salaries';
import { settingsStore } from '@/store/settingsStore';
import { money, currencySymbol, CURRENCIES, fmtDateShort as fmtDate, fmtTime } from '@/lib/format';

const labelCls = 'block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2';
const inputCls =
  'w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-3 focus:border-[#005ea3] focus:ring-2 focus:ring-[#005ea3]/10 outline-none transition-all text-sm';
const primaryBtn =
  'flex items-center justify-center gap-2 px-5 py-3 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg shadow-[0_4px_14px_rgba(0,94,163,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,94,163,0.35)] transition-all disabled:opacity-60 disabled:hover:translate-y-0';
const secondaryBtn =
  'flex items-center justify-center gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-widest rounded-lg border border-[#005ea3]/20 text-[#005ea3] dark:text-[#a0c9ff] hover:bg-[#005ea3]/[0.06] transition-all disabled:opacity-60';
// Brand gradient + premium card system.
const GRADIENT = 'linear-gradient(135deg, #005ea3 0%, #006d30 100%)';
const primaryStyle = { background: GRADIENT };
const cardCls =
  'bg-white dark:bg-[#1f2937] rounded-[10px] border border-[rgba(0,94,163,0.08)] dark:border-[rgba(160,201,255,0.08)] shadow-[0_4px_6px_rgba(0,123,210,0.06),0_2px_4px_rgba(0,123,210,0.04)] hover:shadow-[0_10px_24px_rgba(0,94,163,0.12)] hover:-translate-y-1 transition-all duration-300';

// Preset types + a "custom" escape hatch (user types their own label).
const PRESET_TYPES = ['day', 'night', 'rotational'] as const;
const knownBadge: Record<string, string> = {
  day: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  night: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  rotational: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
};
const typeBadgeCls = (t?: string | null) =>
  (t && knownBadge[t]) ||
  'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300';

const statusMeta: Record<ShiftStatus, { label: string; cls: string }> = {
  upcoming: {
    label: 'Upcoming',
    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  isActive: {
    label: 'Active',
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  completed: {
    label: 'Completed',
    cls: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  },
};

type Filter = 'all' | ShiftStatus | 'wages';
const STATUS_FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'isActive', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'wages', label: 'Wages' },
];

// Preset label colours for shifts (rendered on the calendar).
const SHIFT_COLORS = ['#005ea3', '#006d30', '#b45309', '#7c3aed', '#0891b2', '#be123c'];

interface ShiftForm {
  shiftName: string;
  startTime: string;
  endTime: string;
  typeChoice: string; // preset value or 'custom'
  customType: string;
  color: string;
  notes: string;
}

const todayInput = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): ShiftForm => ({
  shiftName: '',
  startTime: '09:00',
  endTime: '17:00',
  typeChoice: 'day',
  customType: '',
  color: SHIFT_COLORS[0],
  notes: '',
});

// ── date/time helpers ──────────────────────────
const combineISO = (date: string, time: string) => new Date(`${date}T${time}`).toISOString();
const toTimeInput = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// Hours between two HH:mm strings for today (overnight-aware), 2dp.
const hoursBetween = (startTime: string, endTime: string): number => {
  const today = todayInput();
  const start = new Date(`${today}T${startTime}`).getTime();
  let end = new Date(`${today}T${endTime}`).getTime();
  if (isNaN(start) || isNaN(end)) return 0;
  if (end <= start) end += 86_400_000; // overnight
  return Math.round(((end - start) / 3_600_000) * 100) / 100;
};

// Local preview of the status the backend will derive (overnight-aware). A shift
// is always "today".
const previewStatus = (startTime: string, endTime: string): ShiftStatus | null => {
  if (!startTime || !endTime) return null;
  const today = todayInput();
  const start = new Date(`${today}T${startTime}`);
  let end = new Date(`${today}T${endTime}`);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  if (end <= start) end = new Date(end.getTime() + 86_400_000);
  const now = new Date();
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'isActive';
};

// Wages are hourly-only now — show the rate per hour.
const wageAmount = (w: Salary) =>
  `${currencySymbol(w.currency ?? undefined)}${(w.hourlyPayRate ?? 0).toLocaleString()}/hr`;

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [wages, setWages] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);
  const [form, setForm] = useState<ShiftForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Shift | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Add Wages modal (2-step)
  const [wageOpen, setWageOpen] = useState(false);
  const [wageStep, setWageStep] = useState<1 | 2>(1);
  const [wageShiftId, setWageShiftId] = useState('');
  const [wageEmployerId, setWageEmployerId] = useState('');
  const [wageCurrency, setWageCurrency] = useState('GBP');
  const [wageValue, setWageValue] = useState('');
  const [wageSaving, setWageSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [shiftRes, empRes, wageRes] = await Promise.all([
        listShifts({ limit: 100 }),
        listEmployers({ limit: 100 }),
        listSalaries({ limit: 100 }),
      ]);
      setShifts(shiftRes.data);
      setEmployers(empRes.data);
      setWages(wageRes.data);
    } catch {
      toast.error('Failed to load shifts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (shift: Shift) => {
    setEditing(shift);
    const type = shift.shiftType ?? 'day';
    const isPreset = (PRESET_TYPES as readonly string[]).includes(type);
    setForm({
      shiftName: shift.shiftName ?? '',
      startTime: toTimeInput(shift.startTime),
      endTime: toTimeInput(shift.endTime),
      typeChoice: isPreset ? type : 'custom',
      customType: isPreset ? '' : type,
      color: shift.color ?? SHIFT_COLORS[0],
      notes: shift.notes ?? '',
    });
    setModalOpen(true);
  };

  const resolvedType = () =>
    form.typeChoice === 'custom' ? form.customType.trim() : form.typeChoice;

  const submit = async () => {
    const { startTime, endTime } = form;
    if (!startTime || !endTime) {
      toast.error('Start and end time are required');
      return;
    }
    const type = resolvedType();
    if (!type) {
      toast.error('Enter a name for your custom shift type');
      return;
    }

    setSaving(true);
    try {
      // A shift is always "today" — the date is set server-side; we only send the
      // times (built against today) so the backend can derive hours + validate.
      const today = todayInput();
      const base = {
        shiftName: form.shiftName.trim() || undefined,
        startTime: combineISO(today, startTime),
        endTime: combineISO(today, endTime),
        shiftType: type,
        color: form.color,
        notes: form.notes.trim() || undefined,
      };

      if (editing) {
        await updateShift(editing.id, base);
        toast.success('Shift updated');
      } else {
        await createShift(base);
        toast.success('Shift created');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteShift(deleteTarget.id);
      toast.success('Shift deleted');
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  // ── Add Wages ────────────────────────────────
  const openWages = () => {
    setWageStep(1);
    setWageShiftId('');
    setWageEmployerId('');
    setWageCurrency(settingsStore.getState().currency || 'GBP');
    setWageValue('');
    setWageOpen(true);
  };

  const submitWage = async () => {
    const rate = Number(wageValue);
    if (!wageValue || isNaN(rate) || rate < 0) {
      toast.error('Enter a valid hourly rate');
      return;
    }
    setWageSaving(true);
    try {
      await createSalary({
        shiftId: wageShiftId,
        employerId: wageEmployerId,
        hourlyPayRate: rate,
        rateType: 'hourly',
        currency: wageCurrency,
      });
      toast.success('Wage created');
      setWageOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create wage');
    } finally {
      setWageSaving(false);
    }
  };

  // Live per-day pay preview for the wage form (rate × selected shift's hours).
  const wageShift = shifts.find((s) => s.id === wageShiftId);
  const wagePerDay =
    wageShift && wageValue && !isNaN(Number(wageValue))
      ? Number(wageValue) * (wageShift.totalHours ?? 0)
      : null;

  const shiftLabel = (s?: Shift | Salary['shift']) =>
    s ? s.shiftName || `${s.shiftType ?? 'Shift'} · ${fmtDate(s.date)}` : 'Shift';

  // Client-side status filter + search over loaded shifts.
  const filteredShifts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shifts.filter((s) => {
      if (filter !== 'all' && filter !== 'wages' && s.status !== filter) return false;
      if (!q) return true;
      const inName = (s.shiftName ?? '').toLowerCase().includes(q);
      const inNotes = (s.notes ?? '').toLowerCase().includes(q);
      const inType = (s.shiftType ?? '').toLowerCase().includes(q);
      const inDate = fmtDate(s.date).toLowerCase().includes(q);
      return inName || inNotes || inType || inDate;
    });
  }, [shifts, filter, search]);

  const filteredWages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return wages;
    return wages.filter(
      (w) =>
        (w.employer?.employerName ?? '').toLowerCase().includes(q) ||
        (w.shift?.shiftName ?? '').toLowerCase().includes(q) ||
        (w.shift?.shiftType ?? '').toLowerCase().includes(q)
    );
  }, [wages, search]);

  const formPreview = previewStatus(form.startTime, form.endTime);
  const formHours = hoursBetween(form.startTime, form.endTime);
  const wageStep1Valid = wageShiftId && wageEmployerId;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-[#005ea3]">Shifts</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {shifts.length} shift{shifts.length === 1 ? '' : 's'} · earnings insights moved to the Earnings module
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={openWages} className={secondaryBtn}>
              <Wallet2 className="h-4 w-4" />
              Add Wages
            </button>
            <button onClick={openCreate} className={primaryBtn} style={primaryStyle}>
              <Plus className="h-4 w-4" />
              Add Shift
            </button>
          </div>
        </div>

        {/* Filter + search bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all ${
                  filter === f.value
                    ? 'text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                style={filter === f.value ? primaryStyle : undefined}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={filter === 'wages' ? 'Search wages…' : 'Search shifts…'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputCls} pl-10 py-2.5`}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px] text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filter === 'wages' ? (
          /* ── Wages list ── */
          filteredWages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <div className="mb-6 p-8 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Wallet2 className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No wages yet</h3>
              <p className="text-sm text-gray-400 mb-8 max-w-xs">
                Use “Add Wages” to assign a wage to an employee for a shift.
              </p>
              <button onClick={openWages} className={primaryBtn} style={primaryStyle}>
                <Wallet2 className="h-4 w-4" />
                Add Wages
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWages.map((w) => (
                <div key={w.id} className={`${cardCls} p-5`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={primaryStyle}
                    >
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      {/* Shift name first (bold), then the employee. */}
                      <p className="font-bold text-sm text-[#1b1c1c] dark:text-white truncate">
                        {shiftLabel(w.shift)}
                      </p>
                      <p className="text-xs text-[#707783] dark:text-gray-400 truncate">
                        {w.employer?.employerName ?? 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#005ea3]/[0.06] dark:border-white/5 pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#707783] dark:text-gray-400">
                      Today {money(w.salary)}
                    </span>
                    <span className="font-mono text-lg font-semibold text-[#005ea3] dark:text-[#a0c9ff]">
                      {wageAmount(w)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : shifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="mb-6 p-8 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Calendar className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No shifts yet</h3>
            <p className="text-sm text-gray-400 mb-8 max-w-xs">
              Add your first shift to start tracking your hours.
            </p>
            <button onClick={openCreate} className={primaryBtn} style={primaryStyle}>
              <Plus className="h-4 w-4" />
              Add Your First Shift
            </button>
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center text-gray-400">
            <p className="text-sm">No shifts match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShifts.map((shift) => (
              <div key={shift.id} className={`${cardCls} overflow-hidden`}>
                <div className="h-1.5 w-full" style={{ background: GRADIENT }} />
                <div className="p-5">
                  {/* header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
                        style={{ background: GRADIENT }}
                      >
                        <CalendarRange className="h-5 w-5 text-white" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#1b1c1c] dark:text-white leading-tight truncate">
                          {shift.shiftName || fmtDate(shift.date)}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[#707783] dark:text-gray-400 mt-0.5 text-xs font-mono">
                          <Clock className="h-3 w-3" />
                          {shift.shiftName ? `${fmtDate(shift.date)} · ` : ''}
                          {fmtTime(shift.startTime)} – {fmtTime(shift.endTime)}
                        </div>
                      </div>
                    </div>
                    {shift.status && (
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${statusMeta[shift.status].cls}`}
                      >
                        {statusMeta[shift.status].label}
                      </span>
                    )}
                  </div>

                  {/* stats strip */}
                  <div className="grid grid-cols-2 rounded-lg bg-[#005ea3]/[0.04] dark:bg-white/5 border border-[#005ea3]/[0.06] dark:border-white/5 p-3 mb-4">
                    <div className="text-center border-r border-[#005ea3]/[0.06] dark:border-white/5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-[#707783] dark:text-gray-400 mb-0.5">Hours</p>
                      <p className="font-mono text-base font-semibold text-[#1b1c1c] dark:text-white">{shift.totalHours}h</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-[#707783] dark:text-gray-400 mb-0.5">Date</p>
                      <p className="font-mono text-sm font-semibold text-[#1b1c1c] dark:text-white truncate px-1">{fmtDate(shift.date)}</p>
                    </div>
                  </div>

                  {/* meta row */}
                  {shift.shiftType && (
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${typeBadgeCls(shift.shiftType)}`}
                      >
                        {shift.shiftType}
                      </span>
                    </div>
                  )}

                  {/* actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(shift)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#005ea3]/15 dark:border-gray-700 text-[#005ea3] dark:text-[#a0c9ff] hover:bg-[#005ea3]/[0.06] transition-colors text-[11px] font-bold uppercase tracking-widest rounded-md"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(shift)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-100 dark:border-red-900/50 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors text-[11px] font-bold uppercase tracking-widest rounded-md"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit shift modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Shift' : 'Add Shift'}
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-md border border-gray-200 dark:border-gray-700"
            >
              Cancel
            </button>
            <button onClick={submit} disabled={saving} className={`flex-[2] ${primaryBtn}`} style={primaryStyle}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Save Shift'}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Shift Name (optional)</label>
            <input
              type="text"
              placeholder="e.g. Morning Floor, Night Security…"
              value={form.shiftName}
              onChange={(e) => setForm({ ...form, shiftName: e.target.value })}
              className={inputCls}
            />
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-gray-400">A shift is always for today.</span>
            {formPreview && (
              <>
                <span className="text-gray-400">Status will be</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusMeta[formPreview].cls}`}
                >
                  {statusMeta[formPreview].label}
                </span>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Start Time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>End Time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Total Hours (auto)</label>
              <div className={`${inputCls} font-mono bg-gray-100 dark:bg-gray-800/60 text-[#005ea3] dark:text-[#a0c9ff]`}>
                {formHours}h
              </div>
            </div>
            <div>
              <label className={labelCls}>Shift Type</label>
              <select
                value={form.typeChoice}
                onChange={(e) => setForm({ ...form, typeChoice: e.target.value })}
                className={inputCls}
              >
                {PRESET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </option>
                ))}
                <option value="custom">Custom…</option>
              </select>
            </div>
          </div>

          {form.typeChoice === 'custom' && (
            <div>
              <label className={labelCls}>Custom Type Name</label>
              <input
                type="text"
                placeholder="e.g. Split, On-call, Weekend…"
                value={form.customType}
                onChange={(e) => setForm({ ...form, customType: e.target.value })}
                className={inputCls}
              />
            </div>
          )}

          {/* Shift label colour — shown for this shift on the calendar. */}
          <div>
            <label className={labelCls}>Label Colour</label>
            <div className="flex items-center gap-2.5">
              {SHIFT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  aria-label={`Colour ${c}`}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    form.color === c ? 'ring-2 ring-offset-2 ring-[#005ea3] scale-110 dark:ring-offset-[#1f2937]' : 'hover:scale-105'
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Notes (optional)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      </Modal>

      {/* Add Wages modal (2-step) */}
      <Modal
        open={wageOpen}
        onClose={() => setWageOpen(false)}
        title="Add Wages"
        maxWidth="max-w-lg"
        footer={
          wageStep === 1 ? (
            <>
              <button
                onClick={() => setWageOpen(false)}
                className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-md border border-gray-200 dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setWageStep(2)}
                disabled={!wageStep1Valid}
                className={`flex-[2] ${primaryBtn}`}
                style={primaryStyle}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setWageStep(1)}
                className="flex-1 py-3 inline-flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-md border border-gray-200 dark:border-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                onClick={submitWage}
                disabled={wageSaving}
                className={`flex-[2] ${primaryBtn}`}
                style={primaryStyle}
              >
                {wageSaving ? 'Saving…' : 'Create Wages'}
              </button>
            </>
          )
        }
      >
        {wageStep === 1 ? (
          <div className="space-y-5">
            <div>
              <label className={labelCls}>Shift</label>
              {shifts.length === 0 ? (
                <p className="text-xs text-amber-500">Create a shift first.</p>
              ) : (
                <select
                  value={wageShiftId}
                  onChange={(e) => setWageShiftId(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select a shift…</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {shiftLabel(s)} · {fmtTime(s.startTime)}–{fmtTime(s.endTime)}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className={labelCls}>Employee</label>
              {employers.length === 0 ? (
                <p className="text-xs text-amber-500">
                  No employees yet — add one on the Employers page first.
                </p>
              ) : (
                <select
                  value={wageEmployerId}
                  onChange={(e) => setWageEmployerId(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select an employee…</option>
                  {employers.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employerName} — {emp.store}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className={labelCls}>Currency</label>
              <select
                value={wageCurrency}
                onChange={(e) => setWageCurrency(e.target.value)}
                className={inputCls}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c} ({currencySymbol(c).trim()})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Hourly Rate</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {currencySymbol(wageCurrency)}
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0"
                  value={wageValue}
                  onChange={(e) => setWageValue(e.target.value)}
                  className={`${inputCls} pl-9 font-mono`}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">Amount paid per hour.</p>
            </div>

            {/* Live per-day pay = hourly rate × the shift's hours. */}
            <div className="rounded-lg bg-[#005ea3]/[0.05] dark:bg-white/5 border border-[#005ea3]/[0.08] dark:border-white/10 p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#707783] dark:text-gray-400">
                  Today&apos;s Salary
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {wageShift ? `${wageShift.totalHours ?? 0}h × ${currencySymbol(wageCurrency)}${wageValue || 0}/hr` : 'Pick a shift'}
                </p>
              </div>
              <span className="font-mono text-xl font-semibold text-[#005ea3] dark:text-[#a0c9ff]">
                {wagePerDay == null
                  ? '—'
                  : `${currencySymbol(wageCurrency)}${(Math.round(wagePerDay * 100) / 100).toLocaleString()}`}
              </span>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete shift?"
        message={`Delete the shift (${deleteTarget ? fmtDate(deleteTarget.date) : ''})? Any wages assigned to it are kept (their shift link is cleared).`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}
