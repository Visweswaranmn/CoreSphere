import { model, Schema, type HydratedDocument, type Model } from 'mongoose';

export interface BudgetAttrs {
  name: string;
  category: string;
  month: number;
  year: number;
  amount: number;
}

export interface BudgetDoc extends BudgetAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type BudgetHydrated = HydratedDocument<BudgetDoc>;

const budgetSchema = new Schema<BudgetDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, required: true, index: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

// One budget per category per period.
budgetSchema.index({ category: 1, year: 1, month: 1 }, { unique: true });

export const BudgetModel: Model<BudgetDoc> = model<BudgetDoc>('Budget', budgetSchema);
