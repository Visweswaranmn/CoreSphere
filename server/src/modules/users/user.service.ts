import { type AuthUser, type Role, type UserStatus } from '@coresphere/shared';
import { ApiError } from '../../utils/ApiError';
import { hashPassword } from '../../utils/password';
import { userRepository } from './user.repository';
import { toAuthUser } from './user.model';
import type { RegisterInput } from '../auth/auth.schemas';
import type { ListUsersQuery, UpdateUserInput } from './user.schemas';

export const userService = {
  /** Provisions a new user account (used by admin register and user management). */
  async create(input: RegisterInput): Promise<AuthUser> {
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

  async list(query: ListUsersQuery): Promise<{ items: AuthUser[]; total: number }> {
    const { items, total } = await userRepository.findPaginated({
      page: query.page,
      pageSize: query.pageSize,
      ...(query.search ? { search: query.search } : {}),
    });
    return { items: items.map(toAuthUser), total };
  },

  async update(id: string, input: UpdateUserInput, actingUserId: string): Promise<AuthUser> {
    const user = await userRepository.findById(id);
    if (!user) throw ApiError.notFound('User not found');

    // Prevent an admin from locking themselves out.
    if (id === actingUserId) {
      if (input.role && input.role !== user.role) {
        throw ApiError.badRequest('You cannot change your own role');
      }
      if (input.status && input.status !== user.status) {
        throw ApiError.badRequest('You cannot change your own status');
      }
    }

    if (input.firstName !== undefined) user.firstName = input.firstName;
    if (input.lastName !== undefined) user.lastName = input.lastName;

    let invalidateSessions = false;
    if (input.role !== undefined && input.role !== user.role) {
      user.role = input.role;
      invalidateSessions = true;
    }
    if (input.status !== undefined && input.status !== user.status) {
      user.status = input.status as UserStatus;
      invalidateSessions = true;
    }
    // Force re-authentication so a new role or a disabled account takes effect.
    if (invalidateSessions) user.tokenVersion += 1;

    await user.save();
    return toAuthUser(user);
  },
};
