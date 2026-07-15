import { type FilterQuery } from 'mongoose';
import { BudgetModel, type BudgetAttrs, type BudgetDoc, type BudgetHydrated } from './budget.model';
import type { ListBudgetsQuery } from './finance.schemas';

export const budgetRepository = {
  async findPaginated(query: ListBudgetsQuery): Promise<{ items: BudgetHydrated[]; total: number }> {
    const filter: FilterQuery<BudgetDoc> = {};
    if (query.category) filter.category = query.category;
    if (query.year) filter.year = query.year;

    const [items, total] = await Promise.all([
      BudgetModel.find(filter)
        .sort({ year: -1, month: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      BudgetModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  findById(id: string): Promise<BudgetHydrated | null> {
    return BudgetModel.findById(id).exec();
  },

  existsForPeriod(category: string, month: number, year: number): Promise<boolean> {
    return BudgetModel.exists({ category, month, year })
      .exec()
      .then((doc) => doc !== null);
  },

  create(attrs: BudgetAttrs): Promise<BudgetHydrated> {
    return BudgetModel.create(attrs);
  },

  async deleteById(id: string): Promise<boolean> {
    const res = await BudgetModel.findByIdAndDelete(id).exec();
    return res !== null;
  },
};
