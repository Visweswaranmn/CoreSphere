import { z } from 'zod';
import { ASSET_CATEGORIES, AssetStatus } from '@coresphere/shared';
import { paginationQuerySchema } from '../../utils/pagination';
import { objectId } from '../employees/employee.schemas';

const categoryEnum = z.enum([...ASSET_CATEGORIES] as unknown as [string, ...string[]]);

export const createAssetSchema = z.object({
  name: z.string().trim().min(1, 'Asset name is required').max(160),
  category: categoryEnum,
  serialNumber: z.string().trim().max(120).optional(),
  purchaseDate: z.coerce.date().optional(),
  purchaseCost: z.coerce.number().min(0).optional(),
  location: z.string().trim().max(160).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

export const assignAssetSchema = z.object({ employeeId: objectId });

export const assetStatusSchema = z.object({ status: z.nativeEnum(AssetStatus) });

export const listAssetsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.nativeEnum(AssetStatus).optional(),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type AssignAssetInput = z.infer<typeof assignAssetSchema>;
export type AssetStatusInput = z.infer<typeof assetStatusSchema>;
export type ListAssetsQuery = z.infer<typeof listAssetsQuerySchema>;
