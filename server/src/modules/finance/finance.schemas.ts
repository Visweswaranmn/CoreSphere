import { z } from 'zod';
import { EXPENSE_CATEGORIES, ExpenseStatus } from '@coresphere/shared';
import { paginationQuerySchema } from '../../utils/pagination';
import { objectId } from '../employees/employee.schemas';

const categoryEnum = z.enum([...EXPENSE_CATEGORIES] as unknown as [string, ...string[]]);

// ─── Expenses ────────────────────────────────────────────────────────────────
export const createExpenseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  category: categoryEnum,
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  date: z.coerce.date(),
  employeeId: objectId,
  description: z.string().trim().max(1000).optional(),
});

export const updateExpenseSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  category: categoryEnum.optional(),
  amount: z.coerce.number().positive().optional(),
  date: z.coerce.date().optional(),
  description: z.string().trim().max(1000).optional(),
});

export const expenseDecisionSchema = z.object({
  status: z
    .nativeEnum(ExpenseStatus)
    .refine((s) => s === ExpenseStatus.Approved || s === ExpenseStatus.Rejected, {
      message: 'Decision must be approve or reject',
    }),
  note: z.string().trim().max(500).optional(),
});

export const listExpensesQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  status: z.nativeEnum(ExpenseStatus).optional(),
  category: z.string().trim().optional(),
  employeeId: objectId.optional(),
});

// ─── Budgets ─────────────────────────────────────────────────────────────────
export const createBudgetSchema = z.object({
  name: z.string().trim().min(1, 'Budget name is required').max(160),
  category: categoryEnum,
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  amount: z.coerce.number().min(0),
});

export const updateBudgetSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  amount: z.coerce.number().min(0).optional(),
});

export const listBudgetsQuerySchema = paginationQuerySchema.extend({
  category: z.string().trim().optional(),
  year: z.coerce.number().int().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseDecisionInput = z.infer<typeof expenseDecisionSchema>;
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type ListBudgetsQuery = z.infer<typeof listBudgetsQuerySchema>;
