import { model, Schema, type HydratedDocument, type Model } from 'mongoose';
import {
  type CustomerDto,
  type CustomerStatus as CustomerStatusType,
  CUSTOMER_STATUSES,
  CustomerStatus,
} from '@coresphere/shared';

export interface CustomerAttrs {
  code: string;
  name: string;
  contactName?: string;
  email: string;
  phone?: string;
  industry: string;
  status: CustomerStatusType;
  website?: string;
  address?: string;
  notes?: string;
}

export interface CustomerDoc extends CustomerAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type CustomerHydrated = HydratedDocument<CustomerDoc>;

const customerSchema = new Schema<CustomerDoc>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 160, index: true },
    contactName: { type: String, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    industry: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: CUSTOMER_STATUSES,
      required: true,
      default: CustomerStatus.Prospect,
      index: true,
    },
    website: { type: String, trim: true },
    address: { type: String, trim: true, maxlength: 300 },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

export function toCustomerDto(doc: CustomerHydrated): CustomerDto {
  return {
    id: doc.id as string,
    code: doc.code,
    name: doc.name,
    ...(doc.contactName ? { contactName: doc.contactName } : {}),
    email: doc.email,
    ...(doc.phone ? { phone: doc.phone } : {}),
    industry: doc.industry,
    status: doc.status,
    ...(doc.website ? { website: doc.website } : {}),
    ...(doc.address ? { address: doc.address } : {}),
    ...(doc.notes ? { notes: doc.notes } : {}),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const CustomerModel: Model<CustomerDoc> = model<CustomerDoc>('Customer', customerSchema);
