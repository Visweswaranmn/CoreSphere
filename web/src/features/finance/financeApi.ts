import type { BudgetDto, ExpenseDto, FinanceStats, Paginated } from '@coresphere/shared';
import { apiClient } from '@/lib/apiClient';
import { toQueryString } from '@/lib/queryString';

export interface ExpenseListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  category?: string;
  employeeId?: string;
}
export interface ExpensePayload {
  title: string;
  category: string;
  amount: number;
  date: string;
  employeeId: string;
  description?: string;
}
export interface BudgetPayload {
  name: string;
  category: string;
  month: number;
  year: number;
  amount: number;
}

export const financeApi = {
  // Expenses
  listExpenses(params: ExpenseListParams): Promise<Paginated<ExpenseDto>> {
    return apiClient.get<Paginated<ExpenseDto>>(`/finance/expenses${toQueryString({ ...params })}`);
  },
  expenseStats(): Promise<FinanceStats> {
    return apiClient.get<FinanceStats>('/finance/expenses/stats');
  },
  getExpense(id: string): Promise<ExpenseDto> {
    return apiClient.get<ExpenseDto>(`/finance/expenses/${id}`);
  },
  createExpense(payload: ExpensePayload): Promise<ExpenseDto> {
    return apiClient.post<ExpenseDto>('/finance/expenses', payload);
  },
  updateExpense(id: string, payload: Partial<ExpensePayload>): Promise<ExpenseDto> {
    return apiClient.patch<ExpenseDto>(`/finance/expenses/${id}`, payload);
  },
  submitExpense(id: string): Promise<ExpenseDto> {
    return apiClient.post<ExpenseDto>(`/finance/expenses/${id}/submit`);
  },
  decideExpense(id: string, status: 'approved' | 'rejected', note?: string): Promise<ExpenseDto> {
    return apiClient.post<ExpenseDto>(`/finance/expenses/${id}/decision`, { status, note });
  },
  reimburseExpense(id: string): Promise<ExpenseDto> {
    return apiClient.post<ExpenseDto>(`/finance/expenses/${id}/reimburse`);
  },
  deleteExpense(id: string): Promise<{ id: string }> {
    return apiClient.delete<{ id: string }>(`/finance/expenses/${id}`);
  },

  // Budgets
  listBudgets(params: { page?: number; pageSize?: number; category?: string; year?: number }): Promise<Paginated<BudgetDto>> {
    return apiClient.get<Paginated<BudgetDto>>(`/finance/budgets${toQueryString({ ...params })}`);
  },
  createBudget(payload: BudgetPayload): Promise<BudgetDto> {
    return apiClient.post<BudgetDto>('/finance/budgets', payload);
  },
  updateBudget(id: string, payload: { name?: string; amount?: number }): Promise<BudgetDto> {
    return apiClient.patch<BudgetDto>(`/finance/budgets/${id}`, payload);
  },
  deleteBudget(id: string): Promise<{ id: string }> {
    return apiClient.delete<{ id: string }>(`/finance/budgets/${id}`);
  },
};
