import { useMemo, useState } from 'react';
import { ArrowRight, MoreHorizontal, Pencil, Plus, RotateCcw, Search, Trash2, UserPlus } from 'lucide-react';
import {
  ASSET_CATEGORIES,
  ASSET_STATUS_LABELS,
  ASSET_STATUS_TRANSITIONS,
  ASSET_STATUSES,
  type AssetDto,
  type AssetStatus,
  AssetStatus as Status,
} from '@coresphere/shared';
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
import { ApiClientError } from '@/lib/apiClient';
import { AssetStatusBadge } from './badges';
import { AssetFormModal } from './AssetFormModal';
import { AssignAssetModal } from './AssignAssetModal';
import { useAssetAction, useAssetStats, useAssets, useDeleteAsset } from './inventoryHooks';

const PAGE_SIZE = 10;
const opt = (arr: readonly string[], allLabel: string) => [{ value: '', label: allLabel }, ...arr.map((v) => ({ value: v, label: v }))];
const statusFilterOptions = [{ value: '', label: 'All statuses' }, ...ASSET_STATUSES.map((s) => ({ value: s, label: ASSET_STATUS_LABELS[s] }))];

export function AssetsPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AssetDto | undefined>();
  const [assigning, setAssigning] = useState<AssetDto | null>(null);
  const [deleting, setDeleting] = useState<AssetDto | undefined>();
  const search = useDebouncedValue(searchInput);

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, search: search || undefined, category: category || undefined, status: status || undefined }),
    [page, search, category, status],
  );

  const { data, isLoading } = useAssets(params);
  const { data: stats } = useAssetStats();
  const action = useAssetAction();
  const deleteAsset = useDeleteAsset();
  const resetPage = () => setPage(1);
  const items = data?.items ?? [];

  const run = async (promise: Promise<unknown>, success: string) => {
    try {
      await promise;
      toast({ title: success, tone: 'success' });
    } catch (error) {
      toast({ title: 'Action failed', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    await run(deleteAsset.mutateAsync(deleting.id), 'Asset removed');
    setDeleting(undefined);
  };

  const tiles = [
    { label: 'Total assets', value: stats?.total ?? 0 },
    { label: 'Available', value: stats?.available ?? 0 },
    { label: 'Assigned', value: stats?.assigned ?? 0 },
    { label: 'Maintenance', value: stats?.maintenance ?? 0 },
  ];

  return (
    <div>
      <PageHeader
        title="Asset Management"
        description="Track company assets and their assignments."
        actions={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />New asset</Button>}
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
              placeholder="Search assets…"
              className="h-10 w-full rounded-lg border border-input bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Select options={opt(ASSET_CATEGORIES, 'All categories')} value={category} onChange={(e) => { setCategory(e.target.value); resetPage(); }} className="sm:w-44" />
          <Select options={statusFilterOptions} value={status} onChange={(e) => { setStatus(e.target.value); resetPage(); }} className="sm:w-40" />
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={Search} title="No assets found" description="Add your first company asset." className="m-4 border-0" />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>Asset</TH>
                  <TH>Category</TH>
                  <TH>Serial</TH>
                  <TH>Status</TH>
                  <TH>Assigned to</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((asset) => {
                  const transitions = ASSET_STATUS_TRANSITIONS[asset.status];
                  return (
                    <TR key={asset.id}>
                      <TD>
                        <p className="font-medium text-foreground">{asset.name}</p>
                        <p className="text-xs text-muted-fg">{asset.code}</p>
                      </TD>
                      <TD className="text-muted-fg">{asset.category}</TD>
                      <TD className="text-muted-fg">{asset.serialNumber ?? '—'}</TD>
                      <TD><AssetStatusBadge status={asset.status} /></TD>
                      <TD className="text-muted-fg">{asset.assignedToName ?? '—'}</TD>
                      <TD className="text-right">
                        <DropdownMenu
                          trigger={<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-fg hover:bg-surface-muted hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></span>}
                        >
                          {asset.status === Status.Available && (
                            <DropdownItem icon={UserPlus} onSelect={() => setAssigning(asset)}>Assign</DropdownItem>
                          )}
                          {asset.status === Status.Assigned && (
                            <DropdownItem icon={RotateCcw} onSelect={() => run(action.mutateAsync({ action: 'return', id: asset.id }), 'Asset returned')}>Return</DropdownItem>
                          )}
                          <DropdownItem icon={Pencil} onSelect={() => setEditing(asset)}>Edit</DropdownItem>
                          {transitions.length > 0 && <DropdownSeparator />}
                          {transitions.map((target: AssetStatus) => (
                            <DropdownItem key={target} icon={ArrowRight} onSelect={() => run(action.mutateAsync({ action: 'status', id: asset.id, status: target }), `Marked ${ASSET_STATUS_LABELS[target].toLowerCase()}`)}>
                              Mark {ASSET_STATUS_LABELS[target]}
                            </DropdownItem>
                          ))}
                          <DropdownSeparator />
                          <DropdownItem icon={Trash2} danger onSelect={() => setDeleting(asset)}>Remove</DropdownItem>
                        </DropdownMenu>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
            {data && <Pagination meta={data.meta} onPageChange={setPage} />}
          </>
        )}
      </Card>

      <AssetFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <AssetFormModal open={Boolean(editing)} asset={editing} onClose={() => setEditing(undefined)} />
      <AssignAssetModal asset={assigning} onClose={() => setAssigning(null)} />

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        size="sm"
        title="Remove asset"
        description={`This removes ${deleting?.name ?? ''} (${deleting?.code ?? ''}).`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(undefined)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} isLoading={deleteAsset.isPending}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-muted-fg">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
