import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/respond';
import { buildPaginated } from '../../utils/pagination';
import { ApiError } from '../../utils/ApiError';
import { vendorService } from './vendor.service';
import { purchaseOrderService } from './purchaseOrder.service';
import type {
  CreateOrderInput,
  CreateVendorInput,
  ListOrdersQuery,
  ListVendorsQuery,
  OrderDecisionInput,
  UpdateOrderInput,
  UpdateVendorInput,
  VendorStatusInput,
} from './procurement.schemas';

// ─── Vendors ─────────────────────────────────────────────────────────────────
export const listVendors = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListVendorsQuery;
  const { items, total } = await vendorService.list(query);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const getVendorStats = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await vendorService.stats());
});

export const getVendor = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await vendorService.getById(req.params.id as string));
});

export const createVendor = asyncHandler(async (req: Request, res: Response) => {
  const vendor = await vendorService.create(req.body as CreateVendorInput);
  return sendSuccess(res, vendor, 201, 'Vendor created');
});

export const updateVendor = asyncHandler(async (req: Request, res: Response) => {
  const vendor = await vendorService.update(req.params.id as string, req.body as UpdateVendorInput);
  return sendSuccess(res, vendor, 200, 'Vendor updated');
});

export const changeVendorStatus = asyncHandler(async (req: Request, res: Response) => {
  const vendor = await vendorService.changeStatus(req.params.id as string, req.body as VendorStatusInput);
  return sendSuccess(res, vendor, 200, 'Vendor status updated');
});

export const deleteVendor = asyncHandler(async (req: Request, res: Response) => {
  await vendorService.remove(req.params.id as string);
  return sendSuccess(res, { id: req.params.id }, 200, 'Vendor removed');
});

// ─── Purchase orders ─────────────────────────────────────────────────────────
export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListOrdersQuery;
  const { items, total } = await purchaseOrderService.list(query);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const getOrderStats = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await purchaseOrderService.stats());
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await purchaseOrderService.getById(req.params.id as string));
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await purchaseOrderService.create(req.body as CreateOrderInput);
  return sendSuccess(res, order, 201, 'Purchase order created');
});

export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await purchaseOrderService.update(req.params.id as string, req.body as UpdateOrderInput);
  return sendSuccess(res, order, 200, 'Purchase order updated');
});

export const submitOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await purchaseOrderService.submit(req.params.id as string);
  return sendSuccess(res, order, 200, 'Purchase order submitted');
});

export const decideOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const order = await purchaseOrderService.decide(
    req.params.id as string,
    req.user.id,
    req.body as OrderDecisionInput,
  );
  return sendSuccess(res, order, 200, 'Decision recorded');
});

export const receiveOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await purchaseOrderService.receive(req.params.id as string);
  return sendSuccess(res, order, 200, 'Purchase order received');
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await purchaseOrderService.cancel(req.params.id as string);
  return sendSuccess(res, order, 200, 'Purchase order cancelled');
});

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  await purchaseOrderService.remove(req.params.id as string);
  return sendSuccess(res, { id: req.params.id }, 200, 'Purchase order removed');
});
