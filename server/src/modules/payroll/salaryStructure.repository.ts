import {
  SalaryStructureModel,
  type SalaryStructureAttrs,
  type SalaryStructureHydrated,
} from './salaryStructure.model';

const EMPLOYEE_POPULATE = {
  path: 'employee',
  select: 'firstName lastName employeeCode department status',
};

export const salaryStructureRepository = {
  async findPaginated(
    page: number,
    pageSize: number,
  ): Promise<{ items: SalaryStructureHydrated[]; total: number }> {
    const [items, total] = await Promise.all([
      SalaryStructureModel.find()
        .populate(EMPLOYEE_POPULATE)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      SalaryStructureModel.countDocuments().exec(),
    ]);
    return { items, total };
  },

  findByEmployee(employeeId: string): Promise<SalaryStructureHydrated | null> {
    return SalaryStructureModel.findOne({ employee: employeeId })
      .populate(EMPLOYEE_POPULATE)
      .exec();
  },

  async upsert(
    employeeId: string,
    attrs: Omit<SalaryStructureAttrs, 'employee'>,
  ): Promise<SalaryStructureHydrated> {
    const doc = await SalaryStructureModel.findOneAndUpdate(
      { employee: employeeId },
      { $set: attrs },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
      .populate(EMPLOYEE_POPULATE)
      .exec();
    return doc;
  },

  /** All structures with the employee populated, for payroll processing. */
  findAllForProcessing(): Promise<SalaryStructureHydrated[]> {
    return SalaryStructureModel.find().populate(EMPLOYEE_POPULATE).exec();
  },
};
