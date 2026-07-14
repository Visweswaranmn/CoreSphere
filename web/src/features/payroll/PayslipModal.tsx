import type { PayslipDto } from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/format';

function Line({ label, value, tone }: { label: string; value: number; tone?: 'muted' | 'danger' }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-fg">{label}</span>
      <span className={tone === 'danger' ? 'text-danger' : 'text-foreground'}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

export function PayslipModal({ payslip, onClose }: { payslip: PayslipDto | null; onClose: () => void }) {
  return (
    <Modal
      open={Boolean(payslip)}
      onClose={onClose}
      title="Payslip"
      description={payslip ? `${payslip.employeeName} · ${payslip.periodLabel}` : undefined}
    >
      {payslip && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-fg">Earnings</p>
            <Line label="Basic salary" value={payslip.basicSalary} />
            {payslip.allowances.map((a) => (
              <Line key={a.name} label={a.name} value={a.amount} />
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm font-medium">
              <span>Gross pay</span>
              <span>{formatCurrency(payslip.grossPay)}</span>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-fg">
              Deductions
            </p>
            {payslip.deductions.length === 0 ? (
              <p className="text-sm text-muted-fg">None</p>
            ) : (
              payslip.deductions.map((d) => <Line key={d.name} label={d.name} value={d.amount} tone="danger" />)
            )}
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm font-medium">
              <span>Total deductions</span>
              <span className="text-danger">{formatCurrency(payslip.totalDeductions)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
            <span className="text-sm font-medium text-foreground">Net pay</span>
            <span className="text-lg font-semibold text-primary">{formatCurrency(payslip.netPay)}</span>
          </div>
        </div>
      )}
    </Modal>
  );
}
