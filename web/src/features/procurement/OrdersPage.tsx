import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ShoppingCart } from 'lucide-react';
import { PURCHASE_ORDER_STATUS_LABELS, PURCHASE_ORDER_STATUSES } from '@coresphere/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatCurrency } from '@/lib/format';
import { PurchaseOrderStatusBadge } from './badges';
import { OrderFormModal } from './OrderFormModal';
import { useOrderStats, useOrders } from './procurementHooks';

const PAGE_SIZE = 10;
const statusFilterOptions = [
  { value: '', label: 'All statuses' },
  ...PURCHASE_ORDER_STATUSES.map((s) => ({ value: s, label: PURCHASE_ORDER_STATUS_LABELS[s] })),
];

export function OrdersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const search = useDebouncedValue(searchInput);

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, search: search || undefined, status: status || undefined }),
    [page, search, status],
  );

  const { data, isLoading } = useOrders(params);
  const { data: stats } = useOrderStats();
  const resetPage = () => setPage(1);
  const items = data?.items ?? [];

  const tiles = [
    { label: 'Total orders', value: String(stats?.total ?? 0) },
    { label: 'Submitted', value: String(stats?.submitted ?? 0) },
    { label: 'Approved', value: String(stats?.approved ?? 0) },
    { label: 'Committed value', value: formatCurrency(stats?.totalValue ?? 0) },
  ];

  return (
    <div>
      <PageHeader
        title="Procurement"
        description="Raise purchase orders and manage the approval workflow."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New order
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <p className="text-xs text-muted-fg">{t.label}</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{t.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
            <input
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); resetPage(); }}
              placeholder="Search by code or title…"
              className="h-10 w-full rounded-lg border border-input bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Select options={statusFilterOptions} value={status} onChange={(e) => { setStatus(e.target.value); resetPage(); }} className="sm:w-44" />
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No purchase orders"
            description="Create your first order to begin the approval workflow."
            className="m-4 border-0"
            action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />New order</Button>}
          />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>Order</TH>
                  <TH>Vendor</TH>
                  <TH>Status</TH>
                  <TH>Items</TH>
                  <TH>Total</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((order) => (
                  <TR key={order.id} className="cursor-pointer" onClick={() => navigate(`/procurement/orders/${order.id}`)}>
                    <TD>
                      <p className="font-medium text-foreground">{order.title}</p>
                      <p className="text-xs text-muted-fg">{order.code}</p>
                    </TD>
                    <TD className="text-muted-fg">{order.vendorName}</TD>
                    <TD><PurchaseOrderStatusBadge status={order.status} /></TD>
                    <TD className="text-muted-fg">{order.items.length}</TD>
                    <TD className="font-medium text-foreground">{formatCurrency(order.total)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            {data && <Pagination meta={data.meta} onPageChange={setPage} />}
          </>
        )}
      </Card>

      <OrderFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
