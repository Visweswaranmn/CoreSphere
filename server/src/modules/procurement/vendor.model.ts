import { model, Schema, type HydratedDocument, type Model } from 'mongoose';
import {
  type VendorDto,
  type VendorStatus as VendorStatusType,
  VENDOR_STATUSES,
  VendorStatus,
} from '@coresphere/shared';

export interface VendorAttrs {
  code: string;
  name: string;
  contactName?: string;
  email: string;
  phone?: string;
  address?: string;
  category: string;
  status: VendorStatusType;
  taxId?: string;
  website?: string;
  notes?: string;
}

export interface VendorDoc extends VendorAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type VendorHydrated = HydratedDocument<VendorDoc>;

const vendorSchema = new Schema<VendorDoc>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 160, index: true },
    contactName: { type: String, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true, maxlength: 300 },
    category: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: VENDOR_STATUSES,
      required: true,
      default: VendorStatus.Pending,
      index: true,
    },
    taxId: { type: String, trim: true },
    website: { type: String, trim: true },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

export function toVendorDto(doc: VendorHydrated): VendorDto {
  return {
    id: doc.id as string,
    code: doc.code,
    name: doc.name,
    ...(doc.contactName ? { contactName: doc.contactName } : {}),
    email: doc.email,
    ...(doc.phone ? { phone: doc.phone } : {}),
    ...(doc.address ? { address: doc.address } : {}),
    category: doc.category,
    status: doc.status,
    ...(doc.taxId ? { taxId: doc.taxId } : {}),
    ...(doc.website ? { website: doc.website } : {}),
    ...(doc.notes ? { notes: doc.notes } : {}),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const VendorModel: Model<VendorDoc> = model<VendorDoc>('Vendor', vendorSchema);
