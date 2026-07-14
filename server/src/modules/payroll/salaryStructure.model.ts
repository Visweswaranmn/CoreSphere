import { model, Schema, type HydratedDocument, type Model, type Types } from 'mongoose';
import { computePay, type SalaryComponent, type SalaryStructureDto } from '@coresphere/shared';

export interface SalaryStructureAttrs {
  employee: Types.ObjectId;
  basicSalary: number;
  allowances: SalaryComponent[];
  deductions: SalaryComponent[];
  effectiveFrom: Date;
}

export interface SalaryStructureDoc extends SalaryStructureAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type SalaryStructureHydrated = HydratedDocument<SalaryStructureDoc>;

const componentSchema = new Schema<SalaryComponent>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const salaryStructureSchema = new Schema<SalaryStructureDoc>(
  {
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, unique: true, index: true },
    basicSalary: { type: Number, required: true, min: 0 },
    allowances: { type: [componentSchema], default: [] },
    deductions: { type: [componentSchema], default: [] },
    effectiveFrom: { type: Date, required: true },
  },
  { timestamps: true },
);

interface PopulatedEmployee {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  employeeCode: string;
  department: string;
}

export function toSalaryStructureDto(doc: SalaryStructureHydrated): SalaryStructureDto {
  const employee = doc.employee as unknown as PopulatedEmployee;
  const allowances = doc.allowances.map((a) => ({ name: a.name, amount: a.amount }));
  const deductions = doc.deductions.map((d) => ({ name: d.name, amount: d.amount }));
  const { grossPay, totalDeductions, netPay } = computePay(doc.basicSalary, allowances, deductions);

  return {
    id: doc.id as string,
    employeeId: String(employee._id),
    employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
    employeeCode: employee.employeeCode,
    department: employee.department,
    basicSalary: doc.basicSalary,
    allowances,
    deductions,
    grossPay,
    totalDeductions,
    netPay,
    effectiveFrom: doc.effectiveFrom.toISOString().slice(0, 10),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const SalaryStructureModel: Model<SalaryStructureDoc> = model<SalaryStructureDoc>(
  'SalaryStructure',
  salaryStructureSchema,
);
