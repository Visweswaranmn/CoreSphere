import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/respond';
import { buildPaginated } from '../../utils/pagination';
import { dealService } from './deal.service';
import type { CreateDealInput, DealStageInput, ListDealsQuery, UpdateDealInput } from './deal.schemas';

export const listDeals = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListDealsQuery;
  const { items, total } = await dealService.list(query);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const getDealStats = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await dealService.stats());
});

export const getDeal = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await dealService.getById(req.params.id as string));
});

export const createDeal = asyncHandler(async (req: Request, res: Response) => {
  const deal = await dealService.create(req.body as CreateDealInput);
  return sendSuccess(res, deal, 201, 'Deal created');
});

export const updateDeal = asyncHandler(async (req: Request, res: Response) => {
  const deal = await dealService.update(req.params.id as string, req.body as UpdateDealInput);
  return sendSuccess(res, deal, 200, 'Deal updated');
});

export const changeDealStage = asyncHandler(async (req: Request, res: Response) => {
  const deal = await dealService.changeStage(req.params.id as string, req.body as DealStageInput);
  return sendSuccess(res, deal, 200, 'Deal stage updated');
});

export const deleteDeal = asyncHandler(async (req: Request, res: Response) => {
  await dealService.remove(req.params.id as string);
  return sendSuccess(res, { id: req.params.id }, 200, 'Deal removed');
});
