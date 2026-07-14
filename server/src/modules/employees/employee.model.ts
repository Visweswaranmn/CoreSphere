import { model, Schema, type Types, type HydratedDocument, type Model } from 'mongoose';
import {
  type EmployeeDto,
  EMPLOYEE_STATUSES,
  EmployeeStatus,
  type EmploymentType,
  EMPLOYMENT_TYPES,
  type EmployeeStatus as EmployeeStatusType,
} from '@coresphere/shared';

export interface EmployeeAttrs {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  jobTitle: string;
  employmentType: EmploymentType;
  status: EmployeeStatusType;
  dateOfJoining: Date;
  location?: string;
  manager?: Types.ObjectId | null;
}

export interface EmployeeDoc extends EmployeeAttrs {
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
}

export type EmployeeHydrated = HydratedDocument<EmployeeDoc>;

const employeeSchema = new Schema<EmployeeDoc>(
  {
    employeeCode: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true, trim: true, maxlength: 60 },
    lastName: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    department: { type: String, required: true, index: true },
    jobTitle: { type: String, required: true, trim: true },
    employmentType: { type: String, enum: EMPLOYMENT_TYPES, required: true },
    status: {
      type: String,
      enum: EMPLOYEE_STATUSES,
      required: true,
      default: EmployeeStatus.Onboarding,
      index: true,
    },
    dateOfJoining: { type: Date, required: true },
    location: { type: String, trim: true },
    manager: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
  },
  { timestamps: true },
);

employeeSchema.virtual('fullName').get(function (this: EmployeeDoc) {
  return `${this.firstName} ${this.lastName}`.trim();
});

interface PopulatedManager {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
}

function managerName(manager: EmployeeDoc['manager']): string | undefined {
  if (manager && typeof manager === 'object' && 'firstName' in manager) {
    const m = manager as unknown as PopulatedManager;
    return `${m.firstName} ${m.lastName}`.trim();
  }
  return undefined;
}

function managerId(manager: EmployeeDoc['manager']): string | undefined {
  if (!manager) return undefined;
  if (typeof manager === 'object' && '_id' in manager) {
    return String((manager as unknown as PopulatedManager)._id);
  }
  return String(manager);
}

/** Maps a hydrated employee document to its public DTO. */
export function toEmployeeDto(doc: EmployeeHydrated): EmployeeDto {
  return {
    id: doc.id as string,
    employeeCode: doc.employeeCode,
    firstName: doc.firstName,
    lastName: doc.lastName,
    fullName: doc.fullName,
    email: doc.email,
    ...(doc.phone ? { phone: doc.phone } : {}),
    department: doc.department,
    jobTitle: doc.jobTitle,
    employmentType: doc.employmentType,
    status: doc.status,
    dateOfJoining: doc.dateOfJoining.toISOString(),
    ...(doc.location ? { location: doc.location } : {}),
    ...(managerId(doc.manager) ? { managerId: managerId(doc.manager) } : {}),
    ...(managerName(doc.manager) ? { managerName: managerName(doc.manager) } : {}),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const EmployeeModel: Model<EmployeeDoc> = model<EmployeeDoc>('Employee', employeeSchema);
