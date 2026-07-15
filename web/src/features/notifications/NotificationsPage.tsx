import { useMemo, useState } from 'react';
import { AlertTriangle, Bell, CheckCheck, CheckCircle2, Info, Megaphone, Trash2 } from 'lucide-react';
import { type NotificationType } from '@coresphere/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { cn } from '@/lib/cn';
import { formatRelativeTime } from '@/lib/format';
import { Role } from '@coresphere/shared';
import { useAuth } from '@/features/auth/useAuth';
import { BroadcastModal } from './BroadcastModal';
import { useDeleteNotification, useMarkAllRead, useMarkRead, useNotifications } from './notificationHooks';

const typeConfig: Record<NotificationType, { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: 'text-primary' },
  success: { icon: CheckCircle2, className: 'text-success' },
  warning: { icon: AlertTriangle, className: 'text-warning' },
};

const PAGE_SIZE = 15;

export function NotificationsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, unread: unreadOnly ? 'true' : undefined }),
    [page, unreadOnly],
  );

  const { data, isLoading } = useNotifications(params);
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const deleteNotification = useDeleteNotification();
  const items = data?.items ?? [];
  const isAdmin = user?.role === Role.SuperAdmin;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Your alerts and announcements."
        actions={
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="secondary" onClick={() => setBroadcastOpen(true)}>
                <Megaphone className="h-4 w-4" />
                Announce
              </Button>
            )}
            <Button variant="secondary" onClick={() => markAllRead.mutate()} isLoading={markAllRead.isPending}>
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex gap-1 border-b border-border">
        {[
          { key: false, label: 'All' },
          { key: true, label: 'Unread' },
        ].map((t) => (
          <button
            key={String(t.key)}
            type="button"
            onClick={() => { setUnreadOnly(t.key); setPage(1); }}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              unreadOnly === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-fg hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" description="No notifications to show." />
      ) : (
        <>
          <Card>
            <ul className="divide-y divide-border">
              {items.map((n) => {
                const { icon: Icon, className } = typeConfig[n.type];
                return (
                  <li key={n.id} className={cn('flex items-start gap-3 p-4', !n.read && 'bg-primary/5')}>
                    <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', className)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </div>
                      <p className="text-sm text-muted-fg">{n.message}</p>
                      <p className="mt-1 text-xs text-muted-fg">{formatRelativeTime(n.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!n.read && (
                        <button type="button" onClick={() => markRead.mutate(n.id)} className="rounded p-1 text-xs text-primary hover:underline">
                          Mark read
                        </button>
                      )}
                      <button type="button" onClick={() => deleteNotification.mutate(n.id)} aria-label="Remove" className="rounded p-1 text-muted-fg hover:text-danger">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            {data && <Pagination meta={data.meta} onPageChange={setPage} />}
          </Card>
        </>
      )}

      <BroadcastModal open={broadcastOpen} onClose={() => setBroadcastOpen(false)} />
    </div>
  );
}
