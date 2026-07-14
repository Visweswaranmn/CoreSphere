import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MoreHorizontal, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { INVENTORY_CATEGORIES, type InventoryItemDto, WAREHOUSES } from '@coresphere/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { DropdownItem, DropdownMenu, DropdownSeparator } from '@/components/ui/DropdownMenu';
import { useToast } from '@/hooks/useToast';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatCurrency, formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';
import { ApiClientError } from '@/lib/apiClient';
import { StockBadge } from './badges';
import { ItemFormModal } from './ItemFormModal';
import { useDeleteItem, useItemStats, useItems } from './inventoryHooks';

const PAGE_SIZE = 10;
const opt = (arr: readonly string[], allLabel: string) => [{ value: '', label: allLabel }, ...arr.map((v) => ({ value: v, label: v }))];

export function InventoryItemsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItemDto | undefined>();
  const [deleting, setDeleting] = useState<InventoryItemDto | undefined>();
  const search = useDebouncedValue(searchInput);

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, search: search || undefined, category: category || undefined, warehouse: warehouse || undefined, lowStock: lowOnly ? 'true' : undefined }),
    [page, search, category, warehouse, lowOnly],
  );

  const { data, isLoading } = useItems(params);
  const { data: stats } = useItemStats();
  const deleteItem = useDeleteItem();
  const resetPage = () => setPage(1);
  const items = data?.items ?? [];

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteItem.mutateAsync(deleting.id);
      toast({ title: 'Item removed', tone: 'success' });
      setDeleting(undefined);
    } catch (error) {
      toast({ title: 'Could not remove item', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  };

  const tiles = [
    { label: 'Total items', value: formatNumber(stats?.totalItems ?? 0) },
    { label: 'Stock value', value: formatCurrency(stats?.totalStockValue ?? 0) },
    { label: 'Low stock', value: formatNumber(stats?.lowStock ?? 0) },
    { label: 'Out of stock', value: formatNumber(stats?.outOfStock ?? 0) },
  ];

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Track stock levels, movements, and warehouses."
        actions={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />New item</Button>}
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
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
            <input
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); resetPage(); }}
              placeholder="Search items…"
              className="h-10 w-full rounded-lg border border-input bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Select options={opt(INVENTORY_CATEGORIES, 'All categories')} value={category} onChange={(e) => { setCategory(e.target.value); resetPage(); }} className="lg:w-44" />
          <Select options={opt(WAREHOUSES, 'All warehouses')} value={warehouse} onChange={(e) => { setWarehouse(e.target.value); resetPage(); }} className="lg:w-44" />
          <button
            type="button"
            onClick={() => { setLowOnly((v) => !v); resetPage(); }}
            className={cn('h-10 shrink-0 rounded-lg border px-3 text-sm font-medium transition-colors', lowOnly ? 'border-warning bg-warning/10 text-warning' : 'border-input text-muted-fg hover:text-foreground')}
          >
            Low stock only
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={Package} title="No items found" description="Add your first inventory item." className="m-4 border-0" />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>Item</TH>
                  <TH>Category</TH>
                  <TH>Warehouse</TH>
                  <TH>Quantity</TH>
                  <TH>Status</TH>
                  <TH>Value</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((item) => (
                  <TR key={item.id}>
                    <TD>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-fg">{item.code}</p>
                    </TD>
                    <TD className="text-muted-fg">{item.category}</TD>
                    <TD className="text-muted-fg">{item.warehouse}</TD>
                    <TD className="text-foreground">{item.quantity} {item.unit}</TD>
                    <TD><StockBadge item={item} /></TD>
                    <TD className="text-muted-fg">{formatCurrency(item.stockValue)}</TD>
                    <TD className="text-right">
                      <DropdownMenu
                        trigger={<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-fg hover:bg-surface-muted hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></span>}
                      >
                        <DropdownItem icon={Eye} onSelect={() => navigate(`/inventory/items/${item.id}`)}>View & movements</DropdownItem>
                        <DropdownItem icon={Pencil} onSelect={() => setEditing(item)}>Edit</DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem icon={Trash2} danger onSelect={() => setDeleting(item)}>Remove</DropdownItem>
                      </DropdownMenu>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            {data && <Pagination meta={data.meta} onPageChange={setPage} />}
          </>
        )}
      </Card>

      <ItemFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <ItemFormModal open={Boolean(editing)} item={editing} onClose={() => setEditing(undefined)} />

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        size="sm"
        title="Remove item"
        description={`This removes ${deleting?.name ?? ''} and its movement history.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(undefined)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} isLoading={deleteItem.isPending}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-muted-fg">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
