import { type FilterQuery } from 'mongoose';
import { ExpenseModel, type ExpenseAttrs, type ExpenseDoc, type ExpenseHydrated } from './expense.model';
import type { ListExpensesQuery } from './finance.schemas';

const EMPLOYEE_POPULATE = { path: 'employee', select: 'firstName lastName' };
const APPROVER_POPULATE = { path: 'approver', select: 'firstName lastName' };
const SETTLED = ['approved', 'reimbursed'];

function buildFilter(query: ListExpensesQuery): FilterQuery<ExpenseDoc> {
  const filter: FilterQuery<ExpenseDoc> = {};
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.employeeId) filter.employee = query.employeeId;
  if (query.search) {
    const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ code: rx }, { title: rx }];
  }
  return filter;
}

export const expenseRepository = {
  async findPaginated(query: ListExpensesQuery): Promise<{ items: ExpenseHydrated[]; total: number }> {
    const filter = buildFilter(query);
    const [items, total] = await Promise.all([
      ExpenseModel.find(filter)
        .populate(EMPLOYEE_POPULATE)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      ExpenseModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  findById(id: string): Promise<ExpenseHydrated | null> {
    return ExpenseModel.findById(id).populate(EMPLOYEE_POPULATE).populate(APPROVER_POPULATE).exec();
  },

  findByIdRaw(id: string): Promise<ExpenseHydrated | null> {
    return ExpenseModel.findById(id).exec();
  },

  create(attrs: ExpenseAttrs): Promise<ExpenseHydrated> {
    return ExpenseModel.create(attrs);
  },

  async deleteById(id: string): Promise<boolean> {
    const res = await ExpenseModel.findByIdAndDelete(id).exec();
    return res !== null;
  },

  async summary(): Promise<{
    pendingCount: number;
    pendingAmount: number;
    approvedAmount: number;
    reimbursedAmount: number;
    byCategory: { category: string; amount: number }[];
  }> {
    const [pending, approved, reimbursed, byCategoryRaw] = await Promise.all([
      ExpenseModel.aggregate<{ count: number; amount: number }>([
        { $match: { status: 'submitted' } },
        { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$amount' } } },
      ]).exec(),
      ExpenseModel.aggregate<{ amount: number }>([
        { $match: { status: 'approved' } },
        { $group: { _id: null, amount: { $sum: '$amount' } } },
      ]).exec(),
      ExpenseModel.aggregate<{ amount: number }>([
        { $match: { status: 'reimbursed' } },
        { $group: { _id: null, amount: { $sum: '$amount' } } },
      ]).exec(),
      ExpenseModel.aggregate<{ _id: string; amount: number }>([
        { $match: { status: { $in: SETTLED } } },
        { $group: { _id: '$category', amount: { $sum: '$amount' } } },
        { $sort: { amount: -1 } },
      ]).exec(),
    ]);

    return {
      pendingCount: pending[0]?.count ?? 0,
      pendingAmount: pending[0]?.amount ?? 0,
      approvedAmount: approved[0]?.amount ?? 0,
      reimbursedAmount: reimbursed[0]?.amount ?? 0,
      byCategory: byCategoryRaw.map((row) => ({ category: row._id, amount: row.amount })),
    };
  },

  /** Total settled (approved/reimbursed) spend for a category within a date range. */
  async spentInRange(category: string, from: Date, to: Date): Promise<number> {
    const rows = await ExpenseModel.aggregate<{ amount: number }>([
      { $match: { category, status: { $in: SETTLED }, date: { $gte: from, $lte: to } } },
      { $group: { _id: null, amount: { $sum: '$amount' } } },
    ]).exec();
    return rows[0]?.amount ?? 0;
  },
};
