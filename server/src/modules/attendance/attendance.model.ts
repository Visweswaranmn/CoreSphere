import { model, Schema, type Types, type HydratedDocument, type Model } from 'mongoose';
import {
  type AttendanceDto,
  type AttendanceStatus as AttendanceStatusType,
  ATTENDANCE_STATUSES,
} from '@coresphere/shared';

export interface AttendanceAttrs {
  employee: Types.ObjectId;
  date: Date;
  status: AttendanceStatusType;
  checkIn?: string;
  checkOut?: string;
  workedHours?: number;
  note?: string;
}

export interface AttendanceDoc extends AttendanceAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type AttendanceHydrated = HydratedDocument<AttendanceDoc>;

const attendanceSchema = new Schema<AttendanceDoc>(
  {
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    date: { type: Date, required: true, index: true },
    status: { type: String, enum: ATTENDANCE_STATUSES, required: true },
    checkIn: { type: String },
    checkOut: { type: String },
    workedHours: { type: Number, min: 0, max: 24 },
    note: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true },
);

// One attendance record per employee per day.
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

interface PopulatedEmployee {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  employeeCode: string;
}

export function toAttendanceDto(doc: AttendanceHydrated): AttendanceDto {
  const employee = doc.employee as unknown as PopulatedEmployee;
  return {
    id: doc.id as string,
    employeeId: String(employee._id),
    employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
    employeeCode: employee.employeeCode,
    date: doc.date.toISOString().slice(0, 10),
    status: doc.status,
    ...(doc.checkIn ? { checkIn: doc.checkIn } : {}),
    ...(doc.checkOut ? { checkOut: doc.checkOut } : {}),
    ...(doc.workedHours != null ? { workedHours: doc.workedHours } : {}),
    ...(doc.note ? { note: doc.note } : {}),
    createdAt: doc.createdAt.toISOString(),
  };
}

export const AttendanceModel: Model<AttendanceDoc> = model<AttendanceDoc>(
  'Attendance',
  attendanceSchema,
);
