import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, Check, PackageCheck, Send, Trash2, X } from 'lucide-react';
import { PurchaseOrderStatus } from '@coresphere/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDate } from '@/lib/format';
import { ApiClientError } from '@/lib/apiClient';
import { PurchaseOrderStatusBadge } from './badges';
import { useDeleteOrder, useOrder, useOrderAction } from './procurementHooks';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: order, isLoading } = useOrder(id);
  const action = useOrderAction();
  const deleteOrder = useDeleteOrder();
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);
  const [note, setNote] = useState('');

  const back = (
    <Link to="/procurement" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-foreground">
      <ArrowLeft className="h-4 w-4" />
      Back to procurement
    </Link>
  );

  if (isLoading || !order) {
    return (
      <div>
        {back}
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const run = async (promise: Promise<unknown>, success: string) => {
    try {
      await promise;
      toast({ title: success, tone: 'success' });
    } catch (error) {
      toast({ title: 'Action failed', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  };

  const confirmDecision = async () => {
    if (!decision || !id) return;
    try {
      await action.mutateAsync({ action: 'decide', id, status: decision, note: note || undefined });
      toast({ title: decision === 'approved' ? 'Order approved' : 'Order rejected', tone: decision === 'approved' ? 'success' : 'info' });
      setDecision(null);
      setNote('');
    } catch (error) {
      toast({ title: 'Action failed', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  };

  const { status } = order;

  return (
    <div>
      {back}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-foreground">{order.title}</h1>
            <PurchaseOrderStatusBadge status={status} />
          </div>
          <p className="mt-1 text-sm text-muted-fg">
            {order.code} · {order.vendorName}
            {order.expectedDate ? ` · Expected ${formatDate(order.expectedDate)}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {status === PurchaseOrderStatus.Draft && id && (
            <Button onClick={() => run(action.mutateAsync({ action: 'submit', id }), 'Order submitted')} isLoading={action.isPending}>
              <Send className="h-4 w-4" />
              Submit for approval
            </Button>
          )}
          {status === PurchaseOrderStatus.Submitted && (
            <>
              <Button onClick={() => setDecision('approved')}>
                <Check className="h-4 w-4" />
                Approve
              </Button>
              <Button variant="secondary" onClick={() => setDecision('rejected')}>
                <X className="h-4 w-4 text-danger" />
                Reject
              </Button>
            </>
          )}
          {status === PurchaseOrderStatus.Approved && id && (
            <Button onClick={() => run(action.mutateAsync({ action: 'receive', id }), 'Order received')} isLoading={action.isPending}>
              <PackageCheck className="h-4 w-4" />
              Mark received
            </Button>
          )}
          {(status === PurchaseOrderStatus.Draft ||
            status === PurchaseOrderStatus.Submitted ||
            status === PurchaseOrderStatus.Approved) &&
            id && (
              <Button variant="secondary" onClick={() => run(action.mutateAsync({ action: 'cancel', id }), 'Order cancelled')}>
                <Ban className="h-4 w-4" />
                Cancel
              </Button>
            )}
          {status === PurchaseOrderStatus.Draft && id && (
            <Button
              variant="secondary"
              isLoading={deleteOrder.isPending}
              onClick={async () => {
                await run(deleteOrder.mutateAsync(id), 'Draft removed');
                navigate('/procurement');
              }}
            >
              <Trash2 className="h-4 w-4 text-danger" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {order.decisionNote && (
        <Card className="mb-6">
          <CardContent>
            <p className="text-xs text-muted-fg">
              Decision by {order.approverName ?? 'reviewer'}
              {order.decidedAt ? ` · ${formatDate(order.decidedAt)}` : ''}
            </p>
            <p className="mt-1 text-sm text-foreground">{order.decisionNote}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Item</TH>
                <TH className="text-right">Qty</TH>
                <TH className="text-right">Unit price</TH>
                <TH className="text-right">Amount</TH>
              </TR>
            </THead>
            <TBody>
              {order.items.map((item, i) => (
                <TR key={`${item.name}-${i}`}>
                  <TD className="text-foreground">{item.name}</TD>
                  <TD className="text-right text-muted-fg">{item.quantity}</TD>
                  <TD className="text-right text-muted-fg">{formatCurrency(item.unitPrice)}</TD>
                  <TD className="text-right font-medium text-foreground">{formatCurrency(item.amount)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
          <div className="ml-auto max-w-xs space-y-1.5 p-4 text-sm">
            <div className="flex justify-between text-muted-fg">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-fg">
              <span>Tax ({order.taxRate}%)</span>
              <span>{formatCurrency(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 text-base font-semibold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={Boolean(decision)}
        onClose={() => setDecision(null)}
        size="sm"
        title={decision === 'approved' ? 'Approve purchase order' : 'Reject purchase order'}
        description={`${order.code} · ${formatCurrency(order.total)}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDecision(null)}>Cancel</Button>
            <Button variant={decision === 'rejected' ? 'danger' : 'primary'} onClick={confirmDecision} isLoading={action.isPending}>
              {decision === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </>
        }
      >
        <Textarea label="Decision note (optional)" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </Modal>
    </div>
  );
}
