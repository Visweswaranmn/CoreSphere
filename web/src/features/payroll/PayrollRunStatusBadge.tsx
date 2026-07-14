import {
  PAYROLL_RUN_STATUS_LABELS,
  PayrollRunStatus,
  type PayrollRunStatus as Status,
} from '@coresphere/shared';
import { Badge, type BadgeTone } from '@/components/ui/Badge';

const tone: Record<Status, BadgeTone> = {
  [PayrollRunStatus.Draft]: 'neutral',
  [PayrollRunStatus.Processed]: 'info',
  [PayrollRunStatus.Paid]: 'success',
};

export function PayrollRunStatusBadge({ status }: { status: Status }) {
  return (
    <Badge tone={tone[status]} dot>
      {PAYROLL_RUN_STATUS_LABELS[status]}
    </Badge>
  );
}
