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
  PoundSterling,
  CalendarRange,
  Wallet,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Employer, Shift, ShiftType, ShiftStatus } from '@/lib/types';
import { listEmployers } from '@/lib/services/employers';
import {
  listShifts,
  createShift,
  updateShift,
  deleteShift,
  getShiftAnalytics,
  ShiftAnalytics,
} from '@/lib/services/shifts';
import { createSalary, updateSalary, deleteSalary } from '@/lib/services/salaries';
import { money, currencySymbol, fmtDateShort as fmtDate, fmtTime } from '@/lib/format';

const labelCls = 'block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2';
const inputCls =
  'w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-3 focus:border-[#005ea3] focus:ring-2 focus:ring-[#005ea3]/10 outline-none transition-all text-sm';
const primaryBtn =
  'flex items-center justify-center gap-2 px-5 py-3 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg shadow-[0_4px_14px_rgba(0,94,163,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,94,163,0.35)] transition-all disabled:opacity-60 disabled:hover:translate-y-0';
// Brand gradient + premium card system, matching /dashboard's color science.
const GRADIENT = 'linear-gradient(135deg, #005ea3 0%, #006d30 100%)';
const primaryStyle = { background: GRADIENT };
const cardCls =
  'bg-white dark:bg-[#1f2937] rounded-[10px] border border-[rgba(0,94,163,0.08)] dark:border-[rgba(160,201,255,0.08)] shadow-[0_4px_6px_rgba(0,123,210,0.06),0_2px_4px_rgba(0,123,210,0.04)] hover:shadow-[0_10px_24px_rgba(0,94,163,0.12)] hover:-translate-y-1 transition-all duration-300';

const SHIFT_TYPES: ShiftType[] = ['day', 'night', 'rotational'];
const typeBadge: Record<ShiftType, string> = {
  day: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  night: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  rotational: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
};

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

const STATUS_FILTERS: Array<{ value: 'all' | ShiftStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'isActive', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

interface SalaryRow {
  key: string;
  salaryId?: string;
  employerId: string;
  salary: string;
}

interface ShiftForm {
  shiftName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
  totalHours: string;
  shiftType: ShiftType;
  confirmed: boolean;
  notes: string;
  addEmployees: boolean;
  rows: SalaryRow[];
}

const todayInput = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): ShiftForm => ({
  shiftName: '',
  startDate: todayInput(),
  endDate: todayInput(),
  startTime: '09:00',
  endTime: '17:00',
  breakDuration: '0',
  totalHours: '8',
  shiftType: 'day',
  confirmed: false,
  notes: '',
  addEmployees: false,
  rows: [],
});

// ── date/time helpers ──────────────────────────
const combineISO = (date: string, time: string) => new Date(`${date}T${time}`).toISOString();
const toDateInput = (iso: string) => new Date(iso).toISOString().slice(0, 10);
const toTimeInput = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const dateRange = (s: Shift) => {
  if (!s.startDate || !s.endDate) return '—';
  const a = fmtDate(s.startDate);
  const b = fmtDate(s.endDate);
  return a === b ? a : `${a} – ${b}`;
};

