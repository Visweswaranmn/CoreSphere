import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@coresphere/shared';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { objectId } from '../employees/employee.schemas';
import {
  createBudgetSchema,
  createExpenseSchema,
  expenseDecisionSchema,
  listBudgetsQuerySchema,
  listExpensesQuerySchema,
  updateBudgetSchema,
  updateExpenseSchema,
} from './finance.schemas';
import {
  createBudget,
  createExpense,
  decideExpense,
  deleteBudget,
  deleteExpense,
  getExpense,
  getExpenseStats,
  listBudgets,
  listExpenses,
  reimburseExpense,
  submitExpense,
  updateBudget,
  updateExpense,
} from './finance.controller';

export const financeRouter: Router = Router();

const idParams = z.object({ id: objectId });

financeRouter.use(authenticate, authorize(Role.FinanceManager));

// ─── Expenses ────────────────────────────────────────────────────────────────
financeRouter.get('/expenses', validate({ query: listExpensesQuerySchema }), listExpenses);
financeRouter.get('/expenses/stats', getExpenseStats);
financeRouter.post('/expenses', validate({ body: createExpenseSchema }), createExpense);
financeRouter.get('/expenses/:id', validate({ params: idParams }), getExpense);
financeRouter.patch('/expenses/:id', validate({ params: idParams, body: updateExpenseSchema }), updateExpense);
financeRouter.post('/expenses/:id/submit', validate({ params: idParams }), submitExpense);
financeRouter.post('/expenses/:id/decision', validate({ params: idParams, body: expenseDecisionSchema }), decideExpense);
financeRouter.post('/expenses/:id/reimburse', validate({ params: idParams }), reimburseExpense);
financeRouter.delete('/expenses/:id', validate({ params: idParams }), deleteExpense);

// ─── Budgets ─────────────────────────────────────────────────────────────────
financeRouter.get('/budgets', validate({ query: listBudgetsQuerySchema }), listBudgets);
financeRouter.post('/budgets', validate({ body: createBudgetSchema }), createBudget);
financeRouter.patch('/budgets/:id', validate({ params: idParams, body: updateBudgetSchema }), updateBudget);
financeRouter.delete('/budgets/:id', validate({ params: idParams }), deleteBudget);
