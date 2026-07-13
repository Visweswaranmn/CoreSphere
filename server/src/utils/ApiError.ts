import type { ApiFieldError } from '@coresphere/shared';

/**
 * Operational error carrying an HTTP status and a machine-readable code.
 * Thrown anywhere in the request lifecycle and translated to a response
 * envelope by the centralized error handler.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly errors?: ApiFieldError[];
  readonly isOperational = true;

  constructor(statusCode: number, code: string, message: string, errors?: ApiFieldError[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: ApiFieldError[]): ApiError {
    return new ApiError(400, 'BAD_REQUEST', message, errors);
  }

  static unauthorized(message = 'Authentication required'): ApiError {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'You do not have permission to perform this action'): ApiError {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, 'CONFLICT', message);
  }

  static validation(message: string, errors: ApiFieldError[]): ApiError {
    return new ApiError(422, 'VALIDATION_ERROR', message, errors);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, 'INTERNAL_ERROR', message);
  }
}
