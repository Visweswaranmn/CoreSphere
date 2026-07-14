import { useMemo, useState } from 'react';
import { Check, CalendarX, Plus, X } from 'lucide-react';
import {
  type LeaveRequestDto,
  type LeaveStatus,
  LEAVE_STATUS_LABELS,
  LEAVE_STATUSES,
  LEAVE_TYPE_LABELS,
} from '@coresphere/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/format';
import { ApiClientError } from '@/lib/apiClient';
import { useEmployeeOptions } from '@/features/employees/employeeHooks';
import { LeaveRequestModal } from './LeaveRequestModal';
import { useDecideLeave, useLeaveBalance, useLeaves } from './leaveHooks';

const statusTone: Record<LeaveStatus, BadgeTone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  cancelled: 'neutral',
};

const PAGE_SIZE = 10;

interface DecisionState {
  leave: LeaveRequestDto;
  action: 'approved' | 'rejected';
}

export function LeavePage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [requestOpen, setRequestOpen] = useState(false);
  const [decision, setDecision] = useState<DecisionState | null>(null);
  const [note, setNote] = useState('');

  const { data: options } = useEmployeeOptions();
  const employeeOptions = [
    { value: '', label: 'All employees' },
    ...(options ?? []).map((o) => o.option),
  ];
  const statusOptions = [
    { value: '', label: 'All statuses' },
    ...LEAVE_STATUSES.map((s) => ({ value: s, label: LEAVE_STATUS_LABELS[s] })),
  ];

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, status: status || undefined, employeeId: employeeId || undefined }),
    [page, status, employeeId],
  );

  const { data, isLoading } = useLeaves(params);
  const { data: balances } = useLeaveBalance(employeeId || undefined);
  const decideMutation = useDecideLeave();

  const resetPage = () => setPage(1);
  const items = data?.items ?? [];

  const openDecision = (leave: LeaveRequestDto, action: 'approved' | 'rejected') => {
    setNote('');
    setDecision({ leave, action });
  };

  const confirmDecision = async () => {
    if (!decision) return;
    try {
      await decideMutation.mutateAsync({
        id: decision.leave.id,
        payload: { status: decision.action, note: note || undefined },
      });
      toast({
        title: decision.action === 'approved' ? 'Leave approved' : 'Leave rejected',
        tone: decision.action === 'approved' ? 'success' : 'info',
      });
      setDecision(null);
    } catch (error) {
      toast({
        title: 'Could not record decision',
        description: error instanceof ApiClientError ? error.message : 'Please try again.',
        tone: 'error',
      });
    }
  };

  return (
    <div>
      <PageHeader
        title="Leave Management"
        description="Review and decide on employee leave requests."
        actions={
          <Button onClick={() => setRequestOpen(true)}>
            <Plus className="h-4 w-4" />
            Request leave
          </Button>
        }
      />

      {employeeId && balances && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {balances.map((balance) => (
            <Card key={balance.type} className="p-4">
              <p className="text-xs text-muted-fg">{LEAVE_TYPE_LABELS[balance.type]}</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {balance.remaining}
                <span className="text-sm font-normal text-muted-fg"> / {balance.entitlement}</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-fg">
                {balance.used} used · {balance.pending} pending
              </p>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            options={employeeOptions}
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(e.target.value);
              resetPage();
            }}
          />
          <Select
            options={statusOptions}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              resetPage();
            }}
          />
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="No leave requests"
            description="Requests will appear here for review."
            className="m-4 border-0"
          />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>Employee</TH>
                  <TH>Type</TH>
                  <TH>Period</TH>
                  <TH>Days</TH>
                  <TH>Status</TH>
                  <TH>Reviewer</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((leave) => (
                  <TR key={leave.id}>
                    <TD>
                      <p className="font-medium text-foreground">{leave.employeeName}</p>
                      <p className="text-xs text-muted-fg">{leave.employeeCode}</p>
                    </TD>
                    <TD className="text-muted-fg">{LEAVE_TYPE_LABELS[leave.type]}</TD>
                    <TD className="text-muted-fg">
                      {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                    </TD>
                    <TD className="text-muted-fg">{leave.days}</TD>
                    <TD>
                      <Badge tone={statusTone[leave.status]} dot>
                        {LEAVE_STATUS_LABELS[leave.status]}
                      </Badge>
                    </TD>
                    <TD className="text-muted-fg">{leave.reviewerName ?? '—'}</TD>
                    <TD>
                      {leave.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => openDecision(leave, 'approved')}>
                            <Check className="h-4 w-4 text-success" />
                            Approve
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => openDecision(leave, 'rejected')}>
                            <X className="h-4 w-4 text-danger" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <p className="text-right text-xs text-muted-fg">
                          {leave.decidedAt ? formatDate(leave.decidedAt) : '—'}
                        </p>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            {data && <Pagination meta={data.meta} onPageChange={setPage} />}
          </>
        )}
      </Card>

      <LeaveRequestModal open={requestOpen} onClose={() => setRequestOpen(false)} />

      <Modal
        open={Boolean(decision)}
        onClose={() => setDecision(null)}
        size="sm"
        title={decision?.action === 'approved' ? 'Approve leave request' : 'Reject leave request'}
        description={
          decision
            ? `${decision.leave.employeeName} · ${LEAVE_TYPE_LABELS[decision.leave.type]} · ${decision.leave.days} day(s)`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setDecision(null)}>
              Cancel
            </Button>
            <Button
              variant={decision?.action === 'rejected' ? 'danger' : 'primary'}
              onClick={confirmDecision}
              isLoading={decideMutation.isPending}
            >
              {decision?.action === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </>
        }
      >
        <Textarea
          label="Decision note (optional)"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Modal>
    </div>
  );
}
