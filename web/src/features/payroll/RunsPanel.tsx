import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeDollarSign, CheckCircle2, Eye, MoreHorizontal, PlayCircle, Plus } from 'lucide-react';
import { PayrollRunStatus } from '@coresphere/shared';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { DropdownItem, DropdownMenu } from '@/components/ui/DropdownMenu';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/lib/format';
import { ApiClientError } from '@/lib/apiClient';
import { PayrollRunStatusBadge } from './PayrollRunStatusBadge';
import { CreateRunModal } from './CreateRunModal';
import { usePayRun, useProcessRun, useRuns } from './payrollHooks';

const PAGE_SIZE = 10;

export function RunsPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const params = useMemo(() => ({ page, pageSize: PAGE_SIZE }), [page]);
  const { data, isLoading } = useRuns(params);
  const processRun = useProcessRun();
  const payRun = usePayRun();

  const runAction = async (fn: Promise<unknown>, success: string) => {
    try {
      await fn;
      toast({ title: success, tone: 'success' });
    } catch (error) {
      toast({
        title: 'Action failed',
        description: error instanceof ApiClientError ? error.message : 'Please try again.',
        tone: 'error',
      });
    }
  };

  const items = data?.items ?? [];

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-border p-4">
        <p className="text-sm font-medium text-foreground">Payroll runs</p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New run
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={BadgeDollarSign}
          title="No payroll runs yet"
          description="Create your first run to generate payslips."
          className="m-4 border-0"
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New run
            </Button>
          }
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Period</TH>
                <TH>Status</TH>
                <TH>Employees</TH>
                <TH>Gross</TH>
                <TH>Net</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {items.map((run) => (
                <TR key={run.id}>
                  <TD className="font-medium text-foreground">{run.periodLabel}</TD>
                  <TD>
                    <PayrollRunStatusBadge status={run.status} />
                  </TD>
                  <TD className="text-muted-fg">{run.employeeCount}</TD>
                  <TD className="text-muted-fg">{formatCurrency(run.totalGross)}</TD>
                  <TD className="font-medium text-foreground">{formatCurrency(run.totalNet)}</TD>
                  <TD className="text-right">
                    <DropdownMenu
                      trigger={
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-fg hover:bg-surface-muted hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </span>
                      }
                    >
                      <DropdownItem icon={Eye} onSelect={() => navigate(`/hr/payroll/runs/${run.id}`)}>
                        View register
                      </DropdownItem>
                      {run.status === PayrollRunStatus.Draft && (
                        <DropdownItem
                          icon={PlayCircle}
                          onSelect={() => runAction(processRun.mutateAsync(run.id), 'Payroll processed')}
                        >
                          Process
                        </DropdownItem>
                      )}
                      {run.status === PayrollRunStatus.Processed && (
                        <DropdownItem
                          icon={CheckCircle2}
                          onSelect={() => runAction(payRun.mutateAsync(run.id), 'Payroll marked as paid')}
                        >
                          Mark as paid
                        </DropdownItem>
                      )}
                    </DropdownMenu>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          {data && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}

      <CreateRunModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </Card>
  );
}
