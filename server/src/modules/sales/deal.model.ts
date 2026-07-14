import { model, Schema, type HydratedDocument, type Model, type Types } from 'mongoose';
import {
  type DealDto,
  type DealStage as DealStageType,
  DEAL_STAGES,
  DEAL_STAGE_PROBABILITY,
  DealStage,
} from '@coresphere/shared';

export interface DealAttrs {
  code: string;
  title: string;
  customer: Types.ObjectId;
  value: number;
  stage: DealStageType;
  expectedCloseDate?: Date | null;
  notes?: string;
}

export interface DealDoc extends DealAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type DealHydrated = HydratedDocument<DealDoc>;

const dealSchema = new Schema<DealDoc>(
  {
    code: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    value: { type: Number, required: true, min: 0, default: 0 },
    stage: { type: String, enum: DEAL_STAGES, required: true, default: DealStage.Lead, index: true },
    expectedCloseDate: { type: Date, default: null },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

interface PopulatedCustomer {
  _id: Types.ObjectId;
  name: string;
}

export function toDealDto(doc: DealHydrated): DealDto {
  const customer = doc.customer as unknown as PopulatedCustomer;
  const probability = DEAL_STAGE_PROBABILITY[doc.stage];
  return {
    id: doc.id as string,
    code: doc.code,
    title: doc.title,
    customerId: String(customer._id ?? doc.customer),
    customerName: customer.name ?? 'Unknown customer',
    value: doc.value,
    stage: doc.stage,
    probability,
    weightedValue: Math.round(doc.value * (probability / 100) * 100) / 100,
    ...(doc.expectedCloseDate
      ? { expectedCloseDate: doc.expectedCloseDate.toISOString().slice(0, 10) }
      : {}),
    ...(doc.notes ? { notes: doc.notes } : {}),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const DealModel: Model<DealDoc> = model<DealDoc>('Deal', dealSchema);
