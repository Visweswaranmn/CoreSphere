import type { AttendanceDto, AttendanceSummary } from '@coresphere/shared';
import { ApiError } from '../../utils/ApiError';
import { hoursBetween, toUtcDateOnly } from '../../utils/date';
import { employeeRepository } from '../employees/employee.repository';
import { attendanceRepository } from './attendance.repository';
import { toAttendanceDto, type AttendanceDoc } from './attendance.model';
import type {
  AttendanceSummaryQuery,
  ListAttendanceQuery,
  RecordAttendanceInput,
} from './attendance.schemas';

export const attendanceService = {
  async list(query: ListAttendanceQuery): Promise<{ items: AttendanceDto[]; total: number }> {
    const { items, total } = await attendanceRepository.findPaginated(query);
    return { items: items.map(toAttendanceDto), total };
  },

  async record(input: RecordAttendanceInput): Promise<AttendanceDto> {
    const employee = await employeeRepository.findById(input.employeeId);
    if (!employee) throw ApiError.badRequest('The selected employee does not exist');

    const update: Partial<AttendanceDoc> = {
      status: input.status,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      workedHours: hoursBetween(input.checkIn, input.checkOut),
      note: input.note,
    };

    const doc = await attendanceRepository.upsert(
      input.employeeId,
      toUtcDateOnly(input.date),
      update,
    );
    return toAttendanceDto(doc);
  },

  async summary(query: AttendanceSummaryQuery): Promise<AttendanceSummary> {
    if (query.from > query.to) {
      throw ApiError.badRequest("'from' date must be on or before 'to' date");
    }
    const from = toUtcDateOnly(query.from);
    const to = toUtcDateOnly(query.to);
    const counts = await attendanceRepository.summary({
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      from,
      to,
    });

    return {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
      present: counts.present,
      absent: counts.absent,
      late: counts.late,
      halfDay: counts.half_day,
      onLeave: counts.on_leave,
      totalRecords:
        counts.present + counts.absent + counts.late + counts.half_day + counts.on_leave,
    };
  },
};
