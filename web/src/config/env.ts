import { z } from 'zod';

/** Validates Vite-exposed environment variables (must be `VITE_`-prefixed). */
const schema = z.object({
  VITE_API_BASE_URL: z.string().min(1).default('/api/v1'),
});

const parsed = schema.safeParse(import.meta.env);

if (!parsed.success) {
  throw new Error(`Invalid web environment configuration: ${parsed.error.message}`);
}

export const env = parsed.data;
