import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, CheckCircle2, Info } from 'lucide-react';
import { type NotificationType } from '@coresphere/shared';
import { DropdownMenu, DropdownSeparator } from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/cn';
import { formatRelativeTime } from '@/lib/format';
import { useMarkRead, useNotifications, useUnreadCount } from './notificationHooks';

const typeIcon: Record<NotificationType, { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: 'text-primary' },
  success: { icon: CheckCircle2, className: 'text-success' },
  warning: { icon: AlertTriangle, className: 'text-warning' },
};

export function NotificationBell() {
  const navigate = useNavigate();
  const { data: unread } = useUnreadCount();
  const listParams = useMemo(() => ({ pageSize: 5 }), []);
  const { data } = useNotifications(listParams);
  const markRead = useMarkRead();

  const count = unread?.unread ?? 0;
  const items = data?.items ?? [];

  return (
    <DropdownMenu
      trigger={
        <span className="relative inline-flex rounded-lg p-2 text-muted-fg transition-colors hover:bg-surface-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-surface bg-primary px-1 text-[10px] font-semibold text-primary-fg">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </span>
      }
      className="w-80"
    >
      <div className="flex items-center justify-between px-2.5 py-2">
        <p className="text-sm font-semibold text-foreground">Notifications</p>
        <span className="text-xs text-muted-fg">{count} unread</span>
      </div>
      <DropdownSeparator />

      {items.length === 0 ? (
        <p className="px-2.5 py-8 text-center text-sm text-muted-fg">You're all caught up.</p>
      ) : (
        <ul className="max-h-80 overflow-y-auto">
          {items.map((n) => {
            const { icon: Icon, className } = typeIcon[n.type];
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => !n.read && markRead.mutate(n.id)}
                  className={cn('flex w-full items-start gap-2.5 px-2.5 py-2 text-left hover:bg-surface-muted', !n.read && 'bg-primary/5')}
                >
                  <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', className)} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">{n.title}</span>
                    <span className="block truncate text-xs text-muted-fg">{n.message}</span>
                    <span className="block text-[11px] text-muted-fg">{formatRelativeTime(n.createdAt)}</span>
                  </span>
                  {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <DropdownSeparator />
      <button
        type="button"
        onClick={() => navigate('/notifications')}
        className="w-full rounded-md px-2.5 py-2 text-center text-sm font-medium text-primary hover:bg-surface-muted"
      >
        View all notifications
      </button>
    </DropdownMenu>
  );
}
