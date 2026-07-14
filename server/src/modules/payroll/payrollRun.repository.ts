import { type FilterQuery } from 'mongoose';
import { PayrollRunModel, type PayrollRunDoc, type PayrollRunHydrated } from './payrollRun.model';
import type { ListRunsQuery } from './payroll.schemas';

export const payrollRunRepository = {
  async findPaginated(query: ListRunsQuery): Promise<{ items: PayrollRunHydrated[]; total: number }> {
    const filter: FilterQuery<PayrollRunDoc> = {};
    if (query.status) filter.status = query.status;

    const [items, total] = await Promise.all([
      PayrollRunModel.find(filter)
        .sort({ year: -1, month: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      PayrollRunModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  findById(id: string): Promise<PayrollRunHydrated | null> {
    return PayrollRunModel.findById(id).exec();
  },

  existsForPeriod(month: number, year: number): Promise<boolean> {
    return PayrollRunModel.exists({ month, year })
      .exec()
      .then((doc) => doc !== null);
  },

  create(attrs: Partial<PayrollRunDoc>): Promise<PayrollRunHydrated> {
    return PayrollRunModel.create(attrs);
  },
};
