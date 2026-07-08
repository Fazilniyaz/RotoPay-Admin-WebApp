'use client';

// components/layout/DefaultEmployeeSwitcher.tsx
// ─────────────────────────────────────────────
// Sidebar control for the DEFAULT EMPLOYEE — the employee that scopes the
// calendar, earnings and reports. It shows the current default and a dropdown of
// all employees; switching here re-scopes the whole app from ANY page (drives
// dataStore.setDefaultEmployer, which refreshes those slices). Lives in the
// sidebar footer next to the theme toggle. Styled to match the sidebar cards.
// ─────────────────────────────────────────────
import { useState } from 'react';
import { toast } from 'sonner';
import { Users, Check, ChevronsUpDown, Loader2, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { dataStore } from '@/store/dataStore';

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

export function DefaultEmployeeSwitcher({ collapsed }: { collapsed: boolean }) {
  const employers = dataStore((s) => s.employers);
  const defaultEmployerId = dataStore((s) => s.defaultEmployerId);
  const [switching, setSwitching] = useState<string | null>(null);

  // Nothing to show before the cache loads / for a user with no employees
  // (the onboarding gate handles the zero-employee case).
  if (employers.length === 0) return null;

  const current = employers.find((e) => e.id === defaultEmployerId) ?? employers[0];

  const pick = async (id: string) => {
    if (id === defaultEmployerId || switching) return;
    const emp = employers.find((e) => e.id === id);
    setSwitching(id);
    try {
      await dataStore.getState().setDefaultEmployer(id);
      toast.success(`Now showing ${emp?.employerName}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not switch employee');
    } finally {
      setSwitching(null);
    }
  };

  return (
    <>
      <style>{`
        .rp-emp-switch { display: flex; flex-direction: column; }
        .rp-emp-caption {
          font-size: 9px; font-weight: 800; letter-spacing: 0.11em; text-transform: uppercase;
          color: #707783; padding: 0 6px; margin: 0 0 3px;
          display: flex; align-items: center; gap: 5px;
        }
        .dark .rp-emp-caption { color: #9ca3af; }
        .rp-emp-card {
          display: flex; align-items: center; gap: 9px; width: 100%;
          padding: 6px 9px; border-radius: 10px;
          background: linear-gradient(135deg, rgba(2,69,122,0.07), rgba(0,27,72,0.07));
          border: 1px solid rgba(2,69,122,0.14);
          cursor: pointer; text-align: left; transition: background 0.15s, border-color 0.15s;
          font-family: 'Montserrat', sans-serif; overflow: hidden;
        }
        .rp-emp-card:hover { background: rgba(2,69,122,0.12); border-color: rgba(2,69,122,0.22); }
        .dark .rp-emp-card { background: rgba(214,232,238,0.07); border-color: rgba(214,232,238,0.12); }
        .dark .rp-emp-card:hover { background: rgba(214,232,238,0.12); }
        .rp-emp-avatar {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          background: linear-gradient(135deg, #02457a, #001b48);
          color: #fff; font-size: 11px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .rp-emp-info { flex: 1; min-width: 0; }
        .rp-emp-name {
          font-size: 12.5px; font-weight: 700; color: #1b1c1c; margin: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .dark .rp-emp-name { color: #f9fafb; }
        .rp-emp-sub {
          font-size: 10px; color: #707783; margin: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .dark .rp-emp-sub { color: #9ca3af; }
        .rp-emp-switch[data-collapsed="true"] .rp-emp-caption,
        .rp-emp-switch[data-collapsed="true"] .rp-emp-info,
        .rp-emp-switch[data-collapsed="true"] .rp-emp-chevron { display: none; }
        .rp-emp-switch[data-collapsed="true"] .rp-emp-card { justify-content: center; gap: 0; padding: 8px; }
      `}</style>

      <div className="rp-emp-switch" data-collapsed={collapsed ? 'true' : 'false'}>
        {!collapsed && (
          <p className="rp-emp-caption">
            <Star size={10} className="fill-current" /> Default employee
          </p>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="rp-emp-card" title={collapsed ? current.employerName : undefined}>
            <div className="rp-emp-avatar">
              {switching ? <Loader2 size={15} className="animate-spin" /> : initialsOf(current.employerName)}
            </div>
            <div className="rp-emp-info">
              <p className="rp-emp-name">{current.employerName}</p>
              <p className="rp-emp-sub">{current.store}</p>
            </div>
            <ChevronsUpDown size={14} className="rp-emp-chevron" style={{ flexShrink: 0, color: '#707783' }} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align={collapsed ? 'center' : 'start'} side="top" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Users className="h-3.5 w-3.5" /> Switch employee
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {employers.map((emp) => {
                const isCurrent = emp.id === defaultEmployerId;
                return (
                  <DropdownMenuItem key={emp.id} onClick={() => pick(emp.id)} className="gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#02457a]/10 text-[10px] font-bold text-[#02457a] dark:text-[#d6e8ee]">
                      {initialsOf(emp.employerName)}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block truncate text-sm font-semibold">{emp.employerName}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{emp.store}</span>
                    </span>
                    {isCurrent && <Check className="h-4 w-4 text-[#001b48]" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
