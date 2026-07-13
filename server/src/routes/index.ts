import { Router } from 'express';
import { healthRouter } from '../modules/health/health.routes';

/** Root API router. Feature modules mount their sub-routers here. */
export const apiRouter: Router = Router();

apiRouter.use('/health', healthRouter);
