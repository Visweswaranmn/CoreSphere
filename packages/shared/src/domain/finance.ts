export const EXPENSE_CATEGORIES = [
  'Travel',
  'Meals',
  'Office Supplies',
  'Software',
  'Equipment',
  'Utilities',
  'Marketing',
  'Training',
  'Professional Services',
  'Other',
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const ExpenseStatus = {
  Draft: 'draft',
  Submitted: 'submitted',
  Approved: 'approved',
  Rejected: 'rejected',
  Reimbursed: 'reimbursed',
} as const;
export type ExpenseStatus = (typeof ExpenseStatus)[keyof typeof ExpenseStatus];
export const EXPENSE_STATUSES: readonly ExpenseStatus[] = Object.values(ExpenseStatus);
export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  [ExpenseStatus.Draft]: 'Draft',
  [ExpenseStatus.Submitted]: 'Submitted',
  [ExpenseStatus.Approved]: 'Approved',
  [ExpenseStatus.Rejected]: 'Rejected',
  [ExpenseStatus.Reimbursed]: 'Reimbursed',
};

export interface ExpenseDto {
  id: string;
  code: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  employeeId: string;
  employeeName: string;
  status: ExpenseStatus;
  description?: string;
  approverName?: string;
  decisionNote?: string;
  decidedAt?: string;
  reimbursedAt?: string;
  createdAt: string;
}

export interface FinanceStats {
  pendingCount: number;
  pendingAmount: number;
  approvedAmount: number;
  reimbursedAmount: number;
  byCategory: { category: string; amount: number }[];
}

export interface BudgetDto {
  id: string;
  name: string;
  category: string;
  month: number;
  year: number;
  periodLabel: string;
  amount: number;
  spent: number;
  remaining: number;
  utilization: number;
}

/** Budget utilization as a 0–100+ integer (can exceed 100 when overspent). */
export function computeUtilization(spent: number, amount: number): number {
  if (amount <= 0) return 0;
  return Math.round((spent / amount) * 100);
}
