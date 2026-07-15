import { type ExpenseStatus, EXPENSE_STATUS_LABELS } from '@coresphere/shared';
import { Badge, type BadgeTone } from '@/components/ui/Badge';

const tone: Record<ExpenseStatus, BadgeTone> = {
  draft: 'neutral',
  submitted: 'warning',
  approved: 'success',
  rejected: 'danger',
  reimbursed: 'primary',
};

export function ExpenseStatusBadge({ status }: { status: ExpenseStatus }) {
  return (
    <Badge tone={tone[status]} dot>
      {EXPENSE_STATUS_LABELS[status]}
    </Badge>
  );
}
