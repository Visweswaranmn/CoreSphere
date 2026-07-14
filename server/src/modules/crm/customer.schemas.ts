import { z } from 'zod';
import { CustomerStatus, INDUSTRIES } from '@coresphere/shared';
import { paginationQuerySchema } from '../../utils/pagination';

const industryEnum = z.enum([...INDUSTRIES] as unknown as [string, ...string[]]);

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Account name is required').max(160),
  contactName: z.string().trim().max(120).optional(),
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  phone: z.string().trim().max(30).optional(),
  industry: industryEnum,
  status: z.nativeEnum(CustomerStatus).optional(),
  website: z.string().trim().max(200).optional(),
  address: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const listCustomersQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  status: z.nativeEnum(CustomerStatus).optional(),
  industry: z.string().trim().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>;
