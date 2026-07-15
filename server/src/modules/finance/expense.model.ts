import { model, Schema, type HydratedDocument, type Model, type Types } from 'mongoose';
import {
  type ExpenseDto,
  type ExpenseStatus as ExpenseStatusType,
  EXPENSE_STATUSES,
  ExpenseStatus,
} from '@coresphere/shared';

export interface ExpenseAttrs {
  code: string;
  title: string;
  category: string;
  amount: number;
  date: Date;
  employee: Types.ObjectId;
  status: ExpenseStatusType;
  description?: string;
  approver?: Types.ObjectId | null;
  decisionNote?: string;
  decidedAt?: Date | null;
  reimbursedAt?: Date | null;
}

export interface ExpenseDoc extends ExpenseAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type ExpenseHydrated = HydratedDocument<ExpenseDoc>;

const expenseSchema = new Schema<ExpenseDoc>(
  {
    code: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, index: true },
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    status: {
      type: String,
      enum: EXPENSE_STATUSES,
      required: true,
      default: ExpenseStatus.Draft,
      index: true,
    },
    description: { type: String, trim: true, maxlength: 1000 },
    approver: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    decisionNote: { type: String, trim: true, maxlength: 500 },
    decidedAt: { type: Date, default: null },
    reimbursedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

interface PopulatedEmployee {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
}
interface PopulatedApprover {
  firstName: string;
  lastName: string;
}

export function toExpenseDto(doc: ExpenseHydrated): ExpenseDto {
  const employee = doc.employee as unknown as PopulatedEmployee;
  const approver =
    doc.approver && typeof doc.approver === 'object' && 'firstName' in doc.approver
      ? (doc.approver as unknown as PopulatedApprover)
      : undefined;

  return {
    id: doc.id as string,
    code: doc.code,
    title: doc.title,
    category: doc.category,
    amount: doc.amount,
    date: doc.date.toISOString().slice(0, 10),
    employeeId: String(employee._id ?? doc.employee),
    employeeName: employee.firstName ? `${employee.firstName} ${employee.lastName}`.trim() : 'Unknown',
    status: doc.status,
    ...(doc.description ? { description: doc.description } : {}),
    ...(approver ? { approverName: `${approver.firstName} ${approver.lastName}`.trim() } : {}),
    ...(doc.decisionNote ? { decisionNote: doc.decisionNote } : {}),
    ...(doc.decidedAt ? { decidedAt: doc.decidedAt.toISOString() } : {}),
    ...(doc.reimbursedAt ? { reimbursedAt: doc.reimbursedAt.toISOString() } : {}),
    createdAt: doc.createdAt.toISOString(),
  };
}

export const ExpenseModel: Model<ExpenseDoc> = model<ExpenseDoc>('Expense', expenseSchema);
