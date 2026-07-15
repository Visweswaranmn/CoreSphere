export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Australia/Sydney',
] as const;
export type Timezone = (typeof TIMEZONES)[number];

export interface OrgSettingsDto {
  name: string;
  legalName?: string;
  email: string;
  phone?: string;
  address?: string;
  currency: string;
  timezone: string;
  fiscalYearStartMonth: number;
  updatedAt: string;
}
