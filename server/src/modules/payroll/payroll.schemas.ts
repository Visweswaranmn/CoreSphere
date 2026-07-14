import { z } from 'zod';
import { PayrollRunStatus } from '@coresphere/shared';
import { paginationQuerySchema } from '../../utils/pagination';
import { objectId } from '../employees/employee.schemas';

const componentSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
  amount: z.coerce.number().min(0, 'Amount must be zero or more'),
});

export const upsertStructureSchema = z.object({
  basicSalary: z.coerce.number().min(0, 'Basic salary must be zero or more'),
  allowances: z.array(componentSchema).max(20).default([]),
  deductions: z.array(componentSchema).max(20).default([]),
  effectiveFrom: z.coerce.date(),
});

export const listStructuresQuerySchema = paginationQuerySchema;

export const createRunSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  notes: z.string().trim().max(300).optional(),
});

export const listRunsQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(PayrollRunStatus).optional(),
});

export const listPayslipsQuerySchema = paginationQuerySchema.extend({
  runId: objectId.optional(),
  employeeId: objectId.optional(),
});

export type UpsertStructureInput = z.infer<typeof upsertStructureSchema>;
export type CreateRunInput = z.infer<typeof createRunSchema>;
export type ListRunsQuery = z.infer<typeof listRunsQuerySchema>;
export type ListStructuresQuery = z.infer<typeof listStructuresQuerySchema>;
export type ListPayslipsQuery = z.infer<typeof listPayslipsQuerySchema>;
