// store/notificationsStore.ts
// Single source of truth for the notification feed + unread badge.
//
// One poller (mounted in DashboardLayout via useNotificationsSync) refreshes
// this store every minute; the sidebar, dashboard feed and notifications page
// all read from it — so the whole app makes ONE notifications request per cycle
// instead of each surface fetching independently.
//
// Because the backend only returns notifications whose scheduledAt <= now, a
// scheduled reminder (e.g. "shift starts in an hour") simply shows up on the
// next refresh once it becomes due — the store diffs incoming items against the
// ones it has already seen so freshly-arrived reminders can be toasted.
import { create } from 'zustand';
import { Notification } from '@/lib/types';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '@/lib/services/notifications';

// How many notifications to keep in the shared store (covers feed + page).
const FETCH_LIMIT = 100;

interface NotificationsState {
  items: Notification[];
  unread: number;
  loaded: boolean;
  seenIds: Set<string>;
  /** Refresh from the API. Returns the notifications that arrived since last time. */
  refresh: () => Promise<Notification[]>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const notificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  unread: 0,
  loaded: false,
  seenIds: new Set<string>(),

  refresh: async () => {
    const res = await listNotifications({ limit: FETCH_LIMIT });
    const { seenIds, loaded } = get();

    // On the very first load everything is "already seen" (no toast storm);
    // afterwards, anything whose id we haven't recorded is genuinely new.
    const fresh = loaded ? res.data.filter((n) => !seenIds.has(n.id)) : [];

    const nextSeen = new Set(seenIds);
    for (const n of res.data) nextSeen.add(n.id);

    set({ items: res.data, unread: res.unread, loaded: true, seenIds: nextSeen });
    return fresh;
  },

  markRead: async (id) => {
    const target = get().items.find((n) => n.id === id);
    if (!target || target.isRead) return;
    set((s) => ({
      items: s.items.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unread: Math.max(0, s.unread - 1),
    }));
    try {
      await markNotificationRead(id);
    } catch {
      get().refresh().catch(() => {});
    }
  },

  markAllRead: async () => {
    set((s) => ({ items: s.items.map((n) => ({ ...n, isRead: true })), unread: 0 }));
    try {
      await markAllNotificationsRead();
    } catch {
      get().refresh().catch(() => {});
    }
  },

  remove: async (id) => {
    const prev = get().items;
    const wasUnread = prev.some((n) => n.id === id && !n.isRead);
    set((s) => ({
      items: s.items.filter((n) => n.id !== id),
      unread: wasUnread ? Math.max(0, s.unread - 1) : s.unread,
    }));
    try {
      await deleteNotification(id);
    } catch {
      set({ items: prev });
      get().refresh().catch(() => {});
    }
  },
}));
