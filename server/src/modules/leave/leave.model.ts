import { model, Schema, type Types, type HydratedDocument, type Model } from 'mongoose';
import {
  type LeaveRequestDto,
  type LeaveStatus as LeaveStatusType,
  type LeaveType as LeaveTypeValue,
  LEAVE_STATUSES,
  LeaveStatus,
  LEAVE_TYPES,
} from '@coresphere/shared';

export interface LeaveAttrs {
  employee: Types.ObjectId;
  type: LeaveTypeValue;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: LeaveStatusType;
  reviewer?: Types.ObjectId | null;
  decisionNote?: string;
  decidedAt?: Date | null;
}

export interface LeaveDoc extends LeaveAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type LeaveHydrated = HydratedDocument<LeaveDoc>;

const leaveSchema = new Schema<LeaveDoc>(
  {
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    type: { type: String, enum: LEAVE_TYPES, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    status: { type: String, enum: LEAVE_STATUSES, required: true, default: LeaveStatus.Pending, index: true },
    reviewer: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    decisionNote: { type: String, trim: true, maxlength: 500 },
    decidedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

interface PopulatedEmployee {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  employeeCode: string;
}

interface PopulatedReviewer {
  firstName: string;
  lastName: string;
}

export function toLeaveDto(doc: LeaveHydrated): LeaveRequestDto {
  const employee = doc.employee as unknown as PopulatedEmployee;
  const reviewer =
    doc.reviewer && typeof doc.reviewer === 'object' && 'firstName' in doc.reviewer
      ? (doc.reviewer as unknown as PopulatedReviewer)
      : undefined;

  return {
    id: doc.id as string,
    employeeId: String(employee._id),
    employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
    employeeCode: employee.employeeCode,
    type: doc.type,
    startDate: doc.startDate.toISOString().slice(0, 10),
    endDate: doc.endDate.toISOString().slice(0, 10),
    days: doc.days,
    reason: doc.reason,
    status: doc.status,
    ...(reviewer ? { reviewerName: `${reviewer.firstName} ${reviewer.lastName}`.trim() } : {}),
    ...(doc.decisionNote ? { decisionNote: doc.decisionNote } : {}),
    ...(doc.decidedAt ? { decidedAt: doc.decidedAt.toISOString() } : {}),
    createdAt: doc.createdAt.toISOString(),
  };
}

export const LeaveModel: Model<LeaveDoc> = model<LeaveDoc>('LeaveRequest', leaveSchema);
