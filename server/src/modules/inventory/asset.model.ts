import { model, Schema, type HydratedDocument, type Model, type Types } from 'mongoose';
import {
  type AssetDto,
  type AssetStatus as AssetStatusType,
  ASSET_STATUSES,
  AssetStatus,
} from '@coresphere/shared';

export interface AssetAttrs {
  code: string;
  name: string;
  category: string;
  serialNumber?: string;
  purchaseDate?: Date | null;
  purchaseCost?: number | null;
  status: AssetStatusType;
  assignedTo?: Types.ObjectId | null;
  assignedAt?: Date | null;
  location?: string;
  notes?: string;
}

export interface AssetDoc extends AssetAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type AssetHydrated = HydratedDocument<AssetDoc>;

const assetSchema = new Schema<AssetDoc>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 160, index: true },
    category: { type: String, required: true, index: true },
    serialNumber: { type: String, trim: true, maxlength: 120 },
    purchaseDate: { type: Date, default: null },
    purchaseCost: { type: Number, min: 0, default: null },
    status: {
      type: String,
      enum: ASSET_STATUSES,
      required: true,
      default: AssetStatus.Available,
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    assignedAt: { type: Date, default: null },
    location: { type: String, trim: true, maxlength: 160 },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

interface PopulatedEmployee {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
}

export function toAssetDto(doc: AssetHydrated): AssetDto {
  const assignee =
    doc.assignedTo && typeof doc.assignedTo === 'object' && 'firstName' in doc.assignedTo
      ? (doc.assignedTo as unknown as PopulatedEmployee)
      : undefined;

  return {
    id: doc.id as string,
    code: doc.code,
    name: doc.name,
    category: doc.category,
    ...(doc.serialNumber ? { serialNumber: doc.serialNumber } : {}),
    ...(doc.purchaseDate ? { purchaseDate: doc.purchaseDate.toISOString().slice(0, 10) } : {}),
    ...(doc.purchaseCost != null ? { purchaseCost: doc.purchaseCost } : {}),
    status: doc.status,
    ...(assignee
      ? { assignedToId: String(assignee._id), assignedToName: `${assignee.firstName} ${assignee.lastName}`.trim() }
      : {}),
    ...(doc.assignedAt ? { assignedAt: doc.assignedAt.toISOString() } : {}),
    ...(doc.location ? { location: doc.location } : {}),
    ...(doc.notes ? { notes: doc.notes } : {}),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const AssetModel: Model<AssetDoc> = model<AssetDoc>('Asset', assetSchema);
