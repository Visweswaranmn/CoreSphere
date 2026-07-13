import type { RequestHandler } from 'express';
import { ApiError } from '../utils/ApiError';

/** Terminal 404 handler for unmatched routes. */
export const notFound: RequestHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};
