'use client';

import { ReactNode, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { getSettings } from '@/lib/services/settings';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

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
    </div>
  );
}
