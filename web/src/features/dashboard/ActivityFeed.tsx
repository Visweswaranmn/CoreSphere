import type { ActivityItem } from '@coresphere/shared';
import { cn } from '@/lib/cn';
import { formatRelativeTime } from '@/lib/format';

const dotClasses: Record<ActivityItem['tone'], string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-sky-500',
};

export function ActivityFeed({ entries }: { entries: ActivityItem[] }) {
  return (
    <ul className="space-y-4">
      {entries.map((entry, index) => (
        <li key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', dotClasses[entry.tone])} />
            {index < entries.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
          </div>
          <div className="pb-1">
            <p className="text-sm text-foreground">
              <span className="font-medium">{entry.actor}</span>{' '}
              <span className="text-muted-fg">{entry.action}</span>{' '}
              <span className="font-medium">{entry.target}</span>
            </p>
            <p className="text-xs text-muted-fg">{formatRelativeTime(entry.timestamp)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
