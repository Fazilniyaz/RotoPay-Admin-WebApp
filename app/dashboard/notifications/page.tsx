'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Bell,
  Check,
  Trash2,
  Clock,
  Wallet,
  UserCog,
  Building2,
  Coins,
  LogIn,
  LogOut,
  PlusCircle,
  SquarePen,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { Notification } from '@/lib/types';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '@/lib/services/notifications';
import { timeAgo } from '@/lib/format';

const GRADIENT = 'linear-gradient(135deg, #005ea3 0%, #006d30 100%)';
const cardCls =
  'bg-white dark:bg-[#1f2937] rounded-[10px] border border-[rgba(0,94,163,0.08)] dark:border-[rgba(160,201,255,0.08)] shadow-[0_4px_6px_rgba(0,123,210,0.06),0_2px_4px_rgba(0,123,210,0.04)]';

const GREEN = 'linear-gradient(135deg, #006d30 0%, #37D36B 100%)';
const BLUE = 'linear-gradient(135deg, #005ea3 0%, #007BD2 100%)';
const GRAY = 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)';
const RED = 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)';

// Icon + accent per activity type (keep in sync with the backend NotificationType).
const TYPE_META: Record<string, { icon: LucideIcon; bg: string }> = {
  shift_added: { icon: PlusCircle, bg: BLUE },
  shift_updated: { icon: SquarePen, bg: BLUE },
  shift_removed: { icon: Trash2, bg: RED },
  shift_reminder: { icon: Clock, bg: GRADIENT },
  profile_updated: { icon: UserCog, bg: GRAY },
  payment_confirmed: { icon: Wallet, bg: GREEN },
  employee_added: { icon: Building2, bg: BLUE },
  wage_added: { icon: Coins, bg: GREEN },
  clock_in: { icon: LogIn, bg: GREEN },
  clock_out: { icon: LogOut, bg: GRAY },
};
const metaFor = (type: string) => TYPE_META[type] ?? { icon: Bell, bg: GRADIENT };

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listNotifications({ limit: 100 });
      setItems(res.data);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unread = items.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    setItems((xs) => xs.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      toast.error('Failed to update');
      load();
    }
  };

  const toggleRead = async (n: Notification) => {
    if (n.isRead) return;
    setItems((xs) => xs.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    try {
      await markNotificationRead(n.id);
    } catch {
      load();
    }
  };

  const remove = async (id: string) => {
    const prev = items;
    setItems((xs) => xs.filter((n) => n.id !== id));
    try {
      await deleteNotification(id);
    } catch {
      toast.error('Failed to delete');
      setItems(prev);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-[#005ea3]">Notifications</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {unread > 0 ? `${unread} unread notification${unread !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest text-[#005ea3] border border-[#005ea3]/20 hover:bg-[#005ea3]/[0.06] transition-colors"
            >
              <Check className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[320px] text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[320px] text-center">
            <div className="mb-5 p-7 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Bell className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">No notifications</h3>
            <p className="text-sm text-gray-400">Your recent activity will show up here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((n) => {
              const meta = metaFor(n.type);
              const Icon = meta.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => toggleRead(n)}
                  className={`${cardCls} p-4 flex items-start gap-3 cursor-pointer transition-all hover:shadow-[0_10px_24px_rgba(0,94,163,0.12)] ${
                    !n.isRead ? 'border-l-[3px] border-l-[#005ea3]' : ''
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{ background: meta.bg }}
                  >
                    <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#1b1c1c] dark:text-white">{n.title}</h3>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#005ea3] flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-[#404752] dark:text-gray-300 mt-0.5">{n.message}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1.5">
                      {timeAgo(n.scheduledAt ?? n.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(n.id);
                    }}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex-shrink-0"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
