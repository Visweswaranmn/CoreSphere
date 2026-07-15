import {
  Boxes,
  Briefcase,
  DollarSign,
  type LucideIcon,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import type { DashboardKpis } from '@coresphere/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatCurrency, formatNumber } from '@/lib/format';
import { useAuth } from '@/features/auth/useAuth';
import { RevenueExpenseChart } from '@/features/dashboard/RevenueExpenseChart';
import { CategoryChart } from '@/features/dashboard/CategoryChart';
import { ActivityFeed } from '@/features/dashboard/ActivityFeed';
import { useOverview } from '@/features/analytics/analyticsHooks';

const CATEGORY_COLORS = ['#78a4cb', '#e0a02e', '#95bdd7', '#5e8cb8', '#22c55e', '#8b5cf6', '#14b8a6', '#ef4444'];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

interface KpiTile {
  key: keyof DashboardKpis;
  label: string;
  icon: LucideIcon;
  format: 'currency' | 'number';
}

const kpiTiles: KpiTile[] = [
  { key: 'revenue', label: 'Revenue (won deals)', icon: DollarSign, format: 'currency' },
  { key: 'profit', label: 'Net Profit', icon: TrendingUp, format: 'currency' },
  { key: 'expenses', label: 'Expenses', icon: Wallet, format: 'currency' },
  { key: 'employees', label: 'Active Employees', icon: Users, format: 'number' },
  { key: 'activeProjects', label: 'Active Projects', icon: Briefcase, format: 'number' },
  { key: 'inventoryValue', label: 'Inventory Value', icon: Boxes, format: 'currency' },
];

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useOverview();

  const categorySlices = (data?.expenseByCategory ?? []).map((c, i) => ({
    name: c.name,
    value: c.value,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]!,
  }));

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user?.firstName ?? ''}`}
        description="A live view of what's happening across your organization."
        actions={<Badge tone="success">Live data</Badge>}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {isLoading || !data
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
          : kpiTiles.map((tile) => (
              <Card key={tile.key} className="p-5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <tile.icon className="h-[18px] w-[18px]" />
                </span>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                  {tile.format === 'currency'
                    ? formatCurrency(data.kpis[tile.key])
                    : formatNumber(data.kpis[tile.key])}
                </p>
                <p className="mt-1 text-sm text-muted-fg">{tile.label}</p>
              </Card>
            ))}
      </div>

      {/* Charts row */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            action={
              <div className="flex items-center gap-4 text-xs text-muted-fg">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Revenue</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" /> Expenses</span>
              </div>
            }
          >
            <CardTitle>Revenue vs. Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? <Skeleton className="h-[280px] w-full" /> : <RevenueExpenseChart data={data.revenueExpense} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Spend by Category</CardTitle></CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-40 w-full" />
            ) : categorySlices.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-fg">No settled expenses yet.</p>
            ) : (
              <CategoryChart data={categorySlices} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity row */}
      <div className="mt-6">
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                ))}
              </div>
            ) : data.recentActivity.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-fg">No recent activity.</p>
            ) : (
              <ActivityFeed entries={data.recentActivity} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
