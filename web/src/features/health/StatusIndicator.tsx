import { cn } from '@/lib/cn';
import { useHealth } from './useHealth';

/** Compact API/database connectivity indicator for the sidebar footer. */
export function StatusIndicator({ collapsed = false }: { collapsed?: boolean }) {
  const { data, isLoading, isError } = useHealth();

  const healthy = data?.status === 'ok' && data.database === 'connected';
  const tone = isLoading ? 'muted' : healthy ? 'ok' : 'down';

  const dotClass =
    tone === 'ok' ? 'bg-success' : tone === 'down' ? 'bg-danger' : 'bg-muted-fg animate-pulse';
  const label = isLoading
    ? 'Checking…'
    : isError || !healthy
      ? 'Service degraded'
      : 'All systems operational';

  if (collapsed) {
    return (
      <div className="flex justify-center py-3" title={label}>
        <span className={cn('h-2.5 w-2.5 rounded-full', dotClass)} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-fg">
      <span className={cn('h-2 w-2 rounded-full', dotClass)} />
      {label}
    </div>
  );
}
