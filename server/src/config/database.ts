import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

mongoose.set('strictQuery', true);

/** Establishes the MongoDB connection. Throws if the initial connect fails. */
export async function connectDatabase(): Promise<void> {
  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('error', (err) => logger.error({ err }, 'MongoDB connection error'));

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
  });
}

/** Gracefully closes the MongoDB connection during shutdown. */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
}

/** True when the driver reports an active connection (readyState 1). */
export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
