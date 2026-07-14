import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/respond';
import { buildPaginated } from '../../utils/pagination';
import { ApiError } from '../../utils/ApiError';
import { leaveService } from './leave.service';
import type {
  BalanceQuery,
  CreateLeaveInput,
  DecideLeaveInput,
  ListLeaveQuery,
} from './leave.schemas';

export const listLeaves = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListLeaveQuery;
  const { items, total } = await leaveService.list(query);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const createLeave = asyncHandler(async (req: Request, res: Response) => {
  const leave = await leaveService.create(req.body as CreateLeaveInput);
  return sendSuccess(res, leave, 201, 'Leave request submitted');
});

export const decideLeave = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const leave = await leaveService.decide(
    req.params.id as string,
    req.user.id,
    req.body as DecideLeaveInput,
  );
  return sendSuccess(res, leave, 200, 'Decision recorded');
});

export const getLeaveBalance = asyncHandler(async (req: Request, res: Response) => {
  const { employeeId } = req.query as unknown as BalanceQuery;
  return sendSuccess(res, await leaveService.balances(employeeId));
});
