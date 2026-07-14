import { useState } from 'react';
import { Pencil, Plus, Wallet } from 'lucide-react';
import type { SalaryStructureDto } from '@coresphere/shared';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/lib/format';
import { SalaryStructureModal } from './SalaryStructureModal';
import { useSalaryStructures } from './payrollHooks';

const PAGE_SIZE = 10;

export function StructuresPanel() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SalaryStructureDto | undefined>();

  const { data, isLoading } = useSalaryStructures(page, PAGE_SIZE);
  const items = data?.items ?? [];

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-border p-4">
        <p className="text-sm font-medium text-foreground">Salary structures</p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Add structure
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
          icon={Wallet}
          title="No salary structures"
          description="Define an employee's compensation to include them in payroll."
          className="m-4 border-0"
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add structure
            </Button>
          }
        />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Employee</TH>
                <TH>Department</TH>
                <TH>Basic</TH>
                <TH>Gross</TH>
                <TH>Net</TH>
                <TH>Effective</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {items.map((s) => (
                <TR key={s.id}>
                  <TD>
                    <p className="font-medium text-foreground">{s.employeeName}</p>
                    <p className="text-xs text-muted-fg">{s.employeeCode}</p>
                  </TD>
                  <TD className="text-muted-fg">{s.department}</TD>
                  <TD className="text-muted-fg">{formatCurrency(s.basicSalary)}</TD>
                  <TD className="text-muted-fg">{formatCurrency(s.grossPay)}</TD>
                  <TD className="font-medium text-foreground">{formatCurrency(s.netPay)}</TD>
                  <TD className="text-muted-fg">{formatDate(s.effectiveFrom)}</TD>
                  <TD className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(s)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          {data && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}

      <SalaryStructureModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <SalaryStructureModal
        open={Boolean(editing)}
        structure={editing}
        onClose={() => setEditing(undefined)}
      />
    </Card>
  );
}
