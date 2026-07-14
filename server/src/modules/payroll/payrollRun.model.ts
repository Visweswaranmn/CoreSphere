import { model, Schema, type HydratedDocument, type Model } from 'mongoose';
import {
  formatPeriod,
  type PayrollRunDto,
  type PayrollRunStatus as PayrollRunStatusType,
  PAYROLL_RUN_STATUSES,
  PayrollRunStatus,
} from '@coresphere/shared';

export interface PayrollRunAttrs {
  month: number;
  year: number;
  status: PayrollRunStatusType;
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  notes?: string;
  processedAt?: Date | null;
  paidAt?: Date | null;
}

export interface PayrollRunDoc extends PayrollRunAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type PayrollRunHydrated = HydratedDocument<PayrollRunDoc>;

const payrollRunSchema = new Schema<PayrollRunDoc>(
  {
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    status: {
      type: String,
      enum: PAYROLL_RUN_STATUSES,
      required: true,
      default: PayrollRunStatus.Draft,
      index: true,
    },
    employeeCount: { type: Number, required: true, default: 0 },
    totalGross: { type: Number, required: true, default: 0 },
    totalDeductions: { type: Number, required: true, default: 0 },
    totalNet: { type: Number, required: true, default: 0 },
    notes: { type: String, trim: true, maxlength: 300 },
    processedAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// One payroll run per calendar month.
payrollRunSchema.index({ year: 1, month: 1 }, { unique: true });

export function toPayrollRunDto(doc: PayrollRunHydrated): PayrollRunDto {
  return {
    id: doc.id as string,
    month: doc.month,
    year: doc.year,
    periodLabel: formatPeriod(doc.month, doc.year),
    status: doc.status,
    employeeCount: doc.employeeCount,
    totalGross: doc.totalGross,
    totalDeductions: doc.totalDeductions,
    totalNet: doc.totalNet,
    ...(doc.notes ? { notes: doc.notes } : {}),
    ...(doc.processedAt ? { processedAt: doc.processedAt.toISOString() } : {}),
    ...(doc.paidAt ? { paidAt: doc.paidAt.toISOString() } : {}),
    createdAt: doc.createdAt.toISOString(),
  };
}

export const PayrollRunModel: Model<PayrollRunDoc> = model<PayrollRunDoc>(
  'PayrollRun',
  payrollRunSchema,
);
