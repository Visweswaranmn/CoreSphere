import { useState } from 'react';
import { MoreHorizontal, Pencil, PieChart, Plus, Trash2 } from 'lucide-react';
import type { BudgetDto } from '@coresphere/shared';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { DropdownItem, DropdownMenu, DropdownSeparator } from '@/components/ui/DropdownMenu';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/cn';
import { ApiClientError } from '@/lib/apiClient';
import { BudgetFormModal } from './BudgetFormModal';
import { useBudgets, useDeleteBudget } from './financeHooks';

const PAGE_SIZE = 9;

function utilizationColor(utilization: number): string {
  if (utilization >= 100) return 'bg-danger';
  if (utilization >= 80) return 'bg-warning';
  return 'bg-primary';
}

function BudgetCard({ budget, onEdit, onDelete }: { budget: BudgetDto; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-foreground">{budget.name}</p>
          <p className="text-xs text-muted-fg">{budget.category} · {budget.periodLabel}</p>
        </div>
        <DropdownMenu
          trigger={<span className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-fg hover:bg-surface-muted hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></span>}
        >
          <DropdownItem icon={Pencil} onSelect={onEdit}>Edit</DropdownItem>
          <DropdownSeparator />
          <DropdownItem icon={Trash2} danger onSelect={onDelete}>Remove</DropdownItem>
        </DropdownMenu>
      </div>

      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-muted-fg">{formatCurrency(budget.spent)} spent</span>
        <span className={cn('font-medium', budget.utilization >= 100 ? 'text-danger' : 'text-foreground')}>
          {budget.utilization}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <div className={cn('h-full rounded-full', utilizationColor(budget.utilization))} style={{ width: `${Math.min(budget.utilization, 100)}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-fg">
        <span>Budget {formatCurrency(budget.amount)}</span>
        <span className={budget.remaining < 0 ? 'text-danger' : ''}>{formatCurrency(budget.remaining)} left</span>
      </div>
    </Card>
  );
}

export function BudgetsPanel() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetDto | undefined>();
  const [deleting, setDeleting] = useState<BudgetDto | undefined>();

  const { data, isLoading } = useBudgets({ page, pageSize: PAGE_SIZE });
  const deleteBudget = useDeleteBudget();
  const items = data?.items ?? [];

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteBudget.mutateAsync(deleting.id);
      toast({ title: 'Budget removed', tone: 'success' });
      setDeleting(undefined);
    } catch (error) {
      toast({ title: 'Could not remove budget', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />New budget</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={PieChart} title="No budgets" description="Create a budget to track spending against a category." action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />New budget</Button>} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} onEdit={() => setEditing(budget)} onDelete={() => setDeleting(budget)} />
            ))}
          </div>
          {data && data.meta.totalPages > 1 && (
            <div className="mt-4 rounded-xl border border-border bg-surface">
              <Pagination meta={data.meta} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <BudgetFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <BudgetFormModal open={Boolean(editing)} budget={editing} onClose={() => setEditing(undefined)} />

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        size="sm"
        title="Remove budget"
        description={`This removes the ${deleting?.name ?? ''} budget.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(undefined)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} isLoading={deleteBudget.isPending}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-muted-fg">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
