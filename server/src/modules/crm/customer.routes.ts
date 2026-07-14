import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@coresphere/shared';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { objectId } from '../employees/employee.schemas';
import { createCustomerSchema, listCustomersQuerySchema, updateCustomerSchema } from './customer.schemas';
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  getCustomerStats,
  listCustomers,
  updateCustomer,
} from './customer.controller';

export const customerRouter: Router = Router();

const idParams = z.object({ id: objectId });

customerRouter.use(authenticate, authorize(Role.SalesManager));

customerRouter.get('/', validate({ query: listCustomersQuerySchema }), listCustomers);
customerRouter.get('/stats', getCustomerStats);
customerRouter.post('/', validate({ body: createCustomerSchema }), createCustomer);
customerRouter.get('/:id', validate({ params: idParams }), getCustomer);
customerRouter.patch('/:id', validate({ params: idParams, body: updateCustomerSchema }), updateCustomer);
customerRouter.delete('/:id', validate({ params: idParams }), deleteCustomer);
