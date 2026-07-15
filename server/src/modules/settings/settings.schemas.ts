import { z } from 'zod';
import { CURRENCIES, TIMEZONES } from '@coresphere/shared';

const asTuple = <T extends readonly string[]>(v: T) => [...v] as unknown as [string, ...string[]];

export const updateSettingsSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  legalName: z.string().trim().max(200).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(300).optional(),
  currency: z.enum(asTuple(CURRENCIES)).optional(),
  timezone: z.enum(asTuple(TIMEZONES)).optional(),
  fiscalYearStartMonth: z.coerce.number().int().min(1).max(12).optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
