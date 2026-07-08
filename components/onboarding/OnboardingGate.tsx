'use client';

// components/onboarding/OnboardingGate.tsx
// ─────────────────────────────────────────────
// Blocking onboarding step. A user cannot use the app until they have at least
// one employee — the first one becomes their DEFAULT employee (the scope for
// calendar / earnings / reports). This overlay appears whenever the preloaded
// cache reports zero employers and can't be dismissed until one is created.
// ─────────────────────────────────────────────
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { Building2, MapPin, Loader2, Sparkles, X } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { authStore } from '@/store/authStore';
import { createEmployer, EmployerInput } from '@/lib/services/employers';
import { getSettings } from '@/lib/services/settings';
import { resolveLocationLabel } from '@/lib/geolocation';

// Note stamped on the employee created automatically when the user dismisses
// onboarding with the "X" instead of filling the form.
const AUTO_ADDED_NOTE = 'Automatically added employee';

const GRADIENT = 'linear-gradient(135deg, #3a9295 0%, #105f68 100%)';
const primaryStyle = { background: GRADIENT };
const labelCls = 'block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2';
const inputCls =
  'w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-3 focus:border-[#3a9295] focus:ring-2 focus:ring-[#3a9295]/10 outline-none transition-all text-sm';

const emptyForm: EmployerInput = { employerName: '', store: '', notes: '', isActive: true };

export function OnboardingGate() {
  const loaded = dataStore((s) => s.loaded);
  const employers = dataStore((s) => s.employers);

  const user = authStore((s) => s.user);
  const [form, setForm] = useState<EmployerInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [autoAdding, setAutoAdding] = useState(false);

  // Wait for the first cache load; then gate only when there are no employees.
  if (!loaded || employers.length > 0) return null;

  const busy = saving || autoAdding;

  // "X" flow: instead of forcing the form, create a default employee for the
  // user automatically — named after their sign-up name, located via geolocation
  // (or "unknown location" if they deny it), and tagged so it's clear it was
  // auto-generated. The backend makes this first employee the default, so the
  // app unlocks and every module scopes to them until they add/switch another.
  const dismissWithAutoEmployee = async () => {
    if (busy) return;
    setAutoAdding(true);
    try {
      const employerName = user?.displayName?.trim() || 'My workplace';
      const location = await resolveLocationLabel();
      await createEmployer({
        employerName,
        store: location,
        notes: AUTO_ADDED_NOTE,
        isActive: true,
      });
      await Promise.all([dataStore.getState().refreshEmployers(), getSettings().catch(() => undefined)]);
      toast.success('Added a default employee for you — you can edit it anytime.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not set you up automatically');
      setAutoAdding(false); // keep the gate open so they can try the form
    }
  };

  const submit = async () => {
    if (!form.employerName.trim() || !form.store.trim()) {
      toast.error('Employee name and store are required');
      return;
    }
    setSaving(true);
    try {
      await createEmployer({
        employerName: form.employerName.trim(),
        store: form.store.trim(),
        notes: form.notes?.trim() || undefined,
        isActive: true,
      });
      // This first employee is now the default — refresh the cache + settings so
      // the whole app unlocks and scopes to them.
      await Promise.all([dataStore.getState().refreshEmployers(), getSettings().catch(() => undefined)]);
      toast.success('You’re all set! Welcome aboard 🎉');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not create employee');
    } finally {
      setSaving(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Opaque backdrop — the app behind is intentionally unreachable. */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-white dark:bg-[#1f2937] rounded-[14px] shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-count-up">
        {/* Gradient header */}
        <div className="relative p-6 text-white" style={primaryStyle}>
          {/* Dismiss → auto-create a default employee (see dismissWithAutoEmployee). */}
          <button
            onClick={dismissWithAutoEmployee}
            disabled={busy}
            aria-label="Skip and set me up automatically"
            title="Skip — we’ll add a default employee for you"
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {autoAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-[11px] font-bold uppercase tracking-widest opacity-90">Happy onboarding</span>
          </div>
          <h2 className="text-2xl font-extrabold leading-tight pr-10">Let’s add your first employee</h2>
          <p className="text-sm text-white/85 mt-1.5">
            Create a default employee to continue. All your modules are organised
            per employee — you can add more and switch the default later.
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className={labelCls}>Employee Name</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="e.g. Tesco PLC"
                value={form.employerName}
                onChange={(e) => setForm({ ...form, employerName: e.target.value })}
                className={`${inputCls} pl-11`}
              />
            </div>
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
              rows={2}
              placeholder="Anything to remember…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          </div>

          <button
            onClick={submit}
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-white text-[12px] font-bold uppercase tracking-widest rounded-lg shadow-[0_4px_14px_rgba(58,146,149,0.25)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
            style={primaryStyle}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {saving ? 'Creating…' : 'Create default employee & continue'}
          </button>

          {/* Escape hatch — mirrors the header "X". */}
          <button
            onClick={dismissWithAutoEmployee}
            disabled={busy}
            className="w-full text-center text-[12px] font-semibold text-gray-500 hover:text-[#3a9295] transition-colors disabled:opacity-60"
          >
            {autoAdding ? 'Setting you up…' : 'Skip — set me up automatically'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
