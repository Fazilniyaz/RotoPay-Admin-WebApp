'use client';

// hooks/useDataSync.ts
// Kicks off the one-time, whole-app data preload once the user is authenticated.
// Mounted in DashboardLayout so every dashboard page benefits — the first page
// after login fills the cache, every page after that renders from memory.
import { useEffect } from 'react';
import { authStore } from '@/store/authStore';
import { dataStore } from '@/store/dataStore';

export function useDataSync() {
  const isAuthenticated = authStore((s) => s.isAuthenticated);
  const isHydrated = authStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      dataStore.getState().loadAll();
    }
  }, [isHydrated, isAuthenticated]);
}
