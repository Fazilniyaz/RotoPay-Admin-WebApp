// hooks/useNotificationsSync.ts
// The single notifications poller for the whole dashboard. Mounted once in
// DashboardLayout: it refreshes the shared store every minute and raises a toast
// for any newly-arrived notification — most importantly the "shift starts in an
// hour" reminders, which surface automatically the moment they become due.
'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { Clock } from 'lucide-react';
import { createElement } from 'react';
import { notificationsStore } from '@/store/notificationsStore';

const POLL_MS = 60_000;

export function useNotificationsSync() {
  const refresh = notificationsStore((s) => s.refresh);

  useEffect(() => {
    let active = true;

    const tick = async () => {
      try {
        const fresh = await refresh();
        if (!active || fresh.length === 0) return;
        // Reminders are the actionable ones — alert those distinctly.
        for (const n of fresh) {
          if (n.type === 'shift_reminder') {
            toast(n.title, { description: n.message, icon: createElement(Clock, { size: 18 }) });
          }
        }
      } catch {
        /* best-effort: a failed poll just retries next cycle */
      }
    };

    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [refresh]);
}
