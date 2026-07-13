import type { Server } from 'node:http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { API_PREFIX } from './config/constants';
import { connectDatabase, disconnectDatabase } from './config/database';

async function bootstrap(): Promise<void> {
  // Attempt the DB connection but don't crash-loop if it's unavailable at
  // startup — the server stays up and reports "degraded" via /health so
  // readiness probes and the UI reflect the real state.
  try {
    await connectDatabase();
  } catch (err) {
    logger.error({ err }, 'Initial database connection failed — starting in degraded mode');
  }

  const app = createApp();
  const server: Server = app.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}${API_PREFIX}`);
  });

  registerShutdownHandlers(server);
}

function registerShutdownHandlers(server: Server): void {
  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(() => {
      void disconnectDatabase().finally(() => process.exit(0));
    });
    // Force-exit if graceful shutdown stalls.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection');
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Fatal error during startup');
  process.exit(1);
});
