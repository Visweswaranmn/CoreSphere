import { ApiClientError } from './apiClient';

/**
 * Whether an error looks like the API is still starting up rather than a real
 * failure. On free hosting (e.g. Render) an idle instance sleeps and the first
 * request can't connect (NETWORK_ERROR) or hits the platform's gateway while it
 * spins up (502/503/504).
 */
function isColdStart(error: unknown): boolean {
  return (
    error instanceof ApiClientError &&
    (error.code === 'NETWORK_ERROR' ||
      error.status === 502 ||
      error.status === 503 ||
      error.status === 504)
  );
}

interface ColdStartOptions {
  retries?: number;
  delayMs?: number;
}

/**
 * Runs `fn`, transparently retrying while the server appears to be waking from
 * a cold start. Calls `onWaking` the first time a cold start is detected so the
 * UI can show a reassuring message instead of an error. Non-cold-start errors
 * (e.g. invalid credentials) are thrown immediately without retrying.
 */
export async function withColdStartRetry<T>(
  fn: () => Promise<T>,
  onWaking?: () => void,
  { retries = 8, delayMs = 4000 }: ColdStartOptions = {},
): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (!isColdStart(error) || attempt >= retries) throw error;
      onWaking?.();
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
