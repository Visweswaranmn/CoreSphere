import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/respond';
import { buildPaginated } from '../../utils/pagination';
import { attendanceService } from './attendance.service';
import type {
  AttendanceSummaryQuery,
  ListAttendanceQuery,
  RecordAttendanceInput,
} from './attendance.schemas';

export const listAttendance = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListAttendanceQuery;
  const { items, total } = await attendanceService.list(query);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const recordAttendance = asyncHandler(async (req: Request, res: Response) => {
  const record = await attendanceService.record(req.body as RecordAttendanceInput);
  return sendSuccess(res, record, 201, 'Attendance recorded');
});

export const getAttendanceSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await attendanceService.summary(req.query as unknown as AttendanceSummaryQuery);
  return sendSuccess(res, summary);
});
