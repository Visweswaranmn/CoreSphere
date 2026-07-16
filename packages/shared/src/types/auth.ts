import type { Role } from '../rbac/roles';

/** Lifecycle state of a user account. */
export type UserStatus = 'active' | 'invited' | 'disabled';

/** The authenticated user shape returned to the client (never includes secrets). */
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: Role;
  status: UserStatus;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** Payload used by a Super Admin to provision a new user account. */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

/** Payload for public self-service registration. The role is fixed server-side. */
export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/** Successful authentication result: the user plus a short-lived access token. */
export interface AuthResult {
  user: AuthUser;
  accessToken: string;
}
