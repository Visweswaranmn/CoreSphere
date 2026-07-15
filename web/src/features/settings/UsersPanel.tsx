import { useMemo, useState } from 'react';
import { Pencil, Plus, Search } from 'lucide-react';
import { type AuthUser, ROLE_LABELS, type Role } from '@coresphere/shared';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatDate } from '@/lib/format';
import { UserFormModal } from './UserFormModal';
import { useUsers } from './settingsHooks';

const PAGE_SIZE = 10;

export function UsersPanel() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AuthUser | undefined>();
  const search = useDebouncedValue(searchInput);

  const params = useMemo(() => ({ page, pageSize: PAGE_SIZE, search: search || undefined }), [page, search]);
  const { data, isLoading } = useUsers(params);
  const items = data?.items ?? [];

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
          <input
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
            placeholder="Search users…"
            className="h-10 w-full rounded-lg border border-input bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />New user</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={Search} title="No users found" description="Invite your first teammate." className="m-4 border-0" />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>User</TH>
                <TH>Role</TH>
                <TH>Status</TH>
                <TH>Joined</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {items.map((user) => (
                <TR key={user.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <Avatar name={user.fullName} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{user.fullName}</p>
                        <p className="truncate text-xs text-muted-fg">{user.email}</p>
                      </div>
                    </div>
                  </TD>
                  <TD className="text-muted-fg">{ROLE_LABELS[user.role as Role]}</TD>
                  <TD>
                    <Badge tone={user.status === 'active' ? 'success' : user.status === 'disabled' ? 'danger' : 'warning'} dot>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                  </TD>
                  <TD className="text-muted-fg">{formatDate(user.createdAt)}</TD>
                  <TD className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(user)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          {data && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}

      <UserFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <UserFormModal open={Boolean(editing)} user={editing} onClose={() => setEditing(undefined)} />
    </Card>
  );
}
