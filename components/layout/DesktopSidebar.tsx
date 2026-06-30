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
  Zap,
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
    <>
      <style>{`
        .rp-sidebar {
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-right: 1px solid rgba(0, 94, 163, 0.10);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'Montserrat', sans-serif;
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: relative;
          z-index: 50;
          flex-shrink: 0;
        }

        .dark .rp-sidebar {
          background: rgba(17, 24, 39, 0.92);
          border-right-color: rgba(160, 201, 255, 0.10);
        }

        .rp-sidebar-logo {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 16px 20px;
          border-bottom: 1px solid rgba(0, 94, 163, 0.08);
        }

        .dark .rp-sidebar-logo {
          border-bottom-color: rgba(160, 201, 255, 0.08);
        }

        .rp-logo-mark {
          display: flex;
          align-items: center;
          text-decoration: none;
          overflow: hidden;
        }

        .rp-logo-image-container {
          height: 40px;
          overflow: hidden;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .rp-logo-image {
          height: 40px;
          width: auto;
          flex-shrink: 0;
          transition: filter 0.3s ease;
        }

        .dark .rp-logo-image {
          filter: brightness(0) invert(1);
        }

        .rp-collapse-btn {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: 1px solid rgba(0, 94, 163, 0.12);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #404752;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }

        .rp-collapse-btn:hover {
          background: rgba(0, 94, 163, 0.08);
          color: #005ea3;
        }

        .dark .rp-collapse-btn {
          border-color: rgba(160, 201, 255, 0.15);
          color: #9ca3af;
        }

        .dark .rp-collapse-btn:hover {
          background: rgba(160, 201, 255, 0.1);
          color: #a0c9ff;
        }

        .rp-nav {
          flex: 1;
          overflow-y: auto;
          padding: 16px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          scrollbar-width: none;
        }

        .rp-nav::-webkit-scrollbar {
          display: none;
        }

        .rp-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.15s, color 0.15s, transform 0.15s;
          color: #404752;
          font-family: 'Montserrat', sans-serif;
          font-size: 15px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          border: 1px solid transparent;
        }

        .rp-nav-item:hover {
          background: rgba(0, 94, 163, 0.06);
          color: #005ea3;
        }

        .dark .rp-nav-item {
          color: #9ca3af;
        }

        .dark .rp-nav-item:hover {
          background: rgba(160, 201, 255, 0.08);
          color: #a0c9ff;
        }

        .rp-nav-item.active {
          background: linear-gradient(135deg, #005ea3 0%, #006d30 100%);
          color: #ffffff;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(0, 94, 163, 0.30);
          transform: scale(1.02);
          border-left: 3px solid rgba(106, 255, 144, 0.8);
        }

        .rp-nav-item.active:hover {
          color: #ffffff;
        }

        .dark .rp-nav-item.active {
          color: #ffffff;
        }

        .rp-nav-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .rp-nav-label {
          overflow: hidden;
          transition: width 0.3s, opacity 0.3s;
        }

        .rp-sidebar-footer {
          padding: 12px 10px 16px;
          border-top: 1px solid rgba(0, 94, 163, 0.08);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dark .rp-sidebar-footer {
          border-top-color: rgba(160, 201, 255, 0.08);
        }

        .rp-theme-row {
          padding: 0 4px;
        }

        .rp-user-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(0, 94, 163, 0.05);
          border: 1px solid rgba(0, 94, 163, 0.08);
          cursor: pointer;
          transition: background 0.15s;
          width: 100%;
          text-align: left;
          overflow: hidden;
        }

        .rp-user-card:hover {
          background: rgba(0, 94, 163, 0.09);
        }

        .dark .rp-user-card {
          background: rgba(160, 201, 255, 0.06);
          border-color: rgba(160, 201, 255, 0.10);
        }

        .dark .rp-user-card:hover {
          background: rgba(160, 201, 255, 0.10);
        }

        .rp-user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #005ea3, #006d30);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
          overflow: hidden;
        }

        .rp-user-info {
          flex: 1;
          overflow: hidden;
          transition: width 0.3s, opacity 0.3s;
        }

        .rp-user-name {
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #1b1c1c;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dark .rp-user-name {
          color: #f9fafb;
        }

        .rp-user-email {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          color: #404752;
          margin: 1px 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dark .rp-user-email {
          color: #9ca3af;
        }

        .rp-sidebar[data-collapsed="true"] .rp-nav-label,
        .rp-sidebar[data-collapsed="true"] .rp-user-info {
          width: 0;
          opacity: 0;
          pointer-events: none;
        }

        /* When collapsed, hide the wide logo (so it can't be squeezed)
           and center the toggle button in the narrow rail. */
        .rp-sidebar[data-collapsed="true"] .rp-sidebar-logo {
          justify-content: center;
          padding-left: 0;
          padding-right: 0;
        }

        .rp-sidebar[data-collapsed="true"] .rp-logo-mark {
          display: none;
        }

        .rp-sidebar[data-collapsed="true"] .rp-nav-item {
          justify-content: center;
          gap: 0;
          padding: 10px;
        }

        .rp-sidebar[data-collapsed="true"] .rp-user-card {
          justify-content: center;
          gap: 0;
          padding: 8px;
        }

        .rp-sidebar[data-collapsed="true"] .rp-nav-item.active {
          border-left-width: 0;
        }
      `}</style>

      <aside
        className="rp-sidebar"
        data-collapsed={isCollapsed ? 'true' : 'false'}
        style={{ width: isCollapsed ? '64px' : '260px' }}
      >
        {/* Logo */}
        <div className="rp-sidebar-logo">
          <Link href="/dashboard" className="rp-logo-mark">
            <div className="rp-logo-image-container">
              <img src="/rotapay-logo.png" alt="RotaPay" className="rp-logo-image" />
            </div>
          </Link>
          <button
            className="rp-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <Menu size={14} /> : <X size={14} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="rp-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rp-nav-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="rp-nav-icon" strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="rp-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="rp-sidebar-footer">
          {!isCollapsed && (
            <div className="rp-theme-row">
              <ThemeToggle />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className="rp-user-card">
              <div className="rp-user-avatar">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.displayName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="rp-user-info">
                  <p className="rp-user-name">{user?.displayName}</p>
                  <p className="rp-user-email">{user?.email}</p>
                </div>
                {!isCollapsed && (
                  <ChevronDown size={14} style={{ flexShrink: 0, color: '#404752' }} />
                )}
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
    </>
  );
}