// Local preview of the status the backend will derive.
const previewStatus = (startDate: string, endDate: string): ShiftStatus | null => {
  if (!startDate || !endDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const s = new Date(startDate);
  const e = new Date(endDate);
  e.setHours(23, 59, 59, 999);
  if (today < s) return 'upcoming';
  if (today > e) return 'completed';
  return 'isActive';
};

let rowSeq = 0;
const newRow = (): SalaryRow => ({ key: `r${rowSeq++}`, employerId: '', salary: '' });

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [analytics, setAnalytics] = useState<ShiftAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<'all' | ShiftStatus>('all');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);
  const [form, setForm] = useState<ShiftForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Shift | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [shiftRes, empRes, analyticsRes] = await Promise.all([
        listShifts({ limit: 100 }),
        listEmployers({ limit: 100 }),
        getShiftAnalytics(),
      ]);
      setShifts(shiftRes.data);
      setEmployers(empRes.data);
      setAnalytics(analyticsRes);
    } catch {
      toast.error('Failed to load shifts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-calculate totalHours from start/end/break (frontend-computed).
  useEffect(() => {
    const { startDate, startTime, endTime, breakDuration } = form;
    if (!startDate || !startTime || !endTime) return;
    const start = new Date(`${startDate}T${startTime}`).getTime();
    const end = new Date(`${startDate}T${endTime}`).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return;
    const hours = (end - start) / 3_600_000 - (Number(breakDuration) || 0) / 60;
    if (hours > 0) setForm((f) => ({ ...f, totalHours: String(Math.round(hours * 100) / 100) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.startDate, form.startTime, form.endTime, form.breakDuration]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (shift: Shift) => {
    setEditing(shift);
    const rows = (shift.salaries ?? []).map((s) => ({
      key: `r${rowSeq++}`,
      salaryId: s.id,
      employerId: s.employerId ?? '',
      salary: s.salary != null ? String(s.salary) : '',
    }));
    setForm({
      shiftName: shift.shiftName ?? '',
      startDate: shift.startDate ? toDateInput(shift.startDate) : todayInput(),
      endDate: shift.endDate ? toDateInput(shift.endDate) : todayInput(),
      startTime: toTimeInput(shift.startTime),
      endTime: toTimeInput(shift.endTime),
      breakDuration: String(shift.breakDuration ?? 0),
      totalHours: String(shift.totalHours ?? 0),
      shiftType: shift.shiftType ?? 'day',
      confirmed: shift.confirmed,
      notes: shift.notes ?? '',
      addEmployees: rows.length > 0,
      rows,
    });
    setModalOpen(true);
  };

  // Reconcile salary rows against the original shift's salaries (edit only).
  const syncSalaries = async (shiftId: string) => {
    const original = editing?.salaries ?? [];
    const current = form.addEmployees
      ? form.rows.filter((r) => r.employerId && r.salary !== '')
      : [];
    const ops: Promise<unknown>[] = [];
    const keptIds = new Set<string>();

    for (const row of current) {
      const value = Number(row.salary);
      if (row.salaryId) {
        keptIds.add(row.salaryId);
        const orig = original.find((o) => o.id === row.salaryId);
        if (orig && (orig.employerId !== row.employerId || orig.salary !== value)) {
          ops.push(updateSalary(row.salaryId, { employerId: row.employerId, salary: value }));
        }
      } else {
        ops.push(createSalary({ shiftId, employerId: row.employerId, salary: value }));
      }
    }
    if (form.addEmployees) {
      for (const o of original) if (!keptIds.has(o.id)) ops.push(deleteSalary(o.id));
    }
    await Promise.all(ops);
  };

  const submit = async () => {
    const { startDate, endDate, startTime, endTime } = form;
    if (!startDate || !endDate || !startTime || !endTime) {
      toast.error('Start date, end date, start and end time are required');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date must be on or after start date');
      return;
    }
    const startISO = combineISO(startDate, startTime);
    const endISO = combineISO(startDate, endTime);
    if (new Date(endISO) <= new Date(startISO)) {
      toast.error('End time must be after start time');
      return;
    }
    if (form.addEmployees) {
      const bad = form.rows.some(
        (r) => (r.employerId && r.salary === '') || (!r.employerId && r.salary !== '')
      );
      if (bad) {
        toast.error('Each employee row needs both an employer and a salary');
        return;
      }
    }

    setSaving(true);
    try {
      const base = {
        shiftName: form.shiftName.trim() || undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        startTime: startISO,
        endTime: endISO,
        totalHours: Number(form.totalHours) || 0,
        breakDuration: Number(form.breakDuration) || 0,
        shiftType: form.shiftType,
        confirmed: form.confirmed,
        notes: form.notes.trim() || undefined,
      };

      if (editing) {
        await updateShift(editing.id, base);
        await syncSalaries(editing.id);
        toast.success('Shift updated');
      } else {
        const salaries = form.addEmployees
          ? form.rows
              .filter((r) => r.employerId && r.salary !== '')
              .map((r) => ({ employerId: r.employerId, salary: Number(r.salary) }))
          : undefined;
        await createShift({ ...base, salaries });
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

  // Client-side filter (status) + search over loaded shifts.
  const filteredShifts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shifts.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (!q) return true;
      const inNotes = (s.notes ?? '').toLowerCase().includes(q);
      const inType = (s.shiftType ?? '').toLowerCase().includes(q);
      const inEmp = (s.salaries ?? []).some((sal) =>
        (sal.employer?.employerName ?? '').toLowerCase().includes(q)
      );
      const inDate = fmtDate(s.startDate).toLowerCase().includes(q);
      return inNotes || inType || inEmp || inDate;
    });
  }, [shifts, statusFilter, search]);

  const formPreview = previewStatus(form.startDate, form.endDate);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[#005ea3]">Shifts</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {shifts.length} shift{shifts.length === 1 ? '' : 's'} ·{' '}
              {analytics?.totalHours ?? 0} total hours
            </p>
          </div>
          <button onClick={openCreate} className={primaryBtn} style={primaryStyle}>
            <Plus className="h-4 w-4" />
            Add Shift
          </button>
        </div>

        {/* Analytics cards */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Hours', value: `${analytics.totalHours}h`, icon: Clock },
              { label: 'This Week Pay', value: money(analytics.thisWeekPay), icon: PoundSterling },
              { label: 'This Month Pay', value: money(analytics.thisMonthPay), icon: CalendarRange },
              { label: 'Total Pay', value: money(analytics.totalPay), icon: Wallet },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className={`${cardCls} p-5 sm:p-6`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#707783] dark:text-gray-400 mb-1.5">
                        {card.label}
                      </p>
                      <p className="font-mono text-xl sm:text-2xl font-medium text-[#005ea3] dark:text-[#a0c9ff] truncate">
                        {card.value}
                      </p>
                    </div>
                    <div
                      className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ background: GRADIENT }}
                    >
                      <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Filter + search bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all ${
                  statusFilter === f.value
                    ? 'text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                style={statusFilter === f.value ? primaryStyle : undefined}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search shifts…"
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
        ) : shifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="mb-6 p-8 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Calendar className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No shifts yet</h3>
            <p className="text-sm text-gray-400 mb-8 max-w-xs">
              Add your first shift and optionally assign employees with their pay.
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
            {filteredShifts.map((shift) => {
              const pay = (shift.salaries ?? []).reduce((a, s) => a + (s.salary ?? 0), 0);
              const empCount = shift.salaries?.length ?? 0;
              return (
                <div key={shift.id} className={`${cardCls} overflow-hidden`}>
                  {/* gradient accent */}
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
                            {shift.shiftName || dateRange(shift)}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[#707783] dark:text-gray-400 mt-0.5 text-xs font-mono">
                            <Clock className="h-3 w-3" />
                            {shift.shiftName ? `${dateRange(shift)} · ` : ''}
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
                    <div className="grid grid-cols-3 rounded-lg bg-[#005ea3]/[0.04] dark:bg-white/5 border border-[#005ea3]/[0.06] dark:border-white/5 p-3 mb-4">
                      <div className="text-center">
                        <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-[#707783] dark:text-gray-400 mb-0.5">Hours</p>
                        <p className="font-mono text-base font-semibold text-[#1b1c1c] dark:text-white">{shift.totalHours}h</p>
                      </div>
                      <div className="text-center border-x border-[#005ea3]/[0.06] dark:border-white/5">
                        <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-[#707783] dark:text-gray-400 mb-0.5">Pay</p>
                        <p className="font-mono text-base font-semibold text-[#005ea3] dark:text-[#a0c9ff]">{money(pay)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-[#707783] dark:text-gray-400 mb-0.5">Staff</p>
                        <p className="font-mono text-base font-semibold text-[#1b1c1c] dark:text-white">{empCount}</p>
                      </div>
                    </div>

                    {/* meta row */}
                    <div className="flex items-center gap-2 mb-4">
                      {shift.shiftType && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${typeBadge[shift.shiftType]}`}
                        >
                          {shift.shiftType}
                        </span>
                      )}
                      {shift.confirmed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#006d30]">
                          <CheckCircle2 className="h-3 w-3" /> Confirmed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                          Pending
                        </span>
                      )}
                    </div>

                    {/* assigned employees */}
                    {empCount > 0 && (
                      <div className="border-t border-[#005ea3]/[0.06] dark:border-white/5 pt-3 mb-4 space-y-1.5">
                        {shift.salaries!.slice(0, 3).map((s) => (
                          <div key={s.id} className="flex justify-between text-xs">
                            <span className="text-[#404752] dark:text-gray-300 truncate pr-2">
                              {s.employer?.employerName ?? 'Unknown'}
                            </span>
                            <span className="font-mono font-semibold text-[#005ea3] dark:text-[#a0c9ff] flex-shrink-0">
                              {money(s.salary)}
                            </span>
                          </div>
                        ))}
                        {empCount > 3 && (
                          <p className="text-[10px] text-[#707783]">+{empCount - 3} more</p>
                        )}
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
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          {formPreview && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">Status will be</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusMeta[formPreview].cls}`}
              >
                {statusMeta[formPreview].label}
              </span>
              <span className="text-gray-400">(auto-calculated from the dates)</span>
            </div>
          )}

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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Break (min)</label>
              <input
                type="number"
                min={0}
                value={form.breakDuration}
                onChange={(e) => setForm({ ...form, breakDuration: e.target.value })}
                className={`${inputCls} font-mono`}
              />
            </div>
            <div>
              <label className={labelCls}>Total Hours</label>
              <input
                type="number"
                min={0}
                step="0.25"
                value={form.totalHours}
                onChange={(e) => setForm({ ...form, totalHours: e.target.value })}
                className={`${inputCls} font-mono`}
              />
            </div>
            <div>
              <label className={labelCls}>Shift Type</label>
              <select
                value={form.shiftType}
                onChange={(e) => setForm({ ...form, shiftType: e.target.value as ShiftType })}
                className={inputCls}
              >
                {SHIFT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
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

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.confirmed}
              onChange={(e) => setForm({ ...form, confirmed: e.target.checked })}
              className="h-4 w-4 accent-[#005ea3]"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Mark as confirmed</span>
          </label>

          {/* Employees + salary section */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <label className="flex items-center gap-3 cursor-pointer select-none mb-3">
              <input
                type="checkbox"
                checked={form.addEmployees}
                onChange={(e) =>
                  setForm({
                    ...form,
                    addEmployees: e.target.checked,
                    rows: e.target.checked && form.rows.length === 0 ? [newRow()] : form.rows,
                  })
                }
                className="h-4 w-4 accent-[#005ea3]"
              />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Add employees &amp; their salary for this shift
              </span>
            </label>

            {form.addEmployees && (
              <div className="space-y-3">
                {employers.length === 0 && (
                  <p className="text-xs text-amber-500">
                    No employers yet — add one on the Employers page first.
                  </p>
                )}
                {form.rows.map((row, idx) => (
                  <div key={row.key} className="flex gap-2 items-center">
                    <select
                      value={row.employerId}
                      onChange={(e) => {
                        const rows = [...form.rows];
                        rows[idx] = { ...row, employerId: e.target.value };
                        setForm({ ...form, rows });
                      }}
                      className={`${inputCls} flex-1`}
                    >
                      <option value="">Select employer…</option>
                      {employers.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.employerName} — {emp.store}
                        </option>
                      ))}
                    </select>
                    <div className="relative w-28">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{currencySymbol()}</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={row.salary}
                        onChange={(e) => {
                          const rows = [...form.rows];
                          rows[idx] = { ...row, salary: e.target.value };
                          setForm({ ...form, rows });
                        }}
                        className={`${inputCls} pl-7 font-mono`}
                      />
                    </div>
                    <button
                      onClick={() => setForm({ ...form, rows: form.rows.filter((_, i) => i !== idx) })}
                      className="w-9 h-9 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors flex-shrink-0"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setForm({ ...form, rows: [...form.rows, newRow()] })}
                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#005ea3] hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Add employee
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete shift?"
        message={`Delete the shift (${deleteTarget ? dateRange(deleteTarget) : ''})? Salary rows are kept (their shift link is cleared).`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}
