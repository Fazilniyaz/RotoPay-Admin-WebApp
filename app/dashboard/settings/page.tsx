'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { User, Globe, Loader2, LogOut, Mail, Check } from 'lucide-react';
import { getSettings, updateSettings } from '@/lib/services/settings';
import { DateFormat, TimeFormat } from '@/store/settingsStore';
import { currencySymbol, CURRENCIES } from '@/lib/format';

const GRADIENT = 'linear-gradient(135deg, #005ea3 0%, #006d30 100%)';
const primaryStyle = { background: GRADIENT };
const cardCls =
  'bg-white dark:bg-[#1f2937] rounded-[10px] border border-[rgba(0,94,163,0.08)] dark:border-[rgba(160,201,255,0.08)] shadow-[0_4px_6px_rgba(0,123,210,0.06),0_2px_4px_rgba(0,123,210,0.04)]';
const labelCls = 'block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2';
const inputCls =
  'w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-3 focus:border-[#005ea3] focus:ring-2 focus:ring-[#005ea3]/10 outline-none transition-all text-sm';

const DATE_FORMATS: DateFormat[] = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
const TIME_FORMATS: TimeFormat[] = ['24h', '12h'];

const initials = (name: string) =>
  name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';

const localeFor = (f: string) => (f === 'MM/DD/YYYY' ? 'en-US' : f === 'YYYY-MM-DD' ? 'sv-SE' : 'en-GB');

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [currency, setCurrency] = useState('GBP');
  const [dateFormat, setDateFormat] = useState<DateFormat>('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('24h');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await getSettings();
      setEmail(p.profile.email);
      setDisplayName(p.profile.displayName);
      setCurrency(p.settings.currency);
      setDateFormat(p.settings.dateFormat);
      setTimeFormat(p.settings.timeFormat);
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!displayName.trim() || displayName.trim().length < 2) {
      toast.error('Display name must be at least 2 characters');
      return;
    }
    setSaving(true);
    try {
      await updateSettings({
        displayName: displayName.trim(),
        currency,
        dateFormat,
        timeFormat,
      });
      toast.success('Settings saved');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  // Live preview from the current (unsaved) selections.
  const now = new Date();
  const previewDate = now.toLocaleDateString(localeFor(dateFormat), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const previewTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: timeFormat === '12h',
  });
  const previewMoney = `${currencySymbol(currency)}1,234.50`;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-extrabold text-[#005ea3]">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your profile and global preferences</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px] text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            {/* Profile */}
            <div className={`${cardCls} p-5 sm:p-6`}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={primaryStyle}>
                  <User className="h-4 w-4 text-white" />
                </div>
                <h2 className="font-bold text-[#1b1c1c] dark:text-white">Profile</h2>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-[10px] flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                  style={primaryStyle}
                >
                  {initials(displayName || 'U')}
                </div>
                <p className="text-xs text-gray-400">
                  Profile photo changes aren&apos;t available here yet.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelCls}>Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={inputCls}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className={`${inputCls} pl-11 opacity-60 cursor-not-allowed`}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">Email can&apos;t be changed here.</p>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className={`${cardCls} p-5 sm:p-6`}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={primaryStyle}>
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <h2 className="font-bold text-[#1b1c1c] dark:text-white">Global Preferences</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className={labelCls}>Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls}>
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c} ({currencySymbol(c).trim()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Date Format</label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value as DateFormat)}
                    className={inputCls}
                  >
                    {DATE_FORMATS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Time Format</label>
                  <select
                    value={timeFormat}
                    onChange={(e) => setTimeFormat(e.target.value as TimeFormat)}
                    className={inputCls}
                  >
                    {TIME_FORMATS.map((f) => (
                      <option key={f} value={f}>
                        {f === '24h' ? '24-hour' : '12-hour'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live preview */}
              <div className="mt-5 rounded-md bg-[#005ea3]/[0.04] dark:bg-white/5 border border-[#005ea3]/[0.06] dark:border-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#707783] dark:text-gray-400 mb-2">
                  Preview
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-sm text-[#1b1c1c] dark:text-white">
                  <span>{previewMoney}</span>
                  <span>{previewDate}</span>
                  <span>{previewTime}</span>
                </div>
              </div>

              {/* Theme */}
              <div className="mt-5 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                <div>
                  <p className="text-sm font-semibold text-[#1b1c1c] dark:text-white">Appearance</p>
                  <p className="text-[11px] text-gray-400">Light / dark theme</p>
                </div>
                <ThemeToggle />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest text-red-500 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg shadow-[0_4px_14px_rgba(0,94,163,0.25)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
                style={primaryStyle}
              >
                <Check className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
