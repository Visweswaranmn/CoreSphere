import type { RequestHandler } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken } from '../utils/jwt';

/**
 * Requires a valid Bearer access token. Attaches the authenticated principal
 * (id + role) to `req.user`. Rejects with 401 when missing or invalid.
 */
export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication required');
  }

  const token = header.slice('Bearer '.length).trim();
  const claims = verifyAccessToken(token);

  req.user = { id: claims.sub, role: claims.role };
  next();
};
