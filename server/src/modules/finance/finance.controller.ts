import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/respond';
import { buildPaginated } from '../../utils/pagination';
import { ApiError } from '../../utils/ApiError';
import { expenseService } from './expense.service';
import { budgetService } from './budget.service';
import type {
  CreateBudgetInput,
  CreateExpenseInput,
  ExpenseDecisionInput,
  ListBudgetsQuery,
  ListExpensesQuery,
  UpdateBudgetInput,
  UpdateExpenseInput,
} from './finance.schemas';

// ─── Expenses ────────────────────────────────────────────────────────────────
export const listExpenses = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListExpensesQuery;
  const { items, total } = await expenseService.list(query);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const getExpenseStats = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await expenseService.stats());
});

export const getExpense = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await expenseService.getById(req.params.id as string));
});

export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.create(req.body as CreateExpenseInput);
  return sendSuccess(res, expense, 201, 'Expense created');
});

export const updateExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.update(req.params.id as string, req.body as UpdateExpenseInput);
  return sendSuccess(res, expense, 200, 'Expense updated');
});

export const submitExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.submit(req.params.id as string);
  return sendSuccess(res, expense, 200, 'Expense submitted');
});

export const decideExpense = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const expense = await expenseService.decide(
    req.params.id as string,
    req.user.id,
    req.body as ExpenseDecisionInput,
  );
  return sendSuccess(res, expense, 200, 'Decision recorded');
});

export const reimburseExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await expenseService.reimburse(req.params.id as string);
  return sendSuccess(res, expense, 200, 'Expense reimbursed');
});

export const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
  await expenseService.remove(req.params.id as string);
  return sendSuccess(res, { id: req.params.id }, 200, 'Expense removed');
});

// ─── Budgets ─────────────────────────────────────────────────────────────────
export const listBudgets = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListBudgetsQuery;
  const { items, total } = await budgetService.list(query);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const createBudget = asyncHandler(async (req: Request, res: Response) => {
  const budget = await budgetService.create(req.body as CreateBudgetInput);
  return sendSuccess(res, budget, 201, 'Budget created');
});

export const updateBudget = asyncHandler(async (req: Request, res: Response) => {
  const budget = await budgetService.update(req.params.id as string, req.body as UpdateBudgetInput);
  return sendSuccess(res, budget, 200, 'Budget updated');
});

export const deleteBudget = asyncHandler(async (req: Request, res: Response) => {
  await budgetService.remove(req.params.id as string);
  return sendSuccess(res, { id: req.params.id }, 200, 'Budget removed');
});
