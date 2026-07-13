import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

/**
 * Validates and normalizes process environment variables at startup.
 * Fail fast: a misconfigured environment should crash before serving traffic.
 */
const DEV_SECRET_PLACEHOLDER = 'dev-insecure-change-me';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    CORS_ORIGINS: z
      .string()
      .default('http://localhost:5173')
      .transform((value) =>
        value
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
    JWT_ACCESS_SECRET: z.string().min(1).default(DEV_SECRET_PLACEHOLDER),
    JWT_REFRESH_SECRET: z.string().min(1).default(DEV_SECRET_PLACEHOLDER),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    /** Refresh cookie lifetime in days; must match JWT_REFRESH_EXPIRES_IN. */
    REFRESH_COOKIE_DAYS: z.coerce.number().int().positive().default(7),
  })
  .superRefine((value, ctx) => {
    // In production, real secrets are mandatory — never ship the dev placeholder.
    if (value.NODE_ENV === 'production') {
      for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
        if (value[key] === DEV_SECRET_PLACEHOLDER || value[key].length < 32) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: `${key} must be a strong secret (>=32 chars) in production`,
          });
        }
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  console.error(`✗ Invalid environment configuration:\n${issues}`);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
