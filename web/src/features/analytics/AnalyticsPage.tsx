import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { RevenueExpenseChart } from '@/features/dashboard/RevenueExpenseChart';
import { BreakdownCard } from './BreakdownCard';
import { useOverview } from './analyticsHooks';

export function AnalyticsPage() {
  const { data, isLoading } = useOverview();

  return (
    <div>
      <PageHeader title="Analytics" description="Cross-module insights and trends." />

      <Card className="mb-6">
        <CardHeader
          action={
            <div className="flex items-center gap-4 text-xs text-muted-fg">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" /> Expenses</span>
            </div>
          }
        >
          <CardTitle>Revenue vs. Expenses (last 6 months)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !data ? <Skeleton className="h-[280px] w-full" /> : <RevenueExpenseChart data={data.revenueExpense} />}
        </CardContent>
      </Card>

      {isLoading || !data ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BreakdownCard title="Deals by Stage" data={data.dealsByStage} />
          <BreakdownCard title="Employees by Department" data={data.employeesByDepartment} />
          <BreakdownCard title="Projects by Status" data={data.projectsByStatus} />
          <BreakdownCard title="Inventory Value by Category" data={data.inventoryByCategory} format="currency" />
          <BreakdownCard title="Settled Expenses by Category" data={data.expenseByCategory} format="currency" />
        </div>
      )}
    </div>
  );
}
