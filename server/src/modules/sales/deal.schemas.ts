import { z } from 'zod';
import { DealStage } from '@coresphere/shared';
import { paginationQuerySchema } from '../../utils/pagination';
import { objectId } from '../employees/employee.schemas';

export const createDealSchema = z.object({
  title: z.string().trim().min(1, 'Deal title is required').max(200),
  customerId: objectId,
  value: z.coerce.number().min(0, 'Value must be zero or more'),
  stage: z.nativeEnum(DealStage).optional(),
  expectedCloseDate: z.coerce.date().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const updateDealSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  customerId: objectId.optional(),
  value: z.coerce.number().min(0).optional(),
  stage: z.nativeEnum(DealStage).optional(),
  expectedCloseDate: z.coerce.date().nullable().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const dealStageSchema = z.object({ stage: z.nativeEnum(DealStage) });

export const listDealsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  stage: z.nativeEnum(DealStage).optional(),
  customerId: objectId.optional(),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type DealStageInput = z.infer<typeof dealStageSchema>;
export type ListDealsQuery = z.infer<typeof listDealsQuerySchema>;
