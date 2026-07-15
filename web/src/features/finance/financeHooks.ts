import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  financeApi,
  type BudgetPayload,
  type ExpenseListParams,
  type ExpensePayload,
} from './financeApi';

export const financeKeys = {
  all: ['finance'] as const,
  expenses: (p: ExpenseListParams) => ['finance', 'expenses', p] as const,
  expense: (id: string) => ['finance', 'expense', id] as const,
  stats: () => ['finance', 'stats'] as const,
  budgets: (p: unknown) => ['finance', 'budgets', p] as const,
};

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: financeKeys.all });
}

// ─── Expenses ────────────────────────────────────────────────────────────────
export function useExpenses(params: ExpenseListParams) {
  return useQuery({
    queryKey: financeKeys.expenses(params),
    queryFn: () => financeApi.listExpenses(params),
    placeholderData: (previous) => previous,
  });
}
export function useExpense(id: string | undefined) {
  return useQuery({
    queryKey: financeKeys.expense(id ?? ''),
    queryFn: () => financeApi.getExpense(id as string),
    enabled: Boolean(id),
  });
}
export function useFinanceStats() {
  return useQuery({ queryKey: financeKeys.stats(), queryFn: () => financeApi.expenseStats() });
}
export function useCreateExpense() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (p: ExpensePayload) => financeApi.createExpense(p), onSuccess: invalidate });
}
export function useUpdateExpense(id: string) {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (p: Partial<ExpensePayload>) => financeApi.updateExpense(id, p), onSuccess: invalidate });
}
export function useExpenseAction() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (args:
      | { action: 'submit' | 'reimburse' | 'delete'; id: string }
      | { action: 'decide'; id: string; status: 'approved' | 'rejected'; note?: string }) => {
      switch (args.action) {
        case 'submit':
          return financeApi.submitExpense(args.id);
        case 'reimburse':
          return financeApi.reimburseExpense(args.id);
        case 'delete':
          return financeApi.deleteExpense(args.id);
        case 'decide':
          return financeApi.decideExpense(args.id, args.status, args.note);
      }
    },
    onSuccess: invalidate,
  });
}

// ─── Budgets ─────────────────────────────────────────────────────────────────
export function useBudgets(params: { page?: number; pageSize?: number; category?: string; year?: number }) {
  return useQuery({
    queryKey: financeKeys.budgets(params),
    queryFn: () => financeApi.listBudgets(params),
    placeholderData: (previous) => previous,
  });
}
export function useCreateBudget() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (p: BudgetPayload) => financeApi.createBudget(p), onSuccess: invalidate });
}
export function useUpdateBudget(id: string) {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (p: { name?: string; amount?: number }) => financeApi.updateBudget(id, p), onSuccess: invalidate });
}
export function useDeleteBudget() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => financeApi.deleteBudget(id), onSuccess: invalidate });
}
