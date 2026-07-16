import type {
  ApiResponse,
  AuthResult,
  AuthUser,
  LoginRequest,
  SignupRequest,
} from '@coresphere/shared';
import { env } from '@/config/env';
import { apiClient, ApiClientError } from '@/lib/apiClient';

export const authApi = {
  login(credentials: LoginRequest): Promise<AuthResult> {
    return apiClient.post<AuthResult>('/auth/login', credentials);
  },

  signup(payload: SignupRequest): Promise<AuthResult> {
    return apiClient.post<AuthResult>('/auth/signup', payload);
  },

  me(): Promise<AuthUser> {
    return apiClient.get<AuthUser>('/auth/me');
  },

  logout(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/logout');
  },

  /**
   * Exchanges the refresh cookie for a new session. Uses a bare fetch (not the
   * API client) so it can never trigger the client's 401 refresh-retry loop.
   */
  async refresh(): Promise<AuthResult> {
    let response: Response;
    try {
      response = await fetch(`${env.VITE_API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
    } catch {
      throw new ApiClientError('Unable to reach the server', 'NETWORK_ERROR', 0);
    }

    const payload = (await response.json().catch(() => null)) as ApiResponse<AuthResult> | null;
    if (!payload || !payload.success) {
      throw new ApiClientError(
        payload?.success === false ? payload.message : 'Session expired',
        payload?.success === false ? payload.code : 'UNAUTHORIZED',
        response.status,
      );
    }
    return payload.data;
  },
};
