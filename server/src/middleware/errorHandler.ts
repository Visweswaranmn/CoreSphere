import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import type { ApiFailure, ApiFieldError } from '@coresphere/shared';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { isProduction } from '../config/env';

interface NormalizedError {
  statusCode: number;
  code: string;
  message: string;
  errors?: ApiFieldError[];
}

function normalize(err: unknown): NormalizedError {
  if (err instanceof ApiError) {
    return { statusCode: err.statusCode, code: err.code, message: err.message, errors: err.errors };
  }

  if (err instanceof ZodError) {
    const errors: ApiFieldError[] = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return { statusCode: 422, code: 'VALIDATION_ERROR', message: 'Validation failed', errors };
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors: ApiFieldError[] = Object.values(err.errors).map((detail) => ({
      field: detail.path,
      message: detail.message,
    }));
    return { statusCode: 422, code: 'VALIDATION_ERROR', message: 'Validation failed', errors };
  }

  if (err instanceof mongoose.Error.CastError) {
    return { statusCode: 400, code: 'BAD_REQUEST', message: `Invalid value for '${err.path}'` };
  }

  // Duplicate key violation from MongoDB.
  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    const keys = Object.keys((err as { keyValue?: Record<string, unknown> }).keyValue ?? {});
    const field = keys[0] ?? 'field';
    return { statusCode: 409, code: 'CONFLICT', message: `Duplicate value for '${field}'` };
  }

  return { statusCode: 500, code: 'INTERNAL_ERROR', message: 'Internal server error' };
}

/**
 * Centralized error handler. Must be registered last. Converts any thrown value
 * into the standard {@link ApiFailure} envelope and logs 5xx failures.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const normalized = normalize(err);

  if (normalized.statusCode >= 500) {
    logger.error({ err }, 'Unhandled request error');
  }

  const body: ApiFailure = {
    success: false,
    code: normalized.code,
    message:
      normalized.statusCode >= 500 && isProduction ? 'Internal server error' : normalized.message,
    ...(normalized.errors ? { errors: normalized.errors } : {}),
  };

  res.status(normalized.statusCode).json(body);
};
