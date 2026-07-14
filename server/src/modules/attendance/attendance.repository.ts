import { type FilterQuery, Types } from 'mongoose';
import { AttendanceModel, type AttendanceDoc, type AttendanceHydrated } from './attendance.model';
import type { AttendanceStatus } from '@coresphere/shared';
import type { ListAttendanceQuery } from './attendance.schemas';

const POPULATE = { path: 'employee', select: 'firstName lastName employeeCode' };

function buildFilter(query: Partial<ListAttendanceQuery>): FilterQuery<AttendanceDoc> {
  const filter: FilterQuery<AttendanceDoc> = {};
  if (query.employeeId) filter.employee = query.employeeId;
  if (query.status) filter.status = query.status;
  if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = query.from;
    if (query.to) filter.date.$lte = query.to;
  }
  return filter;
}

export const attendanceRepository = {
  async findPaginated(
    query: ListAttendanceQuery,
  ): Promise<{ items: AttendanceHydrated[]; total: number }> {
    const filter = buildFilter(query);
    const [items, total] = await Promise.all([
      AttendanceModel.find(filter)
        .populate(POPULATE)
        .sort({ date: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      AttendanceModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  async upsert(
    employeeId: string,
    date: Date,
    update: Partial<AttendanceDoc>,
  ): Promise<AttendanceHydrated> {
    const doc = await AttendanceModel.findOneAndUpdate(
      { employee: employeeId, date },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
      .populate(POPULATE)
      .exec();
    return doc;
  },

  async summary(
    filter: { employeeId?: string; from: Date; to: Date },
  ): Promise<Record<AttendanceStatus, number>> {
    const match: FilterQuery<AttendanceDoc> = { date: { $gte: filter.from, $lte: filter.to } };
    if (filter.employeeId) match.employee = new Types.ObjectId(filter.employeeId);

    const rows = await AttendanceModel.aggregate<{ _id: AttendanceStatus; count: number }>([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).exec();

    const counts = { present: 0, absent: 0, late: 0, half_day: 0, on_leave: 0 };
    for (const row of rows) counts[row._id] = row.count;
    return counts;
  },
};
