import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PieChart } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/format';
import { useFinanceStats } from './financeHooks';

const CATEGORY_COLORS = ['#4e7ba6', '#e0a02e', '#95bdd7', '#78a4cb', '#22c55e', '#8b5cf6', '#14b8a6', '#ef4444'];

export function OverviewPanel() {
  const { data: stats, isLoading } = useFinanceStats();

  const tiles = [
    { label: 'Pending approval', value: formatNumber(stats?.pendingCount ?? 0), sub: formatCurrency(stats?.pendingAmount ?? 0) },
    { label: 'Approved', value: formatCurrency(stats?.approvedAmount ?? 0), sub: 'awaiting reimbursement' },
    { label: 'Reimbursed', value: formatCurrency(stats?.reimbursedAmount ?? 0), sub: 'paid out' },
    { label: 'Settled spend', value: formatCurrency((stats?.approvedAmount ?? 0) + (stats?.reimbursedAmount ?? 0)), sub: 'approved + reimbursed' },
  ];

  const categories = stats?.byCategory ?? [];
  const totalSpend = categories.reduce((sum, c) => sum + c.amount, 0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <p className="text-xs text-muted-fg">{t.label}</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{t.value}</p>
            <p className="text-xs text-muted-fg">{t.sub}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settled spend by category</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <EmptyState icon={PieChart} title="No settled expenses yet" description="Approved and reimbursed expenses appear here." className="border-0" />
          ) : (
            <div className="space-y-3">
              {categories.map((c, i) => {
                const pct = totalSpend > 0 ? Math.round((c.amount / totalSpend) * 100) : 0;
                return (
                  <div key={c.category}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-foreground">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                        {c.category}
                      </span>
                      <span className="text-muted-fg">{formatCurrency(c.amount)} · {pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
