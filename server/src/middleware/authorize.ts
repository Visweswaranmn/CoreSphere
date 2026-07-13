import type { RequestHandler } from 'express';
import { type Role, Role as Roles } from '@coresphere/shared';
import { ApiError } from '../utils/ApiError';

/**
 * Restricts a route to the given roles. Super Admin always passes. Must run
 * after {@link authenticate}. Passing no roles allows any authenticated user.
 */
export function authorize(...allowed: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { role } = req.user;
    if (role === Roles.SuperAdmin || allowed.length === 0 || allowed.includes(role)) {
      next();
      return;
    }

    throw ApiError.forbidden('You do not have permission to perform this action');
  };
}
