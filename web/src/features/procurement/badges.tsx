import {
  type PurchaseOrderStatus,
  PURCHASE_ORDER_STATUS_LABELS,
  type VendorStatus,
  VENDOR_STATUS_LABELS,
} from '@coresphere/shared';
import { Badge, type BadgeTone } from '@/components/ui/Badge';

const vendorTone: Record<VendorStatus, BadgeTone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  suspended: 'neutral',
};

const orderTone: Record<PurchaseOrderStatus, BadgeTone> = {
  draft: 'neutral',
  submitted: 'warning',
  approved: 'success',
  rejected: 'danger',
  received: 'primary',
  cancelled: 'neutral',
};

export function VendorStatusBadge({ status }: { status: VendorStatus }) {
  return (
    <Badge tone={vendorTone[status]} dot>
      {VENDOR_STATUS_LABELS[status]}
    </Badge>
  );
}

export function PurchaseOrderStatusBadge({ status }: { status: PurchaseOrderStatus }) {
  return (
    <Badge tone={orderTone[status]} dot>
      {PURCHASE_ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
