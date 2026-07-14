import { type FilterQuery, Types } from 'mongoose';
import type { LeaveStatus, LeaveType } from '@coresphere/shared';
import { LeaveModel, type LeaveAttrs, type LeaveDoc, type LeaveHydrated } from './leave.model';
import type { ListLeaveQuery } from './leave.schemas';

const EMPLOYEE_POPULATE = { path: 'employee', select: 'firstName lastName employeeCode' };
const REVIEWER_POPULATE = { path: 'reviewer', select: 'firstName lastName' };

export const leaveRepository = {
  async findPaginated(query: ListLeaveQuery): Promise<{ items: LeaveHydrated[]; total: number }> {
    const filter: FilterQuery<LeaveDoc> = {};
    if (query.employeeId) filter.employee = query.employeeId;
    if (query.status) filter.status = query.status;

    const [items, total] = await Promise.all([
      LeaveModel.find(filter)
        .populate(EMPLOYEE_POPULATE)
        .populate(REVIEWER_POPULATE)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      LeaveModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  findById(id: string): Promise<LeaveHydrated | null> {
    return LeaveModel.findById(id).populate(EMPLOYEE_POPULATE).populate(REVIEWER_POPULATE).exec();
  },

  async create(attrs: LeaveAttrs): Promise<LeaveHydrated> {
    const created = await LeaveModel.create(attrs);
    return created.populate(EMPLOYEE_POPULATE);
  },

  /** Sums leave days by type for a given employee/status within a date window. */
  async sumDaysByType(
    employeeId: string,
    status: LeaveStatus,
    yearStart: Date,
    yearEnd: Date,
  ): Promise<Record<string, number>> {
    const rows = await LeaveModel.aggregate<{ _id: LeaveType; days: number }>([
      {
        $match: {
          employee: new Types.ObjectId(employeeId),
          status,
          startDate: { $gte: yearStart, $lte: yearEnd },
        },
      },
      { $group: { _id: '$type', days: { $sum: '$days' } } },
    ]).exec();

    const result: Record<string, number> = {};
    for (const row of rows) result[row._id] = row.days;
    return result;
  },
};
