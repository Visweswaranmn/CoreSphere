import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, Package } from 'lucide-react';
import {
  STOCK_MOVEMENT_TYPE_LABELS,
  type StockMovementType,
} from '@coresphere/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/lib/format';
import { StockBadge } from './badges';
import { MovementModal } from './MovementModal';
import { useItem, useMovements } from './inventoryHooks';

const moveTone: Record<StockMovementType, BadgeTone> = { in: 'success', out: 'danger', adjustment: 'info' };

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading } = useItem(id);
  const { data: movements } = useMovements(id);
  const [moveOpen, setMoveOpen] = useState(false);

  const back = (
    <Link to="/inventory" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-foreground">
      <ArrowLeft className="h-4 w-4" />
      Back to inventory
    </Link>
  );

  if (isLoading || !item) {
    return <div>{back}<Skeleton className="h-40 w-full" /></div>;
  }

  const details = [
    { label: 'Category', value: item.category },
    { label: 'Warehouse', value: item.warehouse },
    { label: 'Unit', value: item.unit },
    { label: 'Reorder level', value: `${item.reorderLevel} ${item.unit}` },
    { label: 'Unit cost', value: formatCurrency(item.unitCost) },
    { label: 'Stock value', value: formatCurrency(item.stockValue) },
  ];

  return (
    <div>
      {back}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-foreground">{item.name}</h1>
            <StockBadge item={item} />
          </div>
          <p className="mt-1 text-sm text-muted-fg">
            {item.code} · <span className="font-medium text-foreground">{item.quantity} {item.unit}</span> in stock
          </p>
        </div>
        <Button onClick={() => setMoveOpen(true)}>
          <ArrowRightLeft className="h-4 w-4" />
          Record movement
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          {details.map((d) => (
            <div key={d.label}>
              <p className="text-xs text-muted-fg">{d.label}</p>
              <p className="text-sm text-foreground">{d.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movement history</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!movements || movements.length === 0 ? (
            <EmptyState icon={Package} title="No movements yet" description="Record a movement to adjust stock." className="m-4 border-0" />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Type</TH>
                  <TH className="text-right">Quantity</TH>
                  <TH className="text-right">Resulting stock</TH>
                  <TH>Reason / Ref</TH>
                  <TH>By</TH>
                  <TH>Date</TH>
                </TR>
              </THead>
              <TBody>
                {movements.map((m) => (
                  <TR key={m.id}>
                    <TD><Badge tone={moveTone[m.type]}>{STOCK_MOVEMENT_TYPE_LABELS[m.type]}</Badge></TD>
                    <TD className="text-right text-foreground">{m.type === 'out' ? '−' : m.type === 'in' ? '+' : '='}{m.quantity}</TD>
                    <TD className="text-right text-muted-fg">{m.resultingQuantity}</TD>
                    <TD className="text-muted-fg">{m.reason ?? m.reference ?? '—'}</TD>
                    <TD className="text-muted-fg">{m.byName ?? '—'}</TD>
                    <TD className="text-muted-fg">{formatDate(m.createdAt)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {id && <MovementModal open={moveOpen} onClose={() => setMoveOpen(false)} itemId={id} />}
    </div>
  );
}
