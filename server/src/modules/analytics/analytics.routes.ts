import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/respond';
import { analyticsService } from './analytics.service';

export const analyticsRouter: Router = Router();

// The executive overview is available to every authenticated user.
analyticsRouter.use(authenticate);

analyticsRouter.get(
  '/overview',
  asyncHandler(async (_req, res) => sendSuccess(res, await analyticsService.overview())),
);
