import { EMPLOYEE_STATUS_LABELS, EmployeeStatus, type EmployeeStatus as Status } from '@coresphere/shared';
import { Badge, type BadgeTone } from '@/components/ui/Badge';

const toneByStatus: Record<Status, BadgeTone> = {
  [EmployeeStatus.Onboarding]: 'info',
  [EmployeeStatus.Active]: 'success',
  [EmployeeStatus.OnLeave]: 'warning',
  [EmployeeStatus.Terminated]: 'danger',
};

export function EmployeeStatusBadge({ status }: { status: Status }) {
  return (
    <Badge tone={toneByStatus[status]} dot>
      {EMPLOYEE_STATUS_LABELS[status]}
    </Badge>
  );
}
