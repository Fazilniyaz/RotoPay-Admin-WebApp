'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  Calendar,
  Clock,
  LayoutGrid,
  Building2,
  CalendarDays,
  BarChart3,
  Bell,
  Wallet,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Matches the RotaPay native app's bottom-nav accent gradient.
const GRADIENT = 'linear-gradient(135deg, #007BD2 0%, #37D36B 100%)';

const mainTabs = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/shifts', label: 'Shifts', icon: Calendar },
  { href: '/dashboard/clock', label: 'Clock', icon: Clock },
];

const moreItems = [
  { href: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/dashboard/employers', label: 'Employers', icon: Building2 },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/earnings', label: 'Earnings', icon: Wallet },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function TabInner({
  Icon,
  label,
  active,
}: {
  Icon: LucideIcon;
  label: string;
  active: boolean;
}) {
  if (active) {
    return (
      <div
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full shadow-sm"
        style={{ background: GRADIENT }}
      >
        <Icon className="h-[18px] w-[18px] text-white" strokeWidth={2.4} />
        <span className="text-[12px] font-bold text-white whitespace-nowrap">{label}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <Icon className="h-[22px] w-[22px] text-[#707783] dark:text-gray-400" strokeWidth={1.9} />
      <span className="text-[10px] font-medium text-[#707783] dark:text-gray-400">{label}</span>
    </div>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const isHome = pathname === '/dashboard';
  const isShifts = pathname.startsWith('/dashboard/shifts');
  const isClock = pathname.startsWith('/dashboard/clock');
  const moreActive =
    pathname.startsWith('/dashboard') && !isHome && !isShifts && !isClock;

  const isActive = (href: string) =>
    href === '/dashboard' ? isHome : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-[#1f2937] border-t border-[#c0c7d4]/40 dark:border-gray-700/50">
      <div
        className="flex items-stretch px-2 pt-2"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
      >
        {mainTabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 flex items-center justify-center py-1"
          >
            <TabInner Icon={tab.icon} label={tab.label} active={isActive(tab.href)} />
          </Link>
        ))}

        {/* More */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex-1 flex items-center justify-center py-1 outline-none">
            <TabInner Icon={LayoutGrid} label="More" active={moreActive} />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="mb-2 w-52">
            {moreItems.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem key={item.href} onClick={() => router.push(item.href)}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
