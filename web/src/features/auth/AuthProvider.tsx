import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AuthUser, LoginRequest, SignupRequest } from '@coresphere/shared';
import { setAccessToken, setRefreshHandler } from '@/lib/authToken';
import { queryClient } from '@/lib/queryClient';
import { authApi } from './authApi';
import { AuthContext, type AuthStatus, type AuthContextValue } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // Keep the latest setters accessible from the (stable) refresh handler.
  const applySession = useCallback((nextUser: AuthUser, accessToken: string) => {
    setAccessToken(accessToken);
    setUser(nextUser);
    setStatus('authenticated');
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  // Register the silent-refresh handler used by the API client on 401s.
  const applySessionRef = useRef(applySession);
  const clearSessionRef = useRef(clearSession);
  applySessionRef.current = applySession;
  clearSessionRef.current = clearSession;

  useEffect(() => {
    setRefreshHandler(async () => {
      try {
        const result = await authApi.refresh();
        applySessionRef.current(result.user, result.accessToken);
        return result.accessToken;
      } catch {
        clearSessionRef.current();
        return null;
      }
    });
    return () => setRefreshHandler(null);
  }, []);

  // Attempt a silent login on first load using the refresh cookie.
  useEffect(() => {
    let cancelled = false;
    authApi
      .refresh()
      .then((result) => {
        if (!cancelled) applySession(result.user, result.accessToken);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      });
    return () => {
      cancelled = true;
    };
  }, [applySession, clearSession]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const result = await authApi.login(credentials);
      applySession(result.user, result.accessToken);
    },
    [applySession],
  );

  const signup = useCallback(
    async (payload: SignupRequest) => {
      const result = await authApi.signup(payload);
      applySession(result.user, result.accessToken);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
      queryClient.clear();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, signup, logout }),
    [user, status, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
