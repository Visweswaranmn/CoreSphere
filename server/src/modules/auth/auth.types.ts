import type { Role } from '@coresphere/shared';

/** Minimal authenticated principal derived from a verified access token. */
export interface AuthPrincipal {
  id: string;
  role: Role;
}

/** Claims embedded in the short-lived access token. */
export interface AccessTokenClaims {
  sub: string;
  role: Role;
}

/** Claims embedded in the long-lived refresh token. */
export interface RefreshTokenClaims {
  sub: string;
  /** Bumped on logout/password change to invalidate outstanding refresh tokens. */
  tokenVersion: number;
}
