import type { Request, Response } from 'express';
import type { HealthStatus } from '@coresphere/shared';
import { isDatabaseConnected } from '../../config/database';
import { APP_VERSION, SERVICE_NAME } from '../../config/constants';
import { sendSuccess } from '../../utils/respond';

/** Returns liveness/readiness information including database connectivity. */
export function getHealth(_req: Request, res: Response): Response {
  const databaseConnected = isDatabaseConnected();

  const payload: HealthStatus = {
    status: databaseConnected ? 'ok' : 'degraded',
    service: SERVICE_NAME,
    version: APP_VERSION,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: databaseConnected ? 'connected' : 'disconnected',
  };

  return sendSuccess(res, payload, databaseConnected ? 200 : 503);
}
