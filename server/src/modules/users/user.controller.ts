import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/respond';
import { buildPaginated } from '../../utils/pagination';
import { ApiError } from '../../utils/ApiError';
import { userService } from './user.service';
import type { ListUsersQuery, UpdateUserInput } from './user.schemas';
import type { RegisterInput } from '../auth/auth.schemas';

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListUsersQuery;
  const { items, total } = await userService.list(query);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.create(req.body as RegisterInput);
  return sendSuccess(res, user, 201, 'User created');
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await userService.update(req.params.id as string, req.body as UpdateUserInput, req.user.id);
  return sendSuccess(res, user, 200, 'User updated');
});
