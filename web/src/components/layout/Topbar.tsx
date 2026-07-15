import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, UserRound } from 'lucide-react';
import { ROLE_LABELS } from '@coresphere/shared';
import { Avatar } from '@/components/ui/Avatar';
import {
  DropdownItem,
  DropdownMenu,
  DropdownSeparator,
} from '@/components/ui/DropdownMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/features/auth/useAuth';
import { NotificationBell } from '@/features/notifications/NotificationBell';

interface TopbarProps {
  onMenuClick: () => void;
  onToggleCollapse: () => void;
  collapsed: boolean;
}

export function Topbar({ onMenuClick, onToggleCollapse, collapsed }: TopbarProps) {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-muted-fg transition-colors hover:bg-surface-muted hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden rounded-lg p-2 text-muted-fg transition-colors hover:bg-surface-muted hover:text-foreground lg:inline-flex"
        >
          {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <NotificationBell />

        <ThemeToggle />

        <DropdownMenu
          align="end"
          trigger={
            <span className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-surface-muted">
              <Avatar name={user.fullName} size="sm" />
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-medium leading-tight text-foreground">
                  {user.fullName}
                </span>
                <span className="block text-xs leading-tight text-muted-fg">
                  {ROLE_LABELS[user.role]}
                </span>
              </span>
            </span>
          }
        >
          <div className="px-2.5 py-2">
            <p className="text-sm font-medium text-foreground">{user.fullName}</p>
            <p className="truncate text-xs text-muted-fg">{user.email}</p>
          </div>
          <DropdownSeparator />
          <DropdownItem icon={UserRound}>Profile</DropdownItem>
          <DropdownSeparator />
          <DropdownItem icon={LogOut} danger onSelect={() => void logout()}>
            Sign out
          </DropdownItem>
        </DropdownMenu>
      </div>
    </header>
  );
}
