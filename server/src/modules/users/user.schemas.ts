import { z } from 'zod';
import { Role } from '@coresphere/shared';
import { paginationQuerySchema } from '../../utils/pagination';

export const listUsersQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string().trim().min(1).max(60).optional(),
  lastName: z.string().trim().min(1).max(60).optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.enum(['active', 'invited', 'disabled']).optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
