import { z } from 'zod';
import type { Paginated, PaginationMeta } from '@coresphere/shared';

/** Standard pagination query params shared by all list endpoints. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type PaginationParams = z.infer<typeof paginationQuerySchema>;

/** Wraps a page of results with pagination metadata. */
export function buildPaginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): Paginated<T> {
  const meta: PaginationMeta = {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
  return { items, meta };
}
