import rateLimit, { type Options } from 'express-rate-limit';
import type { ApiFailure } from '@coresphere/shared';
import { isProduction } from './env';

function rejection(message: string): Pick<Options, 'handler'> {
  return {
    handler: (_req, res) => {
      const body: ApiFailure = { success: false, code: 'RATE_LIMITED', message };
      res.status(429).json(body);
    },
  };
}

/** Broad limiter for the whole API surface. */
export const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: isProduction ? 300 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  ...rejection('Too many requests — please slow down.'),
});

/** Strict limiter for credential endpoints to slow brute-force attempts. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: isProduction ? 10 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  ...rejection('Too many attempts — please try again later.'),
});
