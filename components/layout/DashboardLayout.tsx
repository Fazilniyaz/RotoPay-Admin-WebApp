'use client';

import { ReactNode, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { getSettings } from '@/lib/services/settings';
import { useNotificationsSync } from '@/hooks/useNotificationsSync';
import { useDataSync } from '@/hooks/useDataSync';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Single notifications poller for the whole dashboard (feeds sidebar badge,
  // dashboard feed and notifications page; toasts due reminders).
  useNotificationsSync();

  // Preload every module's data once after login so page navigation is instant
  // (pages read from the shared dataStore instead of re-fetching on mount).
  useDataSync();

  // Load the user's global preferences (currency / date / time) once.
  useEffect(() => {
    getSettings().catch(() => undefined);
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && <DesktopSidebar />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="container mx-auto max-w-7xl px-4 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}

      {/* Blocks the app until the user has created their first (default) employee. */}
      <OnboardingGate />
    </div>
  );
}
