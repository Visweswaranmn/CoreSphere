import { model, Schema, type HydratedDocument, type Model } from 'mongoose';
import type { OrgSettingsDto } from '@coresphere/shared';

export interface OrgSettingsAttrs {
  name: string;
  legalName?: string;
  email: string;
  phone?: string;
  address?: string;
  currency: string;
  timezone: string;
  fiscalYearStartMonth: number;
}

export interface OrgSettingsDoc extends OrgSettingsAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type OrgSettingsHydrated = HydratedDocument<OrgSettingsDoc>;

const settingsSchema = new Schema<OrgSettingsDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 160, default: 'CoreSphere Inc.' },
    legalName: { type: String, trim: true, maxlength: 200 },
    email: { type: String, required: true, trim: true, default: 'admin@coresphere.local' },
    phone: { type: String, trim: true },
    address: { type: String, trim: true, maxlength: 300 },
    currency: { type: String, required: true, default: 'USD' },
    timezone: { type: String, required: true, default: 'UTC' },
    fiscalYearStartMonth: { type: Number, required: true, min: 1, max: 12, default: 1 },
  },
  { timestamps: true },
);

export function toOrgSettingsDto(doc: OrgSettingsHydrated): OrgSettingsDto {
  return {
    name: doc.name,
    ...(doc.legalName ? { legalName: doc.legalName } : {}),
    email: doc.email,
    ...(doc.phone ? { phone: doc.phone } : {}),
    ...(doc.address ? { address: doc.address } : {}),
    currency: doc.currency,
    timezone: doc.timezone,
    fiscalYearStartMonth: doc.fiscalYearStartMonth,
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const OrgSettingsModel: Model<OrgSettingsDoc> = model<OrgSettingsDoc>('OrgSettings', settingsSchema);
