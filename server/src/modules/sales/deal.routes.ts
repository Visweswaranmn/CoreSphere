import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@coresphere/shared';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { objectId } from '../employees/employee.schemas';
import { createDealSchema, dealStageSchema, listDealsQuerySchema, updateDealSchema } from './deal.schemas';
import {
  changeDealStage,
  createDeal,
  deleteDeal,
  getDeal,
  getDealStats,
  listDeals,
  updateDeal,
} from './deal.controller';

export const dealRouter: Router = Router();

const idParams = z.object({ id: objectId });

dealRouter.use(authenticate, authorize(Role.SalesManager));

dealRouter.get('/', validate({ query: listDealsQuerySchema }), listDeals);
dealRouter.get('/stats', getDealStats);
dealRouter.post('/', validate({ body: createDealSchema }), createDeal);
dealRouter.get('/:id', validate({ params: idParams }), getDeal);
dealRouter.patch('/:id', validate({ params: idParams, body: updateDealSchema }), updateDeal);
dealRouter.patch('/:id/stage', validate({ params: idParams, body: dealStageSchema }), changeDealStage);
dealRouter.delete('/:id', validate({ params: idParams }), deleteDeal);
