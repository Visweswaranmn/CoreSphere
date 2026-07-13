import { NavLink } from 'react-router-dom';
import { Boxes } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAuth } from '@/features/auth/useAuth';
import { navigationForRole } from '@/config/navigation';
import { StatusIndicator } from '@/features/health/StatusIndicator';

interface SidebarContentProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

/** The brand + role-filtered navigation. Shared by the desktop and mobile sidebars. */
export function SidebarContent({ collapsed = false, onNavigate }: SidebarContentProps) {
  const { user } = useAuth();
  if (!user) return null;

  const groups = navigationForRole(user.role);

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 items-center gap-2.5 px-4', collapsed && 'justify-center px-0')}>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-fg">
          <Boxes className="h-5 w-5" />
        </span>
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">CoreSphere</p>
            <p className="text-xs text-muted-fg">ERP Platform</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-fg">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                        collapsed && 'justify-center px-0',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-fg hover:bg-surface-muted hover:text-foreground',
                      )
                    }
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border">
        <StatusIndicator collapsed={collapsed} />
      </div>
    </div>
  );
}
