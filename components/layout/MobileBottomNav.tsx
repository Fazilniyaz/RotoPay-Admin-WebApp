'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  User,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const bottomNavItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/shifts', label: 'Shifts', icon: Calendar },
  { href: '/dashboard/clock', label: 'Clock', icon: Clock },
  { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dashboard/settings', label: 'Profile', icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-card">
      <div className="flex items-center justify-between h-16 px-0 max-w-md mx-auto md:hidden">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <Button
                variant="ghost"
                className={`w-full h-16 rounded-none flex-col gap-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-primary border-t-2 border-primary bg-primary/5'
                    : 'text-muted-foreground hover:bg-muted-bg'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''}`} />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}

        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-16 h-16 rounded-none flex-col gap-1 text-xs font-medium">
              <MoreVertical className="h-5 w-5" />
              <span>More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mb-16">
            <DropdownMenuItem onClick={() => router.push('/dashboard/employers')}>
              Employers
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard/reports')}>
              Reports
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/dashboard/notifications')}>
              Notifications
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
