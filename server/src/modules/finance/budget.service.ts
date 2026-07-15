import { type BudgetDto, computeUtilization, formatPeriod } from '@coresphere/shared';
import { ApiError } from '../../utils/ApiError';
import { budgetRepository } from './budget.repository';
import { expenseRepository } from './expense.repository';
import type { BudgetHydrated } from './budget.model';
import type { CreateBudgetInput, ListBudgetsQuery, UpdateBudgetInput } from './finance.schemas';

function monthRange(month: number, year: number): { from: Date; to: Date } {
  const from = new Date(Date.UTC(year, month - 1, 1));
  const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { from, to };
}

async function toBudgetDto(doc: BudgetHydrated): Promise<BudgetDto> {
  const { from, to } = monthRange(doc.month, doc.year);
  const spent = await expenseRepository.spentInRange(doc.category, from, to);
  return {
    id: doc.id as string,
    name: doc.name,
    category: doc.category,
    month: doc.month,
    year: doc.year,
    periodLabel: formatPeriod(doc.month, doc.year),
    amount: doc.amount,
    spent,
    remaining: Math.round((doc.amount - spent) * 100) / 100,
    utilization: computeUtilization(spent, doc.amount),
  };
}

export const budgetService = {
  async list(query: ListBudgetsQuery): Promise<{ items: BudgetDto[]; total: number }> {
    const { items, total } = await budgetRepository.findPaginated(query);
    const dtos = await Promise.all(items.map(toBudgetDto));
    return { items: dtos, total };
  },

  async create(input: CreateBudgetInput): Promise<BudgetDto> {
    if (await budgetRepository.existsForPeriod(input.category, input.month, input.year)) {
      throw ApiError.conflict('A budget already exists for this category and period');
    }
    const budget = await budgetRepository.create({
      name: input.name,
      category: input.category,
      month: input.month,
      year: input.year,
      amount: input.amount,
    });
    return toBudgetDto(budget);
  },

  async update(id: string, input: UpdateBudgetInput): Promise<BudgetDto> {
    const budget = await budgetRepository.findById(id);
    if (!budget) throw ApiError.notFound('Budget not found');
    if (input.name !== undefined) budget.name = input.name;
    if (input.amount !== undefined) budget.amount = input.amount;
    await budget.save();
    return toBudgetDto(budget);
  },

  async remove(id: string): Promise<void> {
    const deleted = await budgetRepository.deleteById(id);
    if (!deleted) throw ApiError.notFound('Budget not found');
  },
};
