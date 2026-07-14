import { type FilterQuery } from 'mongoose';
import { EmployeeModel, type EmployeeAttrs, type EmployeeDoc, type EmployeeHydrated } from './employee.model';
import type { ListEmployeesQuery } from './employee.schemas';

const SORT_MAP: Record<ListEmployeesQuery['sort'], Record<string, 1 | -1>> = {
  '-createdAt': { createdAt: -1 },
  createdAt: { createdAt: 1 },
  fullName: { firstName: 1, lastName: 1 },
  '-fullName': { firstName: -1, lastName: -1 },
  dateOfJoining: { dateOfJoining: 1 },
  '-dateOfJoining': { dateOfJoining: -1 },
};

function buildFilter(query: ListEmployeesQuery): FilterQuery<EmployeeDoc> {
  const filter: FilterQuery<EmployeeDoc> = {};
  if (query.department) filter.department = query.department;
  if (query.status) filter.status = query.status;
  if (query.employmentType) filter.employmentType = query.employmentType;

  if (query.search) {
    const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { firstName: rx },
      { lastName: rx },
      { email: rx },
      { employeeCode: rx },
      { jobTitle: rx },
    ];
  }
  return filter;
}

export const employeeRepository = {
  async findPaginated(query: ListEmployeesQuery): Promise<{ items: EmployeeHydrated[]; total: number }> {
    const filter = buildFilter(query);
    const [items, total] = await Promise.all([
      EmployeeModel.find(filter)
        .populate('manager', 'firstName lastName')
        .sort(SORT_MAP[query.sort])
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      EmployeeModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  findById(id: string): Promise<EmployeeHydrated | null> {
    return EmployeeModel.findById(id).populate('manager', 'firstName lastName').exec();
  },

  existsByEmail(email: string): Promise<boolean> {
    return EmployeeModel.exists({ email: email.toLowerCase() })
      .exec()
      .then((doc) => doc !== null);
  },

  async create(attrs: EmployeeAttrs): Promise<EmployeeHydrated> {
    const created = await EmployeeModel.create(attrs);
    return created.populate('manager', 'firstName lastName');
  },

  async deleteById(id: string): Promise<boolean> {
    const res = await EmployeeModel.findByIdAndDelete(id).exec();
    return res !== null;
  },

  /** Aggregated headcount stats for the HR overview. */
  async stats(): Promise<{
    total: number;
    active: number;
    onboarding: number;
    onLeave: number;
    byDepartment: { department: string; count: number }[];
  }> {
    const [total, active, onboarding, onLeave, byDepartmentRaw] = await Promise.all([
      EmployeeModel.countDocuments().exec(),
      EmployeeModel.countDocuments({ status: 'active' }).exec(),
      EmployeeModel.countDocuments({ status: 'onboarding' }).exec(),
      EmployeeModel.countDocuments({ status: 'on_leave' }).exec(),
      EmployeeModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).exec(),
    ]);
    return {
      total,
      active,
      onboarding,
      onLeave,
      byDepartment: byDepartmentRaw.map((d) => ({ department: d._id, count: d.count })),
    };
  },
};
