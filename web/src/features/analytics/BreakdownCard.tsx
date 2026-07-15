import type { NamedValue } from '@coresphere/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, formatNumber } from '@/lib/format';

const COLORS = ['#78a4cb', '#e0a02e', '#95bdd7', '#5e8cb8', '#22c55e', '#8b5cf6', '#14b8a6', '#ef4444', '#64748b'];

export function BreakdownCard({
  title,
  data,
  format = 'number',
}: {
  title: string;
  data: NamedValue[];
  format?: 'number' | 'currency';
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const fmt = (v: number) => (format === 'currency' ? formatCurrency(v) : formatNumber(v));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-fg">No data yet.</p>
        ) : (
          <div className="space-y-3">
            {data.map((d, i) => (
              <div key={d.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    {d.name}
                  </span>
                  <span className="text-muted-fg">{fmt(d.value)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div className="h-full rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
