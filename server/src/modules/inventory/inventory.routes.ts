import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@coresphere/shared';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { objectId } from '../employees/employee.schemas';
import { createItemSchema, listItemsQuerySchema, movementSchema, updateItemSchema } from './inventory.schemas';
import {
  assetStatusSchema,
  assignAssetSchema,
  createAssetSchema,
  listAssetsQuerySchema,
  updateAssetSchema,
} from './asset.schemas';
import {
  assignAsset,
  changeAssetStatus,
  createAsset,
  createItem,
  deleteAsset,
  deleteItem,
  getAsset,
  getAssetStats,
  getItem,
  getItemStats,
  listAssets,
  listItems,
  listMovements,
  recordMovement,
  returnAsset,
  updateAsset,
  updateItem,
} from './inventory.controller';

export const inventoryRouter: Router = Router();

const idParams = z.object({ id: objectId });

inventoryRouter.use(authenticate, authorize(Role.InventoryManager));

// ─── Inventory items ─────────────────────────────────────────────────────────
inventoryRouter.get('/items', validate({ query: listItemsQuerySchema }), listItems);
inventoryRouter.get('/items/stats', getItemStats);
inventoryRouter.post('/items', validate({ body: createItemSchema }), createItem);
inventoryRouter.get('/items/:id', validate({ params: idParams }), getItem);
inventoryRouter.patch('/items/:id', validate({ params: idParams, body: updateItemSchema }), updateItem);
inventoryRouter.delete('/items/:id', validate({ params: idParams }), deleteItem);
inventoryRouter.get('/items/:id/movements', validate({ params: idParams }), listMovements);
inventoryRouter.post('/items/:id/movements', validate({ params: idParams, body: movementSchema }), recordMovement);

// ─── Assets ──────────────────────────────────────────────────────────────────
inventoryRouter.get('/assets', validate({ query: listAssetsQuerySchema }), listAssets);
inventoryRouter.get('/assets/stats', getAssetStats);
inventoryRouter.post('/assets', validate({ body: createAssetSchema }), createAsset);
inventoryRouter.get('/assets/:id', validate({ params: idParams }), getAsset);
inventoryRouter.patch('/assets/:id', validate({ params: idParams, body: updateAssetSchema }), updateAsset);
inventoryRouter.post('/assets/:id/assign', validate({ params: idParams, body: assignAssetSchema }), assignAsset);
inventoryRouter.post('/assets/:id/return', validate({ params: idParams }), returnAsset);
inventoryRouter.patch('/assets/:id/status', validate({ params: idParams, body: assetStatusSchema }), changeAssetStatus);
inventoryRouter.delete('/assets/:id', validate({ params: idParams }), deleteAsset);
