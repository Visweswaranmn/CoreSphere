import { z } from 'zod';
import { INVENTORY_CATEGORIES, INVENTORY_UNITS, StockMovementType, WAREHOUSES } from '@coresphere/shared';
import { paginationQuerySchema } from '../../utils/pagination';

const enumOf = <T extends readonly string[]>(values: T) =>
  z.enum([...values] as unknown as [string, ...string[]]);

export const createItemSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required').max(160),
  category: enumOf(INVENTORY_CATEGORIES),
  unit: enumOf(INVENTORY_UNITS),
  quantity: z.coerce.number().min(0).default(0),
  reorderLevel: z.coerce.number().min(0).default(0),
  unitCost: z.coerce.number().min(0).default(0),
  warehouse: enumOf(WAREHOUSES),
});

export const updateItemSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  category: enumOf(INVENTORY_CATEGORIES).optional(),
  unit: enumOf(INVENTORY_UNITS).optional(),
  reorderLevel: z.coerce.number().min(0).optional(),
  unitCost: z.coerce.number().min(0).optional(),
  warehouse: enumOf(WAREHOUSES).optional(),
});

export const listItemsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  warehouse: z.string().trim().optional(),
  lowStock: z.enum(['true', 'false']).optional(),
});

export const movementSchema = z.object({
  type: z.nativeEnum(StockMovementType),
  quantity: z.coerce.number().positive('Quantity must be greater than zero'),
  reason: z.string().trim().max(300).optional(),
  reference: z.string().trim().max(100).optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>;
export type MovementInput = z.infer<typeof movementSchema>;
