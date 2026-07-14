import { z } from 'zod';
import { PurchaseOrderStatus, VENDOR_CATEGORIES, VendorStatus } from '@coresphere/shared';
import { paginationQuerySchema } from '../../utils/pagination';
import { objectId } from '../employees/employee.schemas';

const categoryEnum = z.enum([...VENDOR_CATEGORIES] as unknown as [string, ...string[]]);

// ─── Vendors ─────────────────────────────────────────────────────────────────
export const createVendorSchema = z.object({
  name: z.string().trim().min(1, 'Vendor name is required').max(160),
  contactName: z.string().trim().max(120).optional(),
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(300).optional(),
  category: categoryEnum,
  taxId: z.string().trim().max(50).optional(),
  website: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const updateVendorSchema = createVendorSchema.partial();

export const vendorStatusSchema = z.object({ status: z.nativeEnum(VendorStatus) });

export const listVendorsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  status: z.nativeEnum(VendorStatus).optional(),
  category: z.string().trim().optional(),
});

// ─── Purchase orders ─────────────────────────────────────────────────────────
const itemSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required').max(160),
  quantity: z.coerce.number().positive('Quantity must be greater than zero'),
  unitPrice: z.coerce.number().min(0, 'Unit price must be zero or more'),
});

export const createOrderSchema = z.object({
  vendorId: objectId,
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(1000).optional(),
  items: z.array(itemSchema).min(1, 'Add at least one item').max(50),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  expectedDate: z.coerce.date().optional(),
});

export const updateOrderSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  items: z.array(itemSchema).min(1).max(50).optional(),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  expectedDate: z.coerce.date().nullable().optional(),
});

export const orderDecisionSchema = z.object({
  status: z
    .nativeEnum(PurchaseOrderStatus)
    .refine((s) => s === PurchaseOrderStatus.Approved || s === PurchaseOrderStatus.Rejected, {
      message: 'Decision must be approve or reject',
    }),
  note: z.string().trim().max(500).optional(),
});

export const listOrdersQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  status: z.nativeEnum(PurchaseOrderStatus).optional(),
  vendorId: objectId.optional(),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
export type VendorStatusInput = z.infer<typeof vendorStatusSchema>;
export type ListVendorsQuery = z.infer<typeof listVendorsQuerySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type OrderDecisionInput = z.infer<typeof orderDecisionSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
