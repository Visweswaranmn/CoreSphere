import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@coresphere/shared';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { objectId } from '../employees/employee.schemas';
import { registerSchema } from '../auth/auth.schemas';
import { listUsersQuerySchema, updateUserSchema } from './user.schemas';
import { createUser, listUsers, updateUser } from './user.controller';

export const userRouter: Router = Router();

// User management is restricted to Super Admins.
userRouter.use(authenticate, authorize(Role.SuperAdmin));

userRouter.get('/', validate({ query: listUsersQuerySchema }), listUsers);
userRouter.post('/', validate({ body: registerSchema }), createUser);
userRouter.patch(
  '/:id',
  validate({ params: z.object({ id: objectId }), body: updateUserSchema }),
  updateUser,
);
