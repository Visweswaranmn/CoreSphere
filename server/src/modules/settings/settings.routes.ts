import { Router } from 'express';
import { Role } from '@coresphere/shared';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/respond';
import { settingsService } from './settings.service';
import { updateSettingsSchema } from './settings.schemas';

export const settingsRouter: Router = Router();

settingsRouter.use(authenticate, authorize(Role.SuperAdmin));

settingsRouter.get(
  '/',
  asyncHandler(async (_req, res) => sendSuccess(res, await settingsService.get())),
);

settingsRouter.put(
  '/',
  validate({ body: updateSettingsSchema }),
  asyncHandler(async (req, res) => sendSuccess(res, await settingsService.update(req.body), 200, 'Settings saved')),
);
