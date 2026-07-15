import {
  DEAL_STAGE_LABELS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  EXPENSE_STATUS_LABELS,
  PURCHASE_ORDER_STATUS_LABELS,
  type ReportType,
} from '@coresphere/shared';
import { EmployeeModel } from '../employees/employee.model';
import { ExpenseModel } from '../finance/expense.model';
import { PurchaseOrderModel } from '../procurement/purchaseOrder.model';
import { DealModel } from '../sales/deal.model';
import { InventoryItemModel } from '../inventory/inventoryItem.model';

export interface ReportColumn {
  key: string;
  header: string;
}

export interface ReportData {
  title: string;
  columns: ReportColumn[];
  rows: Record<string, string | number>[];
}

const LIMIT = 5000;
const dateOnly = (d?: Date | null): string => (d ? d.toISOString().slice(0, 10) : '');

async function employeesReport(): Promise<ReportData> {
  const docs = await EmployeeModel.find().sort({ employeeCode: 1 }).limit(LIMIT).exec();
  return {
    title: 'Employee Directory',
    columns: [
      { key: 'code', header: 'Code' },
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' },
      { key: 'department', header: 'Department' },
      { key: 'jobTitle', header: 'Job Title' },
      { key: 'type', header: 'Type' },
      { key: 'status', header: 'Status' },
      { key: 'joined', header: 'Joined' },
    ],
    rows: docs.map((e) => ({
      code: e.employeeCode,
      name: `${e.firstName} ${e.lastName}`.trim(),
      email: e.email,
      department: e.department,
      jobTitle: e.jobTitle,
      type: EMPLOYMENT_TYPE_LABELS[e.employmentType],
      status: EMPLOYEE_STATUS_LABELS[e.status],
      joined: dateOnly(e.dateOfJoining),
    })),
  };
}

async function expensesReport(): Promise<ReportData> {
  const docs = await ExpenseModel.find().populate('employee', 'firstName lastName').sort({ createdAt: -1 }).limit(LIMIT).exec();
  return {
    title: 'Expense Report',
    columns: [
      { key: 'code', header: 'Code' },
      { key: 'title', header: 'Title' },
      { key: 'category', header: 'Category' },
      { key: 'employee', header: 'Claimant' },
      { key: 'amount', header: 'Amount' },
      { key: 'status', header: 'Status' },
      { key: 'date', header: 'Date' },
    ],
    rows: docs.map((x) => {
      const emp = x.employee as unknown as { firstName?: string; lastName?: string };
      return {
        code: x.code,
        title: x.title,
        category: x.category,
        employee: emp?.firstName ? `${emp.firstName} ${emp.lastName}`.trim() : '',
        amount: x.amount,
        status: EXPENSE_STATUS_LABELS[x.status],
        date: dateOnly(x.date),
      };
    }),
  };
}

async function purchaseOrdersReport(): Promise<ReportData> {
  const docs = await PurchaseOrderModel.find().populate('vendor', 'name').sort({ createdAt: -1 }).limit(LIMIT).exec();
  return {
    title: 'Purchase Orders',
    columns: [
      { key: 'code', header: 'Code' },
      { key: 'title', header: 'Title' },
      { key: 'vendor', header: 'Vendor' },
      { key: 'status', header: 'Status' },
      { key: 'total', header: 'Total' },
      { key: 'created', header: 'Created' },
    ],
    rows: docs.map((o) => {
      const vendor = o.vendor as unknown as { name?: string };
      return {
        code: o.code,
        title: o.title,
        vendor: vendor?.name ?? '',
        status: PURCHASE_ORDER_STATUS_LABELS[o.status],
        total: o.total,
        created: dateOnly(o.createdAt),
      };
    }),
  };
}

async function dealsReport(): Promise<ReportData> {
  const docs = await DealModel.find().populate('customer', 'name').sort({ createdAt: -1 }).limit(LIMIT).exec();
  return {
    title: 'Sales Pipeline',
    columns: [
      { key: 'code', header: 'Code' },
      { key: 'title', header: 'Title' },
      { key: 'customer', header: 'Customer' },
      { key: 'value', header: 'Value' },
      { key: 'stage', header: 'Stage' },
    ],
    rows: docs.map((d) => {
      const customer = d.customer as unknown as { name?: string };
      return {
        code: d.code,
        title: d.title,
        customer: customer?.name ?? '',
        value: d.value,
        stage: DEAL_STAGE_LABELS[d.stage],
      };
    }),
  };
}

async function inventoryReport(): Promise<ReportData> {
  const docs = await InventoryItemModel.find().sort({ code: 1 }).limit(LIMIT).exec();
  return {
    title: 'Inventory Stock',
    columns: [
      { key: 'code', header: 'Code' },
      { key: 'name', header: 'Name' },
      { key: 'category', header: 'Category' },
      { key: 'quantity', header: 'Quantity' },
      { key: 'unit', header: 'Unit' },
      { key: 'stockValue', header: 'Stock Value' },
      { key: 'warehouse', header: 'Warehouse' },
    ],
    rows: docs.map((i) => ({
      code: i.code,
      name: i.name,
      category: i.category,
      quantity: i.quantity,
      unit: i.unit,
      stockValue: Math.round(i.quantity * i.unitCost * 100) / 100,
      warehouse: i.warehouse,
    })),
  };
}

const builders: Record<ReportType, () => Promise<ReportData>> = {
  employees: employeesReport,
  expenses: expensesReport,
  'purchase-orders': purchaseOrdersReport,
  deals: dealsReport,
  inventory: inventoryReport,
};

export function getReportData(type: ReportType): Promise<ReportData> {
  return builders[type]();
}
