import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from './ApiError';
import type {
  AccessTokenClaims,
  RefreshTokenClaims,
} from '../modules/auth/auth.types';

type AccessExpiry = SignOptions['expiresIn'];

export function signAccessToken(claims: AccessTokenClaims): string {
  return jwt.sign(claims, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as AccessExpiry,
  });
}

export function signRefreshToken(claims: RefreshTokenClaims): string {
  return jwt.sign(claims, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as AccessExpiry,
  });
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenClaims;
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): RefreshTokenClaims {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenClaims;
  } catch {
    throw ApiError.unauthorized('Invalid or expired session');
  }
}
