import type { Response } from 'express';
import type { ApiSuccess } from '@coresphere/shared';

/** Sends a standardized success envelope with an optional HTTP status. */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string,
): Response {
  const body: ApiSuccess<T> = { success: true, data, ...(message ? { message } : {}) };
  return res.status(statusCode).json(body);
}
