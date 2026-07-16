import type { Request, Response } from 'express';
import type { AuthResult } from '@coresphere/shared';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/respond';
import { ApiError } from '../../utils/ApiError';
import { verifyRefreshToken } from '../../utils/jwt';
import { clearRefreshCookie, REFRESH_COOKIE_NAME, setRefreshCookie } from '../../utils/cookies';
import { authService } from './auth.service';
import type { LoginInput, RegisterInput, SignupInput } from './auth.schemas';

function readRefreshCookie(req: Request): string | undefined {
  return (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE_NAME];
}

/** POST /auth/login — verify credentials, set refresh cookie, return access token. */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;
  const { refreshToken, ...result } = await authService.login(email, password);
  setRefreshCookie(res, refreshToken);
  return sendSuccess<AuthResult>(res, result);
});

/** POST /auth/register — Super Admin provisions a new account. */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(req.body as RegisterInput);
  return sendSuccess(res, user, 201, 'User created successfully');
});

/** POST /auth/signup — public self-service registration; signs the user in. */
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken, ...result } = await authService.signup(req.body as SignupInput);
  setRefreshCookie(res, refreshToken);
  return sendSuccess<AuthResult>(res, result, 201, 'Account created successfully');
});

/** POST /auth/refresh — rotate tokens using the refresh cookie. */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = readRefreshCookie(req);
  if (!token) {
    throw ApiError.unauthorized('No active session');
  }

  const claims = verifyRefreshToken(token);
  const { refreshToken, ...result } = await authService.refresh(claims.sub, claims.tokenVersion);
  setRefreshCookie(res, refreshToken);
  return sendSuccess<AuthResult>(res, result);
});

/** POST /auth/logout — invalidate refresh tokens and clear the cookie. */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = readRefreshCookie(req);
  if (token) {
    try {
      const claims = verifyRefreshToken(token);
      await authService.logout(claims.sub);
    } catch {
      // Token already invalid/expired — clearing the cookie is enough.
    }
  }
  clearRefreshCookie(res);
  return sendSuccess(res, { message: 'Logged out' });
});

/** GET /auth/me — return the authenticated user's profile. */
export const me = asyncHandler(async (req: Request, res: Response) => {
  const principal = req.user;
  if (!principal) {
    throw ApiError.unauthorized('Authentication required');
  }
  const user = await authService.getProfile(principal.id);
  return sendSuccess(res, user);
});
