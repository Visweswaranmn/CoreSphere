import { Router } from 'express';
import { Role } from '@coresphere/shared';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  attendanceSummaryQuerySchema,
  listAttendanceQuerySchema,
  recordAttendanceSchema,
} from './attendance.schemas';
import {
  getAttendanceSummary,
  listAttendance,
  recordAttendance,
} from './attendance.controller';

export const attendanceRouter: Router = Router();

attendanceRouter.use(authenticate, authorize(Role.HrManager));

attendanceRouter.get('/', validate({ query: listAttendanceQuerySchema }), listAttendance);
attendanceRouter.get(
  '/summary',
  validate({ query: attendanceSummaryQuerySchema }),
  getAttendanceSummary,
);
attendanceRouter.post('/', validate({ body: recordAttendanceSchema }), recordAttendance);
