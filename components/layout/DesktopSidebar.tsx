'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Building2,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/shifts', label: 'Shifts', icon: Calendar },
  { href: '/dashboard/clock', label: 'Clock In/Out', icon: Clock },
  { href: '/dashboard/employers', label: 'Employers', icon: Building2 },
  { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout: handleLogout } = authStore();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogoutClick = async () => {
    await logout();
    router.push('/auth/login');
  };

  const initials = user ? getInitials(user.displayName) : 'U';

  return (
    <aside
      className={`flex flex-col border-r border-border/50 bg-card transition-all duration-300 ${
        isCollapsed ? 'w-[60px]' : 'w-[260px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 flex-1">
            <img src="/rotapay-logo.png" alt="RotaPay" className="h-10 w-auto" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={`w-full justify-start gap-3 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-accent text-white'
                    : 'hover:bg-muted-bg'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle & User Menu */}
      <div className="border-t border-border/50 p-2 space-y-2">
        {!isCollapsed && (
          <div className="px-2 py-2">
            <ThemeToggle />
          </div>
        )}

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full ${isCollapsed ? 'p-0' : 'justify-between'}`}
            >
              <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profilePicture} alt={user?.displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold truncate">{user?.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isCollapsed ? 'center' : 'end'} className="w-48">
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogoutClick} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
