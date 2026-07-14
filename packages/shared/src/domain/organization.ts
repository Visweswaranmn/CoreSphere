/** Organizational departments. Managed centrally until Settings (Phase 13). */
export const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Sales',
  'Marketing',
  'Human Resources',
  'Finance',
  'Operations',
  'Procurement',
  'Information Technology',
  'Customer Support',
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export function isDepartment(value: unknown): value is Department {
  return typeof value === 'string' && (DEPARTMENTS as readonly string[]).includes(value);
}
