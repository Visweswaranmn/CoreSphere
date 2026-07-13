import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/** Hashes a plaintext password using bcrypt. */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** Verifies a plaintext password against a stored bcrypt hash. */
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
