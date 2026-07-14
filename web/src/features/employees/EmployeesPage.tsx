import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  type EmployeeDto,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYEE_STATUSES,
  EMPLOYMENT_TYPE_LABELS,
  DEPARTMENTS,
} from '@coresphere/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { DropdownItem, DropdownMenu } from '@/components/ui/DropdownMenu';
import { useToast } from '@/hooks/useToast';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatDate } from '@/lib/format';
import { ApiClientError } from '@/lib/apiClient';
import { EmployeeStatusBadge } from './EmployeeStatusBadge';
import { EmployeeFormModal } from './EmployeeFormModal';
import { useDeleteEmployee, useEmployees, useEmployeeStats } from './employeeHooks';

const PAGE_SIZE = 10;

function StatTile({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xl font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted-fg">{label}</p>
      </div>
    </Card>
  );
}

const departmentFilterOptions = [
  { value: '', label: 'All departments' },
  ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
];
const statusFilterOptions = [
  { value: '', label: 'All statuses' },
  ...EMPLOYEE_STATUSES.map((s) => ({ value: s, label: EMPLOYEE_STATUS_LABELS[s] })),
];

export function EmployeesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const search = useDebouncedValue(searchInput);

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeDto | undefined>();
  const [deleting, setDeleting] = useState<EmployeeDto | undefined>();

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      department: department || undefined,
      status: status || undefined,
    }),
    [page, search, department, status],
  );

  const { data, isLoading, isError } = useEmployees(params);
  const { data: stats } = useEmployeeStats();
  const deleteMutation = useDeleteEmployee();

  const resetToFirstPage = () => setPage(1);

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync(deleting.id);
      toast({ title: 'Employee removed', tone: 'success' });
      setDeleting(undefined);
    } catch (error) {
      toast({
        title: 'Could not remove employee',
        description: error instanceof ApiClientError ? error.message : 'Please try again.',
        tone: 'error',
      });
    }
  };

  const items = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage your organization's workforce and onboarding."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add employee
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Users} label="Total employees" value={stats?.total ?? 0} />
        <StatTile icon={UserCheck} label="Active" value={stats?.active ?? 0} />
        <StatTile icon={UserPlus} label="Onboarding" value={stats?.onboarding ?? 0} />
        <StatTile icon={CalendarClock} label="On leave" value={stats?.onLeave ?? 0} />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
            <input
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                resetToFirstPage();
              }}
              placeholder="Search by name, email, or code…"
              className="h-10 w-full rounded-lg border border-input bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex gap-3">
            <Select
              options={departmentFilterOptions}
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                resetToFirstPage();
              }}
              className="w-44"
            />
            <Select
              options={statusFilterOptions}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                resetToFirstPage();
              }}
              className="w-40"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-6 text-sm text-danger">Failed to load employees. Please retry.</div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No employees found"
            description="Adjust your filters or add your first employee."
            className="m-4 border-0"
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Add employee
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>Employee</TH>
                  <TH>Department</TH>
                  <TH>Job title</TH>
                  <TH>Type</TH>
                  <TH>Status</TH>
                  <TH>Joined</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((employee) => (
                  <TR key={employee.id}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <Avatar name={employee.fullName} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{employee.fullName}</p>
                          <p className="truncate text-xs text-muted-fg">{employee.employeeCode}</p>
                        </div>
                      </div>
                    </TD>
                    <TD className="text-muted-fg">{employee.department}</TD>
                    <TD className="text-muted-fg">{employee.jobTitle}</TD>
                    <TD className="text-muted-fg">
                      {EMPLOYMENT_TYPE_LABELS[employee.employmentType]}
                    </TD>
                    <TD>
                      <EmployeeStatusBadge status={employee.status} />
                    </TD>
                    <TD className="text-muted-fg">{formatDate(employee.dateOfJoining)}</TD>
                    <TD className="text-right">
                      <DropdownMenu
                        trigger={
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-fg hover:bg-surface-muted hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </span>
                        }
                      >
                        <DropdownItem
                          icon={Eye}
                          onSelect={() => navigate(`/hr/employees/${employee.id}`)}
                        >
                          View profile
                        </DropdownItem>
                        <DropdownItem icon={Pencil} onSelect={() => setEditing(employee)}>
                          Edit
                        </DropdownItem>
                        <DropdownItem icon={Trash2} danger onSelect={() => setDeleting(employee)}>
                          Remove
                        </DropdownItem>
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

      <EmployeeFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EmployeeFormModal
        open={Boolean(editing)}
        employee={editing}
        onClose={() => setEditing(undefined)}
      />

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        size="sm"
        title="Remove employee"
        description={`This permanently removes ${deleting?.fullName ?? ''} (${deleting?.employeeCode ?? ''}).`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(undefined)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} isLoading={deleteMutation.isPending}>
              Remove
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-fg">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
