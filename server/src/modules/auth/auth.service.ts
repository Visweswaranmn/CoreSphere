import { Role, type AuthResult, type AuthUser } from '@coresphere/shared';
import { userRepository } from '../users/user.repository';
import { userService } from '../users/user.service';
import { toAuthUser, type UserHydrated } from '../users/user.model';
import { verifyPassword } from '../../utils/password';
import { signAccessToken, signRefreshToken } from '../../utils/jwt';
import { ApiError } from '../../utils/ApiError';
import type { RegisterInput, SignupInput } from './auth.schemas';

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
  register(input: RegisterInput): Promise<AuthUser> {
    return userService.create(input);
  },

  /**
   * Public self-service registration. Always creates the lowest-privilege
   * Employee role (never trusts a client-supplied role) and signs the new
   * user in immediately.
   */
  async signup(input: SignupInput): Promise<IssuedSession> {
    const created = await userService.create({ ...input, role: Role.Employee });
    const user = await userRepository.findById(created.id);
    if (!user) {
      // The account was just created, so this should never happen.
      throw ApiError.internal('Failed to load the new account');
    }
    return issueSession(user);
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
