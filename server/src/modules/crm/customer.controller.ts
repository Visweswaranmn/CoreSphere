import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/respond';
import { buildPaginated } from '../../utils/pagination';
import { customerService } from './customer.service';
import type { CreateCustomerInput, ListCustomersQuery, UpdateCustomerInput } from './customer.schemas';

export const listCustomers = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListCustomersQuery;
  const { items, total } = await customerService.list(query);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const getCustomerStats = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await customerService.stats());
});

export const getCustomer = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await customerService.getById(req.params.id as string));
});

export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.create(req.body as CreateCustomerInput);
  return sendSuccess(res, customer, 201, 'Customer created');
});

export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.update(req.params.id as string, req.body as UpdateCustomerInput);
  return sendSuccess(res, customer, 200, 'Customer updated');
});

export const deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
  await customerService.remove(req.params.id as string);
  return sendSuccess(res, { id: req.params.id }, 200, 'Customer removed');
});
