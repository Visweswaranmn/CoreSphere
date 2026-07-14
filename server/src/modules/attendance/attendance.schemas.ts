import { z } from 'zod';
import { AttendanceStatus } from '@coresphere/shared';
import { paginationQuerySchema } from '../../utils/pagination';
import { objectId } from '../employees/employee.schemas';

const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:mm format')
  .optional();

export const recordAttendanceSchema = z.object({
  employeeId: objectId,
  date: z.coerce.date(),
  status: z.nativeEnum(AttendanceStatus),
  checkIn: time,
  checkOut: time,
  note: z.string().trim().max(300).optional(),
});

export const listAttendanceQuerySchema = paginationQuerySchema.extend({
  employeeId: objectId.optional(),
  status: z.nativeEnum(AttendanceStatus).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const attendanceSummaryQuerySchema = z.object({
  employeeId: objectId.optional(),
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export type RecordAttendanceInput = z.infer<typeof recordAttendanceSchema>;
export type ListAttendanceQuery = z.infer<typeof listAttendanceQuerySchema>;
export type AttendanceSummaryQuery = z.infer<typeof attendanceSummaryQuerySchema>;
