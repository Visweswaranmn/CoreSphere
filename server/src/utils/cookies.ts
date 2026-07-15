import type { CookieOptions, Response } from 'express';
import { env, isProduction } from '../config/env';

export const REFRESH_COOKIE_NAME = 'coresphere_rt';

function sameSitePolicy(): CookieOptions['sameSite'] {
  if (!isProduction) return 'lax';
  // Cross-site (e.g. Vercel web + Render API) requires SameSite=None + Secure.
  return env.CROSS_SITE_COOKIES ? 'none' : 'strict';
}

function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    // SameSite=None cookies must be Secure; production is always HTTPS.
    secure: isProduction,
    sameSite: sameSitePolicy(),
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
