import { Router } from 'express';
import { Role } from '@coresphere/shared';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { authLimiter } from '../../config/rateLimit';
import { loginSchema, registerSchema, signupSchema } from './auth.schemas';
import { login, logout, me, refresh, register, signup } from './auth.controller';

export const authRouter: Router = Router();

authRouter.post('/login', authLimiter, validate({ body: loginSchema }), login);
authRouter.post('/signup', authLimiter, validate({ body: signupSchema }), signup);
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
