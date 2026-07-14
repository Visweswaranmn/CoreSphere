import { type CustomerStatus, CUSTOMER_STATUS_LABELS } from '@coresphere/shared';
import { Badge, type BadgeTone } from '@/components/ui/Badge';

const tone: Record<CustomerStatus, BadgeTone> = {
  prospect: 'info',
  active: 'success',
  inactive: 'neutral',
};

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  return (
    <Badge tone={tone[status]} dot>
      {CUSTOMER_STATUS_LABELS[status]}
    </Badge>
  );
}
