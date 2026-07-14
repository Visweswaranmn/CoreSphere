export interface SalaryComponent {
  name: string;
  amount: number;
}

export interface SalaryStructureDto {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  basicSalary: number;
  allowances: SalaryComponent[];
  deductions: SalaryComponent[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  effectiveFrom: string;
  updatedAt: string;
}

export const PayrollRunStatus = {
  Draft: 'draft',
  Processed: 'processed',
  Paid: 'paid',
} as const;
export type PayrollRunStatus = (typeof PayrollRunStatus)[keyof typeof PayrollRunStatus];
export const PAYROLL_RUN_STATUSES: readonly PayrollRunStatus[] = Object.values(PayrollRunStatus);
export const PAYROLL_RUN_STATUS_LABELS: Record<PayrollRunStatus, string> = {
  [PayrollRunStatus.Draft]: 'Draft',
  [PayrollRunStatus.Processed]: 'Processed',
  [PayrollRunStatus.Paid]: 'Paid',
};

export interface PayrollRunDto {
  id: string;
  month: number;
  year: number;
  periodLabel: string;
  status: PayrollRunStatus;
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  notes?: string;
  processedAt?: string;
  paidAt?: string;
  createdAt: string;
}

export interface PayslipDto {
  id: string;
  runId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  month: number;
  year: number;
  periodLabel: string;
  basicSalary: number;
  allowances: SalaryComponent[];
  deductions: SalaryComponent[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  status: PayrollRunStatus;
  createdAt: string;
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** Human-readable period, e.g. formatPeriod(7, 2026) → "July 2026". */
export function formatPeriod(month: number, year: number): string {
  const name = MONTH_NAMES[month - 1] ?? 'Unknown';
  return `${name} ${year}`;
}

/** Computes gross, total deductions, and net from salary components. */
export function computePay(
  basicSalary: number,
  allowances: SalaryComponent[],
  deductions: SalaryComponent[],
): { grossPay: number; totalDeductions: number; netPay: number } {
  const grossPay = basicSalary + allowances.reduce((sum, a) => sum + a.amount, 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  return { grossPay, totalDeductions, netPay: grossPay - totalDeductions };
}
