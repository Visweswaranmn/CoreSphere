import { type FilterQuery } from 'mongoose';
import { PayslipModel, type PayslipAttrs, type PayslipDoc, type PayslipHydrated } from './payslip.model';
import type { ListPayslipsQuery } from './payroll.schemas';

const EMPLOYEE_POPULATE = {
  path: 'employee',
  select: 'firstName lastName employeeCode department',
};

export const payslipRepository = {
  async findPaginated(query: ListPayslipsQuery): Promise<{ items: PayslipHydrated[]; total: number }> {
    const filter: FilterQuery<PayslipDoc> = {};
    if (query.runId) filter.run = query.runId;
    if (query.employeeId) filter.employee = query.employeeId;

    const [items, total] = await Promise.all([
      PayslipModel.find(filter)
        .populate(EMPLOYEE_POPULATE)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      PayslipModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  findById(id: string): Promise<PayslipHydrated | null> {
    return PayslipModel.findById(id).populate(EMPLOYEE_POPULATE).exec();
  },

  deleteByRun(runId: string): Promise<unknown> {
    return PayslipModel.deleteMany({ run: runId }).exec();
  },

  updateStatusByRun(runId: string, status: PayslipDoc['status']): Promise<unknown> {
    return PayslipModel.updateMany({ run: runId }, { $set: { status } }).exec();
  },

  insertMany(payslips: PayslipAttrs[]): Promise<unknown> {
    return PayslipModel.insertMany(payslips);
  },
};
