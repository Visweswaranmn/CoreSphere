import type { ApiFieldError, ApiResponse } from '@coresphere/shared';
import { env } from '@/config/env';
import { getAccessToken, runRefresh } from '@/lib/authToken';

/** Error thrown when the API responds with a failure envelope or is unreachable. */
export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly errors?: ApiFieldError[];

  constructor(message: string, code: string, status: number, errors?: ApiFieldError[]) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Internal: prevents infinite refresh/retry loops. */
  _isRetry?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, _isRetry, ...rest } = options;
  const token = getAccessToken();

  let response: Response;
  try {
    response = await fetch(`${env.VITE_API_BASE_URL}${path}`, {
      ...rest,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiClientError('Unable to reach the server', 'NETWORK_ERROR', 0);
  }

  // Access token likely expired: refresh once and retry the original request.
  if (response.status === 401 && token && !_isRetry) {
    const refreshed = await runRefresh();
    if (refreshed) {
      return request<T>(path, { ...options, _isRetry: true });
    }
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!payload) {
    throw new ApiClientError('Unexpected server response', 'INVALID_RESPONSE', response.status);
  }

  if (!payload.success) {
    throw new ApiClientError(payload.message, payload.code, response.status, payload.errors);
  }

  return payload.data;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
