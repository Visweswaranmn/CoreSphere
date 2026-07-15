export const REPORT_TYPES = [
  'employees',
  'expenses',
  'purchase-orders',
  'deals',
  'inventory',
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_FORMATS = ['csv', 'xlsx', 'pdf'] as const;
export type ReportFormat = (typeof REPORT_FORMATS)[number];

export interface ReportMeta {
  type: ReportType;
  name: string;
  description: string;
}

export const REPORTS: ReportMeta[] = [
  { type: 'employees', name: 'Employee Directory', description: 'All employees with role, department, and status.' },
  { type: 'expenses', name: 'Expense Report', description: 'Expense claims with category, amount, and status.' },
  { type: 'purchase-orders', name: 'Purchase Orders', description: 'Purchase orders with vendor, total, and status.' },
  { type: 'deals', name: 'Sales Pipeline', description: 'Deals with customer, value, and stage.' },
  { type: 'inventory', name: 'Inventory Stock', description: 'Inventory items with quantity and stock value.' },
];
