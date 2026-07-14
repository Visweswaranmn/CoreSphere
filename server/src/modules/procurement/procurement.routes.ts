import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@coresphere/shared';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { objectId } from '../employees/employee.schemas';
import {
  createOrderSchema,
  createVendorSchema,
  listOrdersQuerySchema,
  listVendorsQuerySchema,
  orderDecisionSchema,
  updateOrderSchema,
  updateVendorSchema,
  vendorStatusSchema,
} from './procurement.schemas';
import {
  cancelOrder,
  changeVendorStatus,
  createOrder,
  createVendor,
  decideOrder,
  deleteOrder,
  deleteVendor,
  getOrder,
  getOrderStats,
  getVendor,
  getVendorStats,
  listOrders,
  listVendors,
  receiveOrder,
  submitOrder,
  updateOrder,
  updateVendor,
} from './procurement.controller';

export const procurementRouter: Router = Router();

const idParams = z.object({ id: objectId });

procurementRouter.use(authenticate, authorize(Role.ProcurementManager));

// ─── Vendors ─────────────────────────────────────────────────────────────────
procurementRouter.get('/vendors', validate({ query: listVendorsQuerySchema }), listVendors);
procurementRouter.get('/vendors/stats', getVendorStats);
procurementRouter.post('/vendors', validate({ body: createVendorSchema }), createVendor);
procurementRouter.get('/vendors/:id', validate({ params: idParams }), getVendor);
procurementRouter.patch('/vendors/:id', validate({ params: idParams, body: updateVendorSchema }), updateVendor);
procurementRouter.patch(
  '/vendors/:id/status',
  validate({ params: idParams, body: vendorStatusSchema }),
  changeVendorStatus,
);
procurementRouter.delete('/vendors/:id', validate({ params: idParams }), deleteVendor);

// ─── Purchase orders ─────────────────────────────────────────────────────────
procurementRouter.get('/orders', validate({ query: listOrdersQuerySchema }), listOrders);
procurementRouter.get('/orders/stats', getOrderStats);
procurementRouter.post('/orders', validate({ body: createOrderSchema }), createOrder);
procurementRouter.get('/orders/:id', validate({ params: idParams }), getOrder);
procurementRouter.patch('/orders/:id', validate({ params: idParams, body: updateOrderSchema }), updateOrder);
procurementRouter.post('/orders/:id/submit', validate({ params: idParams }), submitOrder);
procurementRouter.post(
  '/orders/:id/decision',
  validate({ params: idParams, body: orderDecisionSchema }),
  decideOrder,
);
procurementRouter.post('/orders/:id/receive', validate({ params: idParams }), receiveOrder);
procurementRouter.post('/orders/:id/cancel', validate({ params: idParams }), cancelOrder);
procurementRouter.delete('/orders/:id', validate({ params: idParams }), deleteOrder);
