import { type ReactNode } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Database, Loader2, Server } from 'lucide-react';
import { useHealth } from './useHealth';

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function StatusRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: 'ok' | 'warn' | 'muted';
}) {
  const toneClass =
    tone === 'ok' ? 'text-success' : tone === 'warn' ? 'text-warning' : 'text-muted-fg';
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <span className="flex items-center gap-2 text-sm text-muted-fg">
        {icon}
        {label}
      </span>
      <span className={`text-sm font-medium ${toneClass}`}>{value}</span>
    </div>
  );
}

/** Live foundation health panel: API reachability and database connectivity. */
export function SystemStatusCard() {
  const { data, isLoading, isError, error } = useHealth();

  return (
    <section className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-sm">
      <header className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Activity className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">System Status</h2>
          <p className="text-xs text-muted-fg">Phase 1 · Foundation health check</p>
        </div>
      </header>

      {isLoading && (
        <div className="flex items-center gap-2 py-6 text-sm text-muted-fg">
          <Loader2 className="h-4 w-4 animate-spin" />
          Contacting API…
        </div>
      )}

      {isError && (
        <div className="flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error instanceof Error ? error.message : 'API unreachable'}</span>
        </div>
      )}

      {data && (
        <div>
          <StatusRow
            icon={<Server className="h-4 w-4" />}
            label="API"
            value={data.status === 'ok' ? 'Operational' : 'Degraded'}
            tone={data.status === 'ok' ? 'ok' : 'warn'}
          />
          <StatusRow
            icon={<Database className="h-4 w-4" />}
            label="Database"
            value={data.database === 'connected' ? 'Connected' : 'Disconnected'}
            tone={data.database === 'connected' ? 'ok' : 'warn'}
          />
          <StatusRow
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Version"
            value={data.version}
            tone="muted"
          />
          <StatusRow
            icon={<Activity className="h-4 w-4" />}
            label="Uptime"
            value={formatUptime(data.uptimeSeconds)}
            tone="muted"
          />
        </div>
      )}
    </section>
  );
}
