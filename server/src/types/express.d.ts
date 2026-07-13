import type { AuthPrincipal } from '../modules/auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      /** Populated by the `authenticate` middleware from a verified access token. */
      user?: AuthPrincipal;
    }
  }
}

export {};
