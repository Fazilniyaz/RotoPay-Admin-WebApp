'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Bell,
  Check,
  Trash2,
  Clock,
  Wallet,
  CheckCircle2,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

const GRADIENT = 'linear-gradient(135deg, #005ea3 0%, #006d30 100%)';
const cardCls =
  'bg-white dark:bg-[#1f2937] rounded-[10px] border border-[rgba(0,94,163,0.08)] dark:border-[rgba(160,201,255,0.08)] shadow-[0_4px_6px_rgba(0,123,210,0.06),0_2px_4px_rgba(0,123,210,0.04)]';

type NotifType = 'shift_reminder' | 'payment' | 'shift_confirmed' | 'earnings';

const TYPE_META: Record<NotifType, { icon: LucideIcon; bg: string }> = {
  shift_reminder: { icon: Clock, bg: GRADIENT },
  payment: { icon: Wallet, bg: 'linear-gradient(135deg, #006d30 0%, #37D36B 100%)' },
  shift_confirmed: { icon: CheckCircle2, bg: 'linear-gradient(135deg, #005ea3 0%, #007BD2 100%)' },
  earnings: { icon: TrendingUp, bg: 'linear-gradient(135deg, #006d30 0%, #008557 100%)' },
};

interface Notif {
  id: number;
  type: NotifType;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

const INITIAL: Notif[] = [
  { id: 1, type: 'shift_reminder', title: 'Shift Reminder', message: 'Your shift at Coffee Co starts in 1 hour', read: false, timestamp: '5 minutes ago' },
  { id: 2, type: 'payment', title: 'Payment Received', message: 'You received £96 from Retail Plus', read: false, timestamp: '1 hour ago' },
  { id: 3, type: 'shift_confirmed', title: 'Shift Confirmed', message: 'Your shift on March 20 has been confirmed', read: true, timestamp: '2 hours ago' },
  { id: 4, type: 'earnings', title: 'Earnings Update', message: 'You earned £256 this week', read: true, timestamp: '1 day ago' },
];

export default function NotificationsPage() {
  const [items, setItems] = useState<Notif[]>(INITIAL);
  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () => setItems((xs) => xs.map((n) => ({ ...n, read: true })));
  const remove = (id: number) => setItems((xs) => xs.filter((n) => n.id !== id));
  const toggleRead = (id: number) =>
    setItems((xs) => xs.map((n) => (n.id === id ? { ...n, read: true } : n)));

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

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[320px] text-center">
            <div className="mb-5 p-7 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Bell className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">No notifications</h3>
            <p className="text-sm text-gray-400">You&apos;re all caught up.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((n) => {
              const meta = TYPE_META[n.type];
              const Icon = meta.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => toggleRead(n.id)}
                  className={`${cardCls} p-4 flex items-start gap-3 cursor-pointer transition-all hover:shadow-[0_10px_24px_rgba(0,94,163,0.12)] ${
                    !n.read ? 'border-l-[3px] border-l-[#005ea3]' : ''
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
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#005ea3] flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-[#404752] dark:text-gray-300 mt-0.5">{n.message}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1.5">
                      {n.timestamp}
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
