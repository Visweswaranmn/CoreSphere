import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { Kpi } from './sampleData';

export function StatCard({ kpi }: { kpi: Kpi }) {
  const positive = kpi.deltaPct >= 0;
  const value = kpi.format === 'currency' ? formatCurrency(kpi.value) : formatNumber(kpi.value);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <kpi.icon className="h-[18px] w-[18px]" />
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-0.5 text-xs font-medium',
            positive ? 'text-success' : 'text-danger',
          )}
        >
          {positive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {Math.abs(kpi.deltaPct)}%
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-fg">{kpi.label}</p>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="mt-4 h-7 w-28" />
      <Skeleton className="mt-2 h-4 w-20" />
    </Card>
  );
}
