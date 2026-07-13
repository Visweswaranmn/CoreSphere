import type { CookieOptions, Response } from 'express';
import { env, isProduction } from '../config/env';

export const REFRESH_COOKIE_NAME = 'coresphere_rt';

function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/api/v1/auth',
  };
}

/** Sets the refresh token as an httpOnly cookie scoped to the auth endpoints. */
export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...baseCookieOptions(),
    maxAge: env.REFRESH_COOKIE_DAYS * 24 * 60 * 60 * 1000,
  });
}

/** Clears the refresh token cookie (logout). */
export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions());
}
