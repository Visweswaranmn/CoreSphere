import { useMemo, useState } from 'react';
import { Ban, Check, MoreHorizontal, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import {
  type VendorDto,
  type VendorStatus,
  VENDOR_CATEGORIES,
  VENDOR_STATUS_LABELS,
  VENDOR_STATUS_TRANSITIONS,
  VENDOR_STATUSES,
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
import { VendorStatusBadge } from './badges';
import { VendorFormModal } from './VendorFormModal';
import { useChangeVendorStatus, useDeleteVendor, useVendorStats, useVendors } from './procurementHooks';

const PAGE_SIZE = 10;
const statusVerb: Record<VendorStatus, string> = {
  approved: 'Approve',
  rejected: 'Reject',
  suspended: 'Suspend',
  pending: 'Reset to pending',
};
const statusIcon: Record<VendorStatus, typeof Check> = {
  approved: Check,
  rejected: X,
  suspended: Ban,
  pending: Check,
};

const statusFilterOptions = [
  { value: '', label: 'All statuses' },
  ...VENDOR_STATUSES.map((s) => ({ value: s, label: VENDOR_STATUS_LABELS[s] })),
];
const categoryFilterOptions = [
  { value: '', label: 'All categories' },
  ...VENDOR_CATEGORIES.map((c) => ({ value: c, label: c })),
];

export function VendorsPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<VendorDto | undefined>();
  const [deleting, setDeleting] = useState<VendorDto | undefined>();
  const search = useDebouncedValue(searchInput);

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, search: search || undefined, status: status || undefined, category: category || undefined }),
    [page, search, status, category],
  );

  const { data, isLoading } = useVendors(params);
  const { data: stats } = useVendorStats();
  const changeStatus = useChangeVendorStatus();
  const deleteVendor = useDeleteVendor();
  const resetPage = () => setPage(1);
  const items = data?.items ?? [];

  const onStatus = async (id: string, next: VendorStatus) => {
    try {
      await changeStatus.mutateAsync({ id, status: next });
      toast({ title: `Vendor ${VENDOR_STATUS_LABELS[next].toLowerCase()}`, tone: 'success' });
    } catch (error) {
      toast({ title: 'Action failed', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteVendor.mutateAsync(deleting.id);
      toast({ title: 'Vendor removed', tone: 'success' });
      setDeleting(undefined);
    } catch (error) {
      toast({ title: 'Could not remove vendor', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  };

  const tiles = [
    { label: 'Total', value: stats?.total ?? 0 },
    { label: 'Approved', value: stats?.approved ?? 0 },
    { label: 'Pending', value: stats?.pending ?? 0 },
    { label: 'Suspended', value: stats?.suspended ?? 0 },
  ];

  return (
    <div>
      <PageHeader
        title="Vendors"
        description="Manage your supplier directory and approvals."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New vendor
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
              placeholder="Search vendors…"
              className="h-10 w-full rounded-lg border border-input bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Select options={statusFilterOptions} value={status} onChange={(e) => { setStatus(e.target.value); resetPage(); }} className="sm:w-40" />
          <Select options={categoryFilterOptions} value={category} onChange={(e) => { setCategory(e.target.value); resetPage(); }} className="sm:w-48" />
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Search} title="No vendors found" description="Add your first vendor to get started." className="m-4 border-0" />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>Vendor</TH>
                  <TH>Category</TH>
                  <TH>Contact</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((vendor) => {
                  const transitions = VENDOR_STATUS_TRANSITIONS[vendor.status];
                  return (
                    <TR key={vendor.id}>
                      <TD>
                        <p className="font-medium text-foreground">{vendor.name}</p>
                        <p className="text-xs text-muted-fg">{vendor.code}</p>
                      </TD>
                      <TD className="text-muted-fg">{vendor.category}</TD>
                      <TD>
                        <p className="text-sm text-foreground">{vendor.contactName ?? '—'}</p>
                        <p className="text-xs text-muted-fg">{vendor.email}</p>
                      </TD>
                      <TD><VendorStatusBadge status={vendor.status} /></TD>
                      <TD className="text-right">
                        <DropdownMenu
                          trigger={
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-fg hover:bg-surface-muted hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </span>
                          }
                        >
                          <DropdownItem icon={Pencil} onSelect={() => setEditing(vendor)}>Edit</DropdownItem>
                          {transitions.length > 0 && <DropdownSeparator />}
                          {transitions.map((target) => {
                            const Icon = statusIcon[target];
                            return (
                              <DropdownItem key={target} icon={Icon} onSelect={() => onStatus(vendor.id, target)}>
                                {statusVerb[target]}
                              </DropdownItem>
                            );
                          })}
                          <DropdownSeparator />
                          <DropdownItem icon={Trash2} danger onSelect={() => setDeleting(vendor)}>Remove</DropdownItem>
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

      <VendorFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <VendorFormModal open={Boolean(editing)} vendor={editing} onClose={() => setEditing(undefined)} />

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        size="sm"
        title="Remove vendor"
        description={`This permanently removes ${deleting?.name ?? ''} (${deleting?.code ?? ''}).`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(undefined)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} isLoading={deleteVendor.isPending}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-muted-fg">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
