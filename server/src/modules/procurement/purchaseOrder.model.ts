import { model, Schema, type Types, type HydratedDocument, type Model } from 'mongoose';
import {
  type PurchaseOrderDto,
  type PurchaseOrderItem,
  type PurchaseOrderStatus as POStatusType,
  PURCHASE_ORDER_STATUSES,
  PurchaseOrderStatus,
} from '@coresphere/shared';

export interface PurchaseOrderAttrs {
  code: string;
  vendor: Types.ObjectId;
  title: string;
  description?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: POStatusType;
  expectedDate?: Date | null;
  approver?: Types.ObjectId | null;
  decisionNote?: string;
  decidedAt?: Date | null;
}

export interface PurchaseOrderDoc extends PurchaseOrderAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type PurchaseOrderHydrated = HydratedDocument<PurchaseOrderDoc>;

const itemSchema = new Schema<PurchaseOrderItem>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const purchaseOrderSchema = new Schema<PurchaseOrderDoc>(
  {
    code: { type: String, required: true, unique: true, index: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 },
    items: { type: [itemSchema], default: [] },
    subtotal: { type: Number, required: true, default: 0 },
    taxRate: { type: Number, required: true, default: 0, min: 0, max: 100 },
    taxAmount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: PURCHASE_ORDER_STATUSES,
      required: true,
      default: PurchaseOrderStatus.Draft,
      index: true,
    },
    expectedDate: { type: Date, default: null },
    approver: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    decisionNote: { type: String, trim: true, maxlength: 500 },
    decidedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

interface PopulatedVendor {
  _id: Types.ObjectId;
  name: string;
}
interface PopulatedApprover {
  firstName: string;
  lastName: string;
}

export function toPurchaseOrderDto(doc: PurchaseOrderHydrated): PurchaseOrderDto {
  const vendor = doc.vendor as unknown as PopulatedVendor;
  const approver =
    doc.approver && typeof doc.approver === 'object' && 'firstName' in doc.approver
      ? (doc.approver as unknown as PopulatedApprover)
      : undefined;

  return {
    id: doc.id as string,
    code: doc.code,
    vendorId: String(vendor._id ?? doc.vendor),
    vendorName: vendor.name ?? 'Unknown vendor',
    title: doc.title,
    ...(doc.description ? { description: doc.description } : {}),
    items: doc.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      amount: i.amount,
    })),
    subtotal: doc.subtotal,
    taxRate: doc.taxRate,
    taxAmount: doc.taxAmount,
    total: doc.total,
    status: doc.status,
    ...(doc.expectedDate ? { expectedDate: doc.expectedDate.toISOString().slice(0, 10) } : {}),
    ...(approver ? { approverName: `${approver.firstName} ${approver.lastName}`.trim() } : {}),
    ...(doc.decisionNote ? { decisionNote: doc.decisionNote } : {}),
    ...(doc.decidedAt ? { decidedAt: doc.decidedAt.toISOString() } : {}),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const PurchaseOrderModel: Model<PurchaseOrderDoc> = model<PurchaseOrderDoc>(
  'PurchaseOrder',
  purchaseOrderSchema,
);
