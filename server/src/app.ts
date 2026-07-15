import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import { API_PREFIX } from './config/constants';
import { apiLimiter } from './config/rateLimit';
import { apiRouter } from './routes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

/** Builds and configures the Express application (no network binding). */
export function createApp(): Express {
  const app = express();

  // Security & platform middleware.
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));

  // Health check must bypass rate limiting (used by uptime probes).
  app.set('trust proxy', 1);

  // API routes (behind the broad rate limiter).
  app.use(API_PREFIX, apiLimiter, apiRouter);

  // Fallbacks.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
