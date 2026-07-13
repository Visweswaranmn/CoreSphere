import type { AuthResult, AuthUser, Role } from '@coresphere/shared';
import { userRepository } from '../users/user.repository';
import { toAuthUser, type UserHydrated } from '../users/user.model';
import { hashPassword, verifyPassword } from '../../utils/password';
import { signAccessToken, signRefreshToken } from '../../utils/jwt';
import { ApiError } from '../../utils/ApiError';
import type { RegisterInput } from './auth.schemas';

/** Bundles the access token (for the body) and refresh token (for the cookie). */
export interface IssuedSession extends AuthResult {
  refreshToken: string;
}

function issueSession(user: UserHydrated): IssuedSession {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, tokenVersion: user.tokenVersion });
  return { user: toAuthUser(user), accessToken, refreshToken };
}

function assertActive(user: UserHydrated): void {
  if (user.status === 'disabled') {
    throw ApiError.forbidden('This account has been disabled');
  }
}

export const authService = {
  /** Verifies credentials and issues a new authenticated session. */
  async login(email: string, password: string): Promise<IssuedSession> {
    const user = await userRepository.findByEmailWithPassword(email);
    // Uniform error to avoid leaking which accounts exist.
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw ApiError.unauthorized('Invalid email or password');
    }
    assertActive(user);

    user.lastLoginAt = new Date();
    await user.save();

    return issueSession(user);
  },

  /** Provisions a new user account (Super Admin action). Does not sign them in. */
  async register(input: RegisterInput): Promise<AuthUser> {
    if (await userRepository.existsByEmail(input.email)) {
      throw ApiError.conflict('A user with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      role: input.role as Role,
      status: 'active',
    });

    return toAuthUser(user);
  },

  /** Rotates the session: validates the refresh token and issues fresh tokens. */
  async refresh(userId: string, tokenVersion: number): Promise<IssuedSession> {
    const user = await userRepository.findById(userId);
    if (!user || user.tokenVersion !== tokenVersion) {
      throw ApiError.unauthorized('Session is no longer valid');
    }
    assertActive(user);

    return issueSession(user);
  },

  /** Invalidates all outstanding refresh tokens for the user (logout). */
  async logout(userId: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (user) {
      user.tokenVersion += 1;
      await user.save();
    }
  },

  /** Returns the current user's public profile. */
  async getProfile(userId: string): Promise<AuthUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.unauthorized('Account not found');
    }
    return toAuthUser(user);
  },
};
