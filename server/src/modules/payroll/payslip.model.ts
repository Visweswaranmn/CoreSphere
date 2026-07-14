import { model, Schema, type HydratedDocument, type Model, type Types } from 'mongoose';
import {
  formatPeriod,
  type PayslipDto,
  type PayrollRunStatus as PayrollRunStatusType,
  PAYROLL_RUN_STATUSES,
  type SalaryComponent,
} from '@coresphere/shared';

export interface PayslipAttrs {
  run: Types.ObjectId;
  employee: Types.ObjectId;
  month: number;
  year: number;
  basicSalary: number;
  allowances: SalaryComponent[];
  deductions: SalaryComponent[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  status: PayrollRunStatusType;
}

export interface PayslipDoc extends PayslipAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type PayslipHydrated = HydratedDocument<PayslipDoc>;

const componentSchema = new Schema<SalaryComponent>(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false },
);

const payslipSchema = new Schema<PayslipDoc>(
  {
    run: { type: Schema.Types.ObjectId, ref: 'PayrollRun', required: true, index: true },
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    allowances: { type: [componentSchema], default: [] },
    deductions: { type: [componentSchema], default: [] },
    grossPay: { type: Number, required: true },
    totalDeductions: { type: Number, required: true },
    netPay: { type: Number, required: true },
    status: { type: String, enum: PAYROLL_RUN_STATUSES, required: true },
  },
  { timestamps: true },
);

payslipSchema.index({ run: 1, employee: 1 }, { unique: true });

interface PopulatedEmployee {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  employeeCode: string;
  department: string;
}

export function toPayslipDto(doc: PayslipHydrated): PayslipDto {
  const employee = doc.employee as unknown as PopulatedEmployee;
  return {
    id: doc.id as string,
    runId: String(doc.run),
    employeeId: String(employee._id),
    employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
    employeeCode: employee.employeeCode,
    department: employee.department,
    month: doc.month,
    year: doc.year,
    periodLabel: formatPeriod(doc.month, doc.year),
    basicSalary: doc.basicSalary,
    allowances: doc.allowances.map((a) => ({ name: a.name, amount: a.amount })),
    deductions: doc.deductions.map((d) => ({ name: d.name, amount: d.amount })),
    grossPay: doc.grossPay,
    totalDeductions: doc.totalDeductions,
    netPay: doc.netPay,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
  };
}

export const PayslipModel: Model<PayslipDoc> = model<PayslipDoc>('Payslip', payslipSchema);
