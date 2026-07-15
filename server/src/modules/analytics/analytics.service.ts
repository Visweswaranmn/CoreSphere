import {
  type ActivityItem,
  type AnalyticsOverview,
  DEAL_STAGE_LABELS,
  type DealStage,
  MONTH_NAMES,
  type NamedValue,
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
} from '@coresphere/shared';
import { EmployeeModel } from '../employees/employee.model';
import { ProjectModel } from '../projects/project.model';
import { InventoryItemModel } from '../inventory/inventoryItem.model';
import { ExpenseModel } from '../finance/expense.model';
import { DealModel } from '../sales/deal.model';

const SETTLED = ['approved', 'reimbursed'];

interface MonthKey {
  year: number;
  month: number;
  label: string;
}

function lastMonths(count: number): MonthKey[] {
  const now = new Date();
  const months: MonthKey[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push({
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      label: MONTH_NAMES[d.getUTCMonth()]!.slice(0, 3),
    });
  }
  return months;
}

async function monthlySeries(): Promise<AnalyticsOverview['revenueExpense']> {
  const months = lastMonths(6);
  const [revenueRows, expenseRows] = await Promise.all([
    DealModel.aggregate<{ y: number; m: number; total: number }>([
      { $match: { stage: 'won' } },
      { $group: { _id: { y: { $year: '$updatedAt' }, m: { $month: '$updatedAt' } }, total: { $sum: '$value' } } },
      { $project: { _id: 0, y: '$_id.y', m: '$_id.m', total: 1 } },
    ]).exec(),
    ExpenseModel.aggregate<{ y: number; m: number; total: number }>([
      { $match: { status: { $in: SETTLED } } },
      { $group: { _id: { y: { $year: '$date' }, m: { $month: '$date' } }, total: { $sum: '$amount' } } },
      { $project: { _id: 0, y: '$_id.y', m: '$_id.m', total: 1 } },
    ]).exec(),
  ]);

  const revenueMap = new Map(revenueRows.map((r) => [`${r.y}-${r.m}`, r.total]));
  const expenseMap = new Map(expenseRows.map((r) => [`${r.y}-${r.m}`, r.total]));

  return months.map((mo) => ({
    month: mo.label,
    revenue: revenueMap.get(`${mo.year}-${mo.month}`) ?? 0,
    expenses: expenseMap.get(`${mo.year}-${mo.month}`) ?? 0,
  }));
}

async function recentActivity(): Promise<ActivityItem[]> {
  const [employees, deals, expenses] = await Promise.all([
    EmployeeModel.find().sort({ createdAt: -1 }).limit(3).exec(),
    DealModel.find().populate('customer', 'name').sort({ updatedAt: -1 }).limit(3).exec(),
    ExpenseModel.find().populate('employee', 'firstName lastName').sort({ createdAt: -1 }).limit(3).exec(),
  ]);

  const items: ActivityItem[] = [];
  for (const e of employees) {
    items.push({
      id: `emp-${e.id}`,
      actor: 'HR',
      action: 'onboarded',
      target: `${e.firstName} ${e.lastName}`.trim(),
      timestamp: e.createdAt.toISOString(),
      tone: 'info',
    });
  }
  for (const d of deals) {
    const customer = d.customer as unknown as { name?: string };
    items.push({
      id: `deal-${d.id}`,
      actor: 'Sales',
      action: d.stage === 'won' ? 'won deal' : 'updated deal',
      target: `${d.title}${customer?.name ? ` · ${customer.name}` : ''}`,
      timestamp: d.updatedAt.toISOString(),
      tone: d.stage === 'won' ? 'success' : 'primary',
    });
  }
  for (const x of expenses) {
    const emp = x.employee as unknown as { firstName?: string; lastName?: string };
    items.push({
      id: `exp-${x.id}`,
      actor: emp?.firstName ? `${emp.firstName} ${emp.lastName}`.trim() : 'Finance',
      action: 'filed expense',
      target: x.title,
      timestamp: x.createdAt.toISOString(),
      tone: 'warning',
    });
  }

  return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 6);
}

export const analyticsService = {
  async overview(): Promise<AnalyticsOverview> {
    const [
      revenueAgg,
      expenseAgg,
      employees,
      activeProjects,
      inventoryValueAgg,
      revenueExpense,
      expenseByCategoryRaw,
      dealsByStageRaw,
      employeesByDeptRaw,
      projectsByStatusRaw,
      inventoryByCategoryRaw,
      activity,
    ] = await Promise.all([
      DealModel.aggregate<{ total: number }>([
        { $match: { stage: 'won' } },
        { $group: { _id: null, total: { $sum: '$value' } } },
      ]).exec(),
      ExpenseModel.aggregate<{ total: number }>([
        { $match: { status: { $in: SETTLED } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).exec(),
      EmployeeModel.countDocuments({ status: 'active' }).exec(),
      ProjectModel.countDocuments({ status: 'active' }).exec(),
      InventoryItemModel.aggregate<{ total: number }>([
        { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$unitCost'] } } } },
      ]).exec(),
      monthlySeries(),
      ExpenseModel.aggregate<{ _id: string; value: number }>([
        { $match: { status: { $in: SETTLED } } },
        { $group: { _id: '$category', value: { $sum: '$amount' } } },
        { $sort: { value: -1 } },
      ]).exec(),
      DealModel.aggregate<{ _id: DealStage; value: number }>([
        { $group: { _id: '$stage', value: { $sum: 1 } } },
      ]).exec(),
      EmployeeModel.aggregate<{ _id: string; value: number }>([
        { $group: { _id: '$department', value: { $sum: 1 } } },
        { $sort: { value: -1 } },
      ]).exec(),
      ProjectModel.aggregate<{ _id: ProjectStatus; value: number }>([
        { $group: { _id: '$status', value: { $sum: 1 } } },
      ]).exec(),
      InventoryItemModel.aggregate<{ _id: string; value: number }>([
        { $group: { _id: '$category', value: { $sum: { $multiply: ['$quantity', '$unitCost'] } } } },
        { $sort: { value: -1 } },
      ]).exec(),
      recentActivity(),
    ]);

    const revenue = revenueAgg[0]?.total ?? 0;
    const expenses = expenseAgg[0]?.total ?? 0;
    const named = (rows: { _id: string; value: number }[]): NamedValue[] =>
      rows.map((r) => ({ name: r._id, value: Math.round(r.value * 100) / 100 }));

    return {
      kpis: {
        revenue: Math.round(revenue * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
        profit: Math.round((revenue - expenses) * 100) / 100,
        employees,
        activeProjects,
        inventoryValue: Math.round((inventoryValueAgg[0]?.total ?? 0) * 100) / 100,
      },
      revenueExpense,
      expenseByCategory: named(expenseByCategoryRaw),
      dealsByStage: dealsByStageRaw.map((r) => ({ name: DEAL_STAGE_LABELS[r._id] ?? r._id, value: r.value })),
      employeesByDepartment: named(employeesByDeptRaw),
      projectsByStatus: projectsByStatusRaw.map((r) => ({ name: PROJECT_STATUS_LABELS[r._id] ?? r._id, value: r.value })),
      inventoryByCategory: named(inventoryByCategoryRaw),
      recentActivity: activity,
    };
  },
};
