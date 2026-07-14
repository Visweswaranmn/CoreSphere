export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Education',
  'Real Estate',
  'Media',
  'Energy',
  'Other',
] as const;
export type Industry = (typeof INDUSTRIES)[number];

export const CustomerStatus = {
  Prospect: 'prospect',
  Active: 'active',
  Inactive: 'inactive',
} as const;
export type CustomerStatus = (typeof CustomerStatus)[keyof typeof CustomerStatus];
export const CUSTOMER_STATUSES: readonly CustomerStatus[] = Object.values(CustomerStatus);
export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  [CustomerStatus.Prospect]: 'Prospect',
  [CustomerStatus.Active]: 'Active',
  [CustomerStatus.Inactive]: 'Inactive',
};

export interface CustomerDto {
  id: string;
  code: string;
  name: string;
  contactName?: string;
  email: string;
  phone?: string;
  industry: string;
  status: CustomerStatus;
  website?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerStats {
  total: number;
  active: number;
  prospect: number;
}
