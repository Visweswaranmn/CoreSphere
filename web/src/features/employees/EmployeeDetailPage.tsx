import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarDays, Mail, MapPin, Pencil, Phone, UserCog } from 'lucide-react';
import {
  EMPLOYEE_STATUS_TRANSITIONS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  type EmployeeStatus,
} from '@coresphere/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/format';
import { ApiClientError } from '@/lib/apiClient';
import { EmployeeStatusBadge } from './EmployeeStatusBadge';
import { EmployeeFormModal } from './EmployeeFormModal';
import { useChangeEmployeeStatus, useEmployee } from './employeeHooks';

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-fg" />
      <div className="min-w-0">
        <p className="text-xs text-muted-fg">{label}</p>
        <p className="truncate text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data: employee, isLoading, isError } = useEmployee(id);
  const changeStatus = useChangeEmployeeStatus(id ?? '');
  const [editOpen, setEditOpen] = useState(false);

  const backLink = (
    <Link
      to="/hr/employees"
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to employees
    </Link>
  );

  if (isLoading) {
    return (
      <div>
        {backLink}
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div>
        {backLink}
        <EmptyState icon={UserCog} title="Employee not found" description="It may have been removed." />
      </div>
    );
  }

  const transitions = EMPLOYEE_STATUS_TRANSITIONS[employee.status];

  const handleStatus = async (status: EmployeeStatus) => {
    try {
      await changeStatus.mutateAsync(status);
      toast({ title: `Status updated to ${EMPLOYEE_STATUS_LABELS[status]}`, tone: 'success' });
    } catch (error) {
      toast({
        title: 'Could not update status',
        description: error instanceof ApiClientError ? error.message : 'Please try again.',
        tone: 'error',
      });
    }
  };

  return (
    <div>
      {backLink}

      <Card className="mb-6">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={employee.fullName} size="lg" />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-semibold text-foreground">{employee.fullName}</h1>
                <EmployeeStatusBadge status={employee.status} />
              </div>
              <p className="text-sm text-muted-fg">
                {employee.jobTitle} · {employee.department} · {employee.employeeCode}
              </p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-x-8 divide-border sm:grid-cols-2">
            <InfoRow icon={Mail} label="Email" value={employee.email} />
            <InfoRow icon={Phone} label="Phone" value={employee.phone ?? '—'} />
            <InfoRow icon={Building2} label="Department" value={employee.department} />
            <InfoRow
              icon={UserCog}
              label="Employment type"
              value={EMPLOYMENT_TYPE_LABELS[employee.employmentType]}
            />
            <InfoRow icon={CalendarDays} label="Joined" value={formatDate(employee.dateOfJoining)} />
            <InfoRow icon={MapPin} label="Location" value={employee.location ?? '—'} />
            <InfoRow icon={UserCog} label="Manager" value={employee.managerName ?? '—'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lifecycle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-fg">
              Current status: <span className="font-medium text-foreground">
                {EMPLOYEE_STATUS_LABELS[employee.status]}
              </span>
            </p>
            {transitions.length === 0 ? (
              <p className="text-sm text-muted-fg">No further transitions available.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {transitions.map((target) => (
                  <Button
                    key={target}
                    variant={target === 'terminated' ? 'danger' : 'secondary'}
                    onClick={() => handleStatus(target)}
                    isLoading={changeStatus.isPending}
                    fullWidth
                  >
                    Move to {EMPLOYEE_STATUS_LABELS[target]}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EmployeeFormModal open={editOpen} employee={employee} onClose={() => setEditOpen(false)} />
    </div>
  );
}
