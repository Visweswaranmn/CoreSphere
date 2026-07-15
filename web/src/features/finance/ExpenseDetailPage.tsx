import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, PiggyBank, Send, Trash2, X } from 'lucide-react';
import { ExpenseStatus } from '@coresphere/shared';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDate } from '@/lib/format';
import { ApiClientError } from '@/lib/apiClient';
import { ExpenseStatusBadge } from './ExpenseStatusBadge';
import { useExpense, useExpenseAction } from './financeHooks';

export function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: expense, isLoading } = useExpense(id);
  const action = useExpenseAction();
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);
  const [note, setNote] = useState('');

  const back = (
    <Link to="/finance" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-foreground">
      <ArrowLeft className="h-4 w-4" />
      Back to finance
    </Link>
  );

  if (isLoading || !expense) {
    return <div>{back}<Skeleton className="h-40 w-full" /></div>;
  }

  const run = async (promise: Promise<unknown>, success: string, redirect?: boolean) => {
    try {
      await promise;
      toast({ title: success, tone: 'success' });
      if (redirect) navigate('/finance');
    } catch (error) {
      toast({ title: 'Action failed', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  };

  const confirmDecision = async () => {
    if (!decision || !id) return;
    try {
      await action.mutateAsync({ action: 'decide', id, status: decision, note: note || undefined });
      toast({ title: decision === 'approved' ? 'Expense approved' : 'Expense rejected', tone: decision === 'approved' ? 'success' : 'info' });
      setDecision(null);
      setNote('');
    } catch (error) {
      toast({ title: 'Action failed', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  };

  const { status } = expense;
  const details = [
    { label: 'Category', value: expense.category },
    { label: 'Claimant', value: expense.employeeName },
    { label: 'Date incurred', value: formatDate(expense.date) },
    { label: 'Amount', value: formatCurrency(expense.amount) },
  ];

  return (
    <div>
      {back}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-foreground">{expense.title}</h1>
            <ExpenseStatusBadge status={status} />
          </div>
          <p className="mt-1 text-sm text-muted-fg">{expense.code}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {status === ExpenseStatus.Draft && id && (
            <>
              <Button onClick={() => run(action.mutateAsync({ action: 'submit', id }), 'Expense submitted')} isLoading={action.isPending}>
                <Send className="h-4 w-4" />
                Submit
              </Button>
              <Button variant="secondary" onClick={() => run(action.mutateAsync({ action: 'delete', id }), 'Expense removed', true)}>
                <Trash2 className="h-4 w-4 text-danger" />
                Delete
              </Button>
            </>
          )}
          {status === ExpenseStatus.Submitted && (
            <>
              <Button onClick={() => setDecision('approved')}><Check className="h-4 w-4" />Approve</Button>
              <Button variant="secondary" onClick={() => setDecision('rejected')}><X className="h-4 w-4 text-danger" />Reject</Button>
            </>
          )}
          {status === ExpenseStatus.Approved && id && (
            <Button onClick={() => run(action.mutateAsync({ action: 'reimburse', id }), 'Expense reimbursed')} isLoading={action.isPending}>
              <PiggyBank className="h-4 w-4" />
              Mark reimbursed
            </Button>
          )}
        </div>
      </div>

      {expense.decisionNote && (
        <Card className="mb-6">
          <CardContent>
            <p className="text-xs text-muted-fg">
              Decision by {expense.approverName ?? 'reviewer'}
              {expense.decidedAt ? ` · ${formatDate(expense.decidedAt)}` : ''}
            </p>
            <p className="mt-1 text-sm text-foreground">{expense.decisionNote}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          {details.map((d) => (
            <div key={d.label}>
              <p className="text-xs text-muted-fg">{d.label}</p>
              <p className="text-sm text-foreground">{d.value}</p>
            </div>
          ))}
          {expense.description && (
            <div className="col-span-2 sm:col-span-4">
              <p className="text-xs text-muted-fg">Description</p>
              <p className="text-sm text-foreground">{expense.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={Boolean(decision)}
        onClose={() => setDecision(null)}
        size="sm"
        title={decision === 'approved' ? 'Approve expense' : 'Reject expense'}
        description={`${expense.code} · ${formatCurrency(expense.amount)}`}
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
