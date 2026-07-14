import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeDollarSign, CheckCircle2, PlayCircle, Users } from 'lucide-react';
import { PayrollRunStatus, type PayslipDto } from '@coresphere/shared';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/lib/format';
import { ApiClientError } from '@/lib/apiClient';
import { PayrollRunStatusBadge } from './PayrollRunStatusBadge';
import { PayslipModal } from './PayslipModal';
import { usePayRun, usePayslips, useProcessRun, useRun } from './payrollHooks';

const PAGE_SIZE = 10;

export function RunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PayslipDto | null>(null);

  const { data: run, isLoading } = useRun(id);
  const payslipParams = useMemo(() => ({ page, pageSize: PAGE_SIZE, runId: id }), [page, id]);
  const { data: payslips } = usePayslips(payslipParams);
  const processRun = useProcessRun();
  const payRun = usePayRun();

  const back = (
    <Link
      to="/hr/payroll"
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to payroll
    </Link>
  );

  const action = async (fn: Promise<unknown>, success: string) => {
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

  if (isLoading || !run) {
    return (
      <div>
        {back}
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const stats = [
    { icon: Users, label: 'Employees', value: String(run.employeeCount) },
    { icon: BadgeDollarSign, label: 'Gross', value: formatCurrency(run.totalGross) },
    { icon: BadgeDollarSign, label: 'Deductions', value: formatCurrency(run.totalDeductions) },
    { icon: BadgeDollarSign, label: 'Net payable', value: formatCurrency(run.totalNet) },
  ];

  const items = payslips?.items ?? [];

  return (
    <div>
      {back}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground">{run.periodLabel}</h1>
          <PayrollRunStatusBadge status={run.status} />
        </div>
        <div className="flex gap-2">
          {run.status === PayrollRunStatus.Draft && (
            <Button
              onClick={() => action(processRun.mutateAsync(run.id), 'Payroll processed')}
              isLoading={processRun.isPending}
            >
              <PlayCircle className="h-4 w-4" />
              Process payroll
            </Button>
          )}
          {run.status === PayrollRunStatus.Processed && (
            <Button
              onClick={() => action(payRun.mutateAsync(run.id), 'Payroll marked as paid')}
              isLoading={payRun.isPending}
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark as paid
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs text-muted-fg">{s.label}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b border-border p-4">
          <p className="text-sm font-medium text-foreground">Payroll register</p>
        </div>
        {items.length === 0 ? (
          <EmptyState
            icon={BadgeDollarSign}
            title="No payslips"
            description={
              run.status === PayrollRunStatus.Draft
                ? 'Process this run to generate payslips for active employees.'
                : 'No active employees with a salary structure were found.'
            }
            className="m-4 border-0"
          />
        ) : (
          <>
            <Table>
              <THead>
                <TR>
                  <TH>Employee</TH>
                  <TH>Basic</TH>
                  <TH>Gross</TH>
                  <TH>Deductions</TH>
                  <TH>Net</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((slip) => (
                  <TR key={slip.id}>
                    <TD>
                      <p className="font-medium text-foreground">{slip.employeeName}</p>
                      <p className="text-xs text-muted-fg">{slip.employeeCode}</p>
                    </TD>
                    <TD className="text-muted-fg">{formatCurrency(slip.basicSalary)}</TD>
                    <TD className="text-muted-fg">{formatCurrency(slip.grossPay)}</TD>
                    <TD className="text-danger">{formatCurrency(slip.totalDeductions)}</TD>
                    <TD className="font-medium text-foreground">{formatCurrency(slip.netPay)}</TD>
                    <TD className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setSelected(slip)}>
                        View payslip
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            {payslips && <Pagination meta={payslips.meta} onPageChange={setPage} />}
          </>
        )}
      </Card>

      <PayslipModal payslip={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
