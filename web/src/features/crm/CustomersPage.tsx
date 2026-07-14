import { useMemo, useState } from 'react';
import { Contact, MoreHorizontal, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import {
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_STATUSES,
  type CustomerDto,
  INDUSTRIES,
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
import { CustomerStatusBadge } from './CustomerStatusBadge';
import { CustomerFormModal } from './CustomerFormModal';
import { useCustomerStats, useCustomers, useDeleteCustomer } from './crmHooks';

const PAGE_SIZE = 10;
const opt = (arr: readonly string[], allLabel: string) => [{ value: '', label: allLabel }, ...arr.map((v) => ({ value: v, label: v }))];
const statusFilterOptions = [{ value: '', label: 'All statuses' }, ...CUSTOMER_STATUSES.map((s) => ({ value: s, label: CUSTOMER_STATUS_LABELS[s] }))];

export function CustomersPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [industry, setIndustry] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerDto | undefined>();
  const [deleting, setDeleting] = useState<CustomerDto | undefined>();
  const search = useDebouncedValue(searchInput);

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, search: search || undefined, status: status || undefined, industry: industry || undefined }),
    [page, search, status, industry],
  );

  const { data, isLoading } = useCustomers(params);
  const { data: stats } = useCustomerStats();
  const deleteCustomer = useDeleteCustomer();
  const resetPage = () => setPage(1);
  const items = data?.items ?? [];

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteCustomer.mutateAsync(deleting.id);
      toast({ title: 'Customer removed', tone: 'success' });
      setDeleting(undefined);
    } catch (error) {
      toast({ title: 'Could not remove customer', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  };

  const tiles = [
    { label: 'Total customers', value: stats?.total ?? 0 },
    { label: 'Active', value: stats?.active ?? 0 },
    { label: 'Prospects', value: stats?.prospect ?? 0 },
  ];

  return (
    <div>
      <PageHeader
        title="CRM"
        description="Manage customer accounts and relationships."
        actions={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />New customer</Button>}
      />

      <div className="mb-6 grid grid-cols-3 gap-4">
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
              placeholder="Search customers…"
              className="h-10 w-full rounded-lg border border-input bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Select options={statusFilterOptions} value={status} onChange={(e) => { setStatus(e.target.value); resetPage(); }} className="sm:w-40" />
          <Select options={opt(INDUSTRIES, 'All industries')} value={industry} onChange={(e) => { setIndustry(e.target.value); resetPage(); }} className="sm:w-44" />
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={Contact} title="No customers found" description="Add your first customer account." className="m-4 border-0" />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>Customer</TH>
                  <TH>Industry</TH>
                  <TH>Contact</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((customer) => (
                  <TR key={customer.id}>
                    <TD>
                      <p className="font-medium text-foreground">{customer.name}</p>
                      <p className="text-xs text-muted-fg">{customer.code}</p>
                    </TD>
                    <TD className="text-muted-fg">{customer.industry}</TD>
                    <TD>
                      <p className="text-sm text-foreground">{customer.contactName ?? '—'}</p>
                      <p className="text-xs text-muted-fg">{customer.email}</p>
                    </TD>
                    <TD><CustomerStatusBadge status={customer.status} /></TD>
                    <TD className="text-right">
                      <DropdownMenu
                        trigger={<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-fg hover:bg-surface-muted hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></span>}
                      >
                        <DropdownItem icon={Pencil} onSelect={() => setEditing(customer)}>Edit</DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem icon={Trash2} danger onSelect={() => setDeleting(customer)}>Remove</DropdownItem>
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

      <CustomerFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <CustomerFormModal open={Boolean(editing)} customer={editing} onClose={() => setEditing(undefined)} />

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        size="sm"
        title="Remove customer"
        description={`This removes ${deleting?.name ?? ''} and all associated deals.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(undefined)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} isLoading={deleteCustomer.isPending}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-muted-fg">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
