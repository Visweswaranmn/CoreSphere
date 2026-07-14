import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@coresphere/shared';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { objectId } from '../employees/employee.schemas';
import {
  balanceQuerySchema,
  createLeaveSchema,
  decideLeaveSchema,
  listLeaveQuerySchema,
} from './leave.schemas';
import { createLeave, decideLeave, getLeaveBalance, listLeaves } from './leave.controller';

export const leaveRouter: Router = Router();

leaveRouter.use(authenticate, authorize(Role.HrManager));

leaveRouter.get('/', validate({ query: listLeaveQuerySchema }), listLeaves);
leaveRouter.get('/balance', validate({ query: balanceQuerySchema }), getLeaveBalance);
leaveRouter.post('/', validate({ body: createLeaveSchema }), createLeave);
leaveRouter.patch(
  '/:id/decision',
  validate({ params: z.object({ id: objectId }), body: decideLeaveSchema }),
  decideLeave,
);
