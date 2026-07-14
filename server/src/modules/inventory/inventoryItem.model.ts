import { model, Schema, type HydratedDocument, type Model } from 'mongoose';
import { type InventoryItemDto, isLowStock } from '@coresphere/shared';

export interface InventoryItemAttrs {
  code: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  warehouse: string;
}

export interface InventoryItemDoc extends InventoryItemAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type InventoryItemHydrated = HydratedDocument<InventoryItemDoc>;

const inventoryItemSchema = new Schema<InventoryItemDoc>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 160, index: true },
    category: { type: String, required: true, index: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    reorderLevel: { type: Number, required: true, default: 0, min: 0 },
    unitCost: { type: Number, required: true, default: 0, min: 0 },
    warehouse: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

export function toInventoryItemDto(doc: InventoryItemHydrated): InventoryItemDto {
  return {
    id: doc.id as string,
    code: doc.code,
    name: doc.name,
    category: doc.category,
    unit: doc.unit,
    quantity: doc.quantity,
    reorderLevel: doc.reorderLevel,
    unitCost: doc.unitCost,
    warehouse: doc.warehouse,
    stockValue: Math.round(doc.quantity * doc.unitCost * 100) / 100,
    lowStock: isLowStock(doc.quantity, doc.reorderLevel),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const InventoryItemModel: Model<InventoryItemDoc> = model<InventoryItemDoc>(
  'InventoryItem',
  inventoryItemSchema,
);
