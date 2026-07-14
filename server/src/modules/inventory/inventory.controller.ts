import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/respond';
import { buildPaginated } from '../../utils/pagination';
import { ApiError } from '../../utils/ApiError';
import { inventoryService } from './inventory.service';
import { assetService } from './asset.service';
import type { CreateItemInput, ListItemsQuery, MovementInput, UpdateItemInput } from './inventory.schemas';
import type {
  AssetStatusInput,
  AssignAssetInput,
  CreateAssetInput,
  ListAssetsQuery,
  UpdateAssetInput,
} from './asset.schemas';

// ─── Inventory items ─────────────────────────────────────────────────────────
export const listItems = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListItemsQuery;
  const { items, total } = await inventoryService.list(query);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const getItemStats = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await inventoryService.stats());
});

export const getItem = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await inventoryService.getById(req.params.id as string));
});

export const createItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await inventoryService.create(req.body as CreateItemInput);
  return sendSuccess(res, item, 201, 'Inventory item created');
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await inventoryService.update(req.params.id as string, req.body as UpdateItemInput);
  return sendSuccess(res, item, 200, 'Inventory item updated');
});

export const deleteItem = asyncHandler(async (req: Request, res: Response) => {
  await inventoryService.remove(req.params.id as string);
  return sendSuccess(res, { id: req.params.id }, 200, 'Inventory item removed');
});

export const recordMovement = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const item = await inventoryService.recordMovement(
    req.params.id as string,
    req.user.id,
    req.body as MovementInput,
  );
  return sendSuccess(res, item, 201, 'Stock movement recorded');
});

export const listMovements = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await inventoryService.listMovements(req.params.id as string));
});

// ─── Assets ──────────────────────────────────────────────────────────────────
export const listAssets = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListAssetsQuery;
  const { items, total } = await assetService.list(query);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const getAssetStats = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await assetService.stats());
});

export const getAsset = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await assetService.getById(req.params.id as string));
});

export const createAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetService.create(req.body as CreateAssetInput);
  return sendSuccess(res, asset, 201, 'Asset created');
});

export const updateAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetService.update(req.params.id as string, req.body as UpdateAssetInput);
  return sendSuccess(res, asset, 200, 'Asset updated');
});

export const assignAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetService.assign(
    req.params.id as string,
    (req.body as AssignAssetInput).employeeId,
  );
  return sendSuccess(res, asset, 200, 'Asset assigned');
});

export const returnAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetService.returnAsset(req.params.id as string);
  return sendSuccess(res, asset, 200, 'Asset returned');
});

export const changeAssetStatus = asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetService.changeStatus(req.params.id as string, req.body as AssetStatusInput);
  return sendSuccess(res, asset, 200, 'Asset status updated');
});

export const deleteAsset = asyncHandler(async (req: Request, res: Response) => {
  await assetService.remove(req.params.id as string);
  return sendSuccess(res, { id: req.params.id }, 200, 'Asset removed');
});
