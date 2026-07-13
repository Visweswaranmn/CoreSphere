import { Router } from 'express';
import { Role } from '@coresphere/shared';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { loginSchema, registerSchema } from './auth.schemas';
import { login, logout, me, refresh, register } from './auth.controller';

export const authRouter: Router = Router();

authRouter.post('/login', validate({ body: loginSchema }), login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
authRouter.get('/me', authenticate, me);

// Account provisioning is restricted to Super Admin.
authRouter.post(
  '/register',
  authenticate,
  authorize(Role.SuperAdmin),
  validate({ body: registerSchema }),
  register,
);
