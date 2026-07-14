import { model, Schema, type HydratedDocument, type Model, type Types } from 'mongoose';
import {
  type StockMovementDto,
  type StockMovementType as MovementType,
  STOCK_MOVEMENT_TYPES,
} from '@coresphere/shared';

export interface StockMovementAttrs {
  item: Types.ObjectId;
  type: MovementType;
  quantity: number;
  resultingQuantity: number;
  reason?: string;
  reference?: string;
  by?: Types.ObjectId | null;
}

export interface StockMovementDoc extends StockMovementAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type StockMovementHydrated = HydratedDocument<StockMovementDoc>;

const stockMovementSchema = new Schema<StockMovementDoc>(
  {
    item: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true, index: true },
    type: { type: String, enum: STOCK_MOVEMENT_TYPES, required: true },
    quantity: { type: Number, required: true },
    resultingQuantity: { type: Number, required: true },
    reason: { type: String, trim: true, maxlength: 300 },
    reference: { type: String, trim: true, maxlength: 100 },
    by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

interface PopulatedUser {
  firstName: string;
  lastName: string;
}

export function toStockMovementDto(doc: StockMovementHydrated): StockMovementDto {
  const by =
    doc.by && typeof doc.by === 'object' && 'firstName' in doc.by
      ? (doc.by as unknown as PopulatedUser)
      : undefined;
  return {
    id: doc.id as string,
    itemId: String(doc.item),
    type: doc.type,
    quantity: doc.quantity,
    resultingQuantity: doc.resultingQuantity,
    ...(doc.reason ? { reason: doc.reason } : {}),
    ...(doc.reference ? { reference: doc.reference } : {}),
    ...(by ? { byName: `${by.firstName} ${by.lastName}`.trim() } : {}),
    createdAt: doc.createdAt.toISOString(),
  };
}

export const StockMovementModel: Model<StockMovementDoc> = model<StockMovementDoc>(
  'StockMovement',
  stockMovementSchema,
);
