import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/features/auth/useAuth';
import { StatCard, StatCardSkeleton } from '@/features/dashboard/StatCard';
import { RevenueExpenseChart } from '@/features/dashboard/RevenueExpenseChart';
import { CategoryChart } from '@/features/dashboard/CategoryChart';
import { ActivityFeed } from '@/features/dashboard/ActivityFeed';
import { useDashboardData } from '@/features/dashboard/sampleData';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboardData();

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user?.firstName ?? ''}`}
        description="Here's what's happening across your organization today."
        actions={<Badge tone="info">Sample data</Badge>}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {isLoading || !data
          ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
          : data.kpis.map((kpi) => <StatCard key={kpi.key} kpi={kpi} />)}
      </div>

      {/* Charts row */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            action={
              <div className="flex items-center gap-4 text-xs text-muted-fg">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Revenue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-warning" /> Expenses
                </span>
              </div>
            }
          >
            <CardTitle>Revenue vs. Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-[280px] w-full" />
            ) : (
              <RevenueExpenseChart data={data.revenue} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spend by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <CategoryChart data={data.categories} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity row */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
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
            ) : (
              <ActivityFeed entries={data.activity} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
