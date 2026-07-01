'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Modal, ConfirmDialog } from '@/components/ui/modal';
import {
  Plus,
  Building2,
  MapPin,
  Edit,
  Trash2,
  Loader2,
  Search,
  Calendar,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { Employer, Salary, ShiftStatus } from '@/lib/types';
import {
  listEmployers,
  createEmployer,
  updateEmployer,
  deleteEmployer,
  EmployerInput,
} from '@/lib/services/employers';
import { listSalaries } from '@/lib/services/salaries';
import { money, currencySymbol, fmtDateShort as fmtDate, fmtTime } from '@/lib/format';

const labelCls = 'block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2';
const inputCls =
  'w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-3 focus:border-[#005ea3] focus:ring-2 focus:ring-[#005ea3]/10 outline-none transition-all text-sm';
const primaryBtn =
  'flex items-center justify-center gap-2 px-5 py-3 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg shadow-[0_4px_14px_rgba(0,94,163,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,94,163,0.35)] transition-all disabled:opacity-60 disabled:hover:translate-y-0';
const GRADIENT = 'linear-gradient(135deg, #005ea3 0%, #006d30 100%)';
const primaryStyle = { background: GRADIENT };
const cardCls =
  'bg-white dark:bg-[#1f2937] rounded-[10px] border border-[rgba(0,94,163,0.08)] dark:border-[rgba(160,201,255,0.08)] shadow-[0_4px_6px_rgba(0,123,210,0.06),0_2px_4px_rgba(0,123,210,0.04)] hover:shadow-[0_10px_24px_rgba(0,94,163,0.12)] hover:-translate-y-1 transition-all duration-300';

const statusMeta: Record<ShiftStatus, { label: string; cls: string }> = {
  upcoming: { label: 'Upcoming', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  isActive: { label: 'Active', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  completed: { label: 'Completed', cls: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
};

const FILTERS: Array<{ value: 'all' | 'active' | 'inactive'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const emptyForm: EmployerInput = { employerName: '', store: '', notes: '', isActive: true };

const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

const shiftDateRange = (s: NonNullable<Salary['shift']>) =>
  s.date ? fmtDate(s.date) : 'Unscheduled';

export default function EmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employer | null>(null);
  const [form, setForm] = useState<EmployerInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Employer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [shiftsTarget, setShiftsTarget] = useState<Employer | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, salRes] = await Promise.all([
        listEmployers({ limit: 100 }),
        listSalaries({ limit: 100 }),
      ]);
      setEmployers(empRes.data);
      setSalaries(salRes.data);
    } catch {
      toast.error('Failed to load employers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Per-employer aggregates from the salary rows.
  const statsByEmployer = useMemo(() => {
    const map = new Map<string, { shiftIds: Set<string>; totalPay: number; rows: Salary[] }>();
    for (const sal of salaries) {
      if (!sal.employerId) continue;
      const entry = map.get(sal.employerId) ?? { shiftIds: new Set<string>(), totalPay: 0, rows: [] };
      if (sal.shiftId) entry.shiftIds.add(sal.shiftId);
      entry.totalPay += sal.salary ?? 0;
      entry.rows.push(sal);
      map.set(sal.employerId, entry);
    }
    return map;
  }, [salaries]);

  const summary = useMemo(() => {
    const total = employers.length;
    const active = employers.filter((e) => e.isActive).length;
    const totalPay = salaries.reduce((a, s) => a + (s.salary ?? 0), 0);
    return { total, active, totalPay };
  }, [employers, salaries]);

  const filteredEmployers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return employers.filter((e) => {
      if (filter === 'active' && !e.isActive) return false;
      if (filter === 'inactive' && e.isActive) return false;
      if (!q) return true;
      return (
        e.employerName.toLowerCase().includes(q) ||
        e.store.toLowerCase().includes(q) ||
        (e.notes ?? '').toLowerCase().includes(q)
      );
    });
  }, [employers, filter, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (emp: Employer) => {
    setEditing(emp);
    setForm({ employerName: emp.employerName, store: emp.store, notes: emp.notes ?? '', isActive: emp.isActive });
    setModalOpen(true);
  };

  const submit = async () => {
    if (!form.employerName.trim() || !form.store.trim()) {
      toast.error('Employer name and store are required');
      return;
    }
    setSaving(true);
    try {
      const payload: EmployerInput = {
        employerName: form.employerName.trim(),
        store: form.store.trim(),
        notes: form.notes?.trim() || undefined,
        isActive: form.isActive,
      };
      if (editing) {
        await updateEmployer(editing.id, payload);
        toast.success('Employer updated');
      } else {
        await createEmployer(payload);
        toast.success('Employer created');
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
      await deleteEmployer(deleteTarget.id);
      toast.success('Employer deleted');
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const targetShifts = shiftsTarget
    ? (statsByEmployer.get(shiftsTarget.id)?.rows ?? []).filter((s) => s.shift)
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[#005ea3]">Employers</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage employers and view their shifts</p>
          </div>
          <button onClick={openCreate} className={primaryBtn} style={primaryStyle}>
            <Plus className="h-4 w-4" />
            Add Employer
          </button>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputCls} pl-10`}
            />
          </div>
          <div className="flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
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
        </div>

        {/* Gradient summary */}
        <div
          className="rounded-[10px] p-5 sm:p-6 grid grid-cols-3 shadow-[0_8px_24px_rgba(0,94,163,0.25)]"
          style={primaryStyle}
        >
          <div className="text-center">
            <p className="font-mono text-2xl font-bold text-white">{summary.total}</p>
            <p className="text-[10px] uppercase tracking-wider text-white/80 mt-1">Total</p>
          </div>
          <div className="text-center border-x border-white/25">
            <p className="font-mono text-2xl font-bold text-white">{summary.active}</p>
            <p className="text-[10px] uppercase tracking-wider text-white/80 mt-1">Active</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-2xl font-bold text-white">{money(summary.totalPay)}</p>
            <p className="text-[10px] uppercase tracking-wider text-white/80 mt-1">Total Pay</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px] text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : employers.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[360px] text-center">
            <div className="mb-6 p-8 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Building2 className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">No employers yet</h3>
            <p className="text-sm text-gray-400 mb-8 max-w-xs">
              Add your first employer to start tracking shifts and pay.
            </p>
            <button onClick={openCreate} className={primaryBtn} style={primaryStyle}>
              <Plus className="h-4 w-4" />
              Add Your First Employer
            </button>
          </div>
        ) : filteredEmployers.length === 0 ? (
          <div className="flex items-center justify-center min-h-[200px] text-sm text-gray-400">
            No employers match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployers.map((emp) => {
              const stat = statsByEmployer.get(emp.id);
              const shiftCount = stat?.shiftIds.size ?? 0;
              const totalPay = stat?.totalPay ?? 0;
              return (
                <div key={emp.id} className={`${cardCls} overflow-hidden`}>
                  <div className="h-1.5 w-full" style={primaryStyle} />
                  <div className="p-5">
                    {/* top */}
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-[10px] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
                        style={primaryStyle}
                      >
                        {initials(emp.employerName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#1b1c1c] dark:text-white truncate">
                            {emp.employerName}
                          </h3>
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              emp.isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#707783] dark:text-gray-400 mt-0.5">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{emp.store}</span>
                        </div>
                      </div>
                    </div>

                    {/* stats strip */}
                    <div className="grid grid-cols-2 rounded-lg bg-[#005ea3]/[0.04] dark:bg-white/5 border border-[#005ea3]/[0.06] dark:border-white/5 p-3 mb-4">
                      <div className="text-center">
                        <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-[#707783] dark:text-gray-400 mb-0.5">Shifts</p>
                        <p className="font-mono text-base font-semibold text-[#1b1c1c] dark:text-white">{shiftCount}</p>
                      </div>
                      <div className="text-center border-l border-[#005ea3]/[0.06] dark:border-white/5">
                        <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-[#707783] dark:text-gray-400 mb-0.5">Total Pay</p>
                        <p className="font-mono text-base font-semibold text-[#005ea3] dark:text-[#a0c9ff]">{money(totalPay)}</p>
                      </div>
                    </div>

                    {/* view shifts */}
                    <button
                      onClick={() => setShiftsTarget(emp)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 mb-2 rounded-md text-white text-[11px] font-bold uppercase tracking-widest shadow-sm hover:-translate-y-0.5 transition-all"
                      style={primaryStyle}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      View Shifts
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    {/* edit / delete */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(emp)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#005ea3]/15 dark:border-gray-700 text-[#005ea3] dark:text-[#a0c9ff] hover:bg-[#005ea3]/[0.06] transition-colors text-[11px] font-bold uppercase tracking-widest rounded-md"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(emp)}
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
        title={editing ? 'Edit Employer' : 'Add Employer'}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-md border border-gray-200 dark:border-gray-700"
            >
              Cancel
            </button>
            <button onClick={submit} disabled={saving} className={`flex-[2] ${primaryBtn}`} style={primaryStyle}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Save Employer'}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Employer Name</label>
            <input
              type="text"
              placeholder="e.g. Tesco PLC"
              value={form.employerName}
              onChange={(e) => setForm({ ...form, employerName: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Store / Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. High Street"
                value={form.store}
                onChange={(e) => setForm({ ...form, store: e.target.value })}
                className={`${inputCls} pl-11`}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Notes (optional)</label>
            <textarea
              rows={3}
              placeholder="Anything to remember…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 accent-[#005ea3]"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Active employer</span>
          </label>
        </div>
      </Modal>

      {/* View Shifts popup */}
      <Modal
        open={!!shiftsTarget}
        onClose={() => setShiftsTarget(null)}
        title={shiftsTarget ? `${shiftsTarget.employerName} — Shifts` : 'Shifts'}
        maxWidth="max-w-lg"
      >
        {targetShifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-4 p-5 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Calendar className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">No shifts assigned to this employer yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {targetShifts.map((sal) => {
              const sh = sal.shift!;
              return (
                <div
                  key={sal.id}
                  className="rounded-lg border border-[#005ea3]/[0.08] dark:border-white/10 p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#1b1c1c] dark:text-white truncate">
                        {shiftDateRange(sh)}
                      </span>
                      {sh.status && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ${statusMeta[sh.status].cls}`}
                        >
                          {statusMeta[sh.status].label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#707783] dark:text-gray-400 font-mono mt-1">
                      <Clock className="h-3 w-3" />
                      {fmtTime(sh.startTime)} – {fmtTime(sh.endTime)}
                      {sh.totalHours != null && <span>· {sh.totalHours}h</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-mono font-bold text-[#005ea3] dark:text-[#a0c9ff]">
                      {money(sal.salary)}
                    </span>
                    {sal.hourlyPayRate != null && (
                      <p className="text-[10px] text-[#707783] dark:text-gray-400 font-mono">
                        {currencySymbol()}{sal.hourlyPayRate}/h
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete employer?"
        message={`Delete "${deleteTarget?.employerName}"? Its shifts are kept; linked salary rows have their employer cleared.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}
