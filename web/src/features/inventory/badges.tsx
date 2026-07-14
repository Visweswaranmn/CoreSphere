import { type AssetStatus, ASSET_STATUS_LABELS, type InventoryItemDto } from '@coresphere/shared';
import { Badge, type BadgeTone } from '@/components/ui/Badge';

export function StockBadge({ item }: { item: InventoryItemDto }) {
  if (item.quantity === 0) return <Badge tone="danger" dot>Out of stock</Badge>;
  if (item.lowStock) return <Badge tone="warning" dot>Low stock</Badge>;
  return <Badge tone="success" dot>In stock</Badge>;
}

const assetTone: Record<AssetStatus, BadgeTone> = {
  available: 'success',
  assigned: 'info',
  maintenance: 'warning',
  retired: 'neutral',
};

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  return (
    <Badge tone={assetTone[status]} dot>
      {ASSET_STATUS_LABELS[status]}
    </Badge>
  );
}
