import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Receipt, Search } from 'lucide-react';
import { EXPENSE_CATEGORIES, EXPENSE_STATUS_LABELS, EXPENSE_STATUSES } from '@coresphere/shared';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatCurrency, formatDate } from '@/lib/format';
import { ExpenseStatusBadge } from './ExpenseStatusBadge';
import { ExpenseFormModal } from './ExpenseFormModal';
import { useExpenses } from './financeHooks';

const PAGE_SIZE = 10;
const opt = (arr: readonly string[], allLabel: string) => [{ value: '', label: allLabel }, ...arr.map((v) => ({ value: v, label: v }))];
const statusFilterOptions = [{ value: '', label: 'All statuses' }, ...EXPENSE_STATUSES.map((s) => ({ value: s, label: EXPENSE_STATUS_LABELS[s] }))];

export function ExpensesPanel() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const search = useDebouncedValue(searchInput);

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, search: search || undefined, status: status || undefined, category: category || undefined }),
    [page, search, status, category],
  );

  const { data, isLoading } = useExpenses(params);
  const resetPage = () => setPage(1);
  const items = data?.items ?? [];

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
          <input
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); resetPage(); }}
            placeholder="Search expenses…"
            className="h-10 w-full rounded-lg border border-input bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Select options={statusFilterOptions} value={status} onChange={(e) => { setStatus(e.target.value); resetPage(); }} className="lg:w-40" />
        <Select options={opt(EXPENSE_CATEGORIES, 'All categories')} value={category} onChange={(e) => { setCategory(e.target.value); resetPage(); }} className="lg:w-48" />
        <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />New expense</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={Receipt} title="No expenses" description="Create your first expense claim." className="m-4 border-0" />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Expense</TH>
                <TH>Category</TH>
                <TH>Claimant</TH>
                <TH>Date</TH>
                <TH>Amount</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {items.map((expense) => (
                <TR key={expense.id} className="cursor-pointer" onClick={() => navigate(`/finance/expenses/${expense.id}`)}>
                  <TD>
                    <p className="font-medium text-foreground">{expense.title}</p>
                    <p className="text-xs text-muted-fg">{expense.code}</p>
                  </TD>
                  <TD className="text-muted-fg">{expense.category}</TD>
                  <TD className="text-muted-fg">{expense.employeeName}</TD>
                  <TD className="text-muted-fg">{formatDate(expense.date)}</TD>
                  <TD className="font-medium text-foreground">{formatCurrency(expense.amount)}</TD>
                  <TD><ExpenseStatusBadge status={expense.status} /></TD>
                </TR>
              ))}
            </TBody>
          </Table>
          {data && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}

      <ExpenseFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </Card>
  );
}
