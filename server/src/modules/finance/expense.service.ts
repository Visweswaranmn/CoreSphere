import { type ExpenseDto, ExpenseStatus, type FinanceStats } from '@coresphere/shared';
import { ApiError } from '../../utils/ApiError';
import { formatCode, nextSequence } from '../../utils/sequence';
import { employeeRepository } from '../employees/employee.repository';
import { expenseRepository } from './expense.repository';
import { toExpenseDto } from './expense.model';
import type {
  CreateExpenseInput,
  ExpenseDecisionInput,
  ListExpensesQuery,
  UpdateExpenseInput,
} from './finance.schemas';

async function reload(id: string): Promise<ExpenseDto> {
  const expense = await expenseRepository.findById(id);
  return toExpenseDto(expense!);
}

export const expenseService = {
  async list(query: ListExpensesQuery): Promise<{ items: ExpenseDto[]; total: number }> {
    const { items, total } = await expenseRepository.findPaginated(query);
    return { items: items.map(toExpenseDto), total };
  },

  async getById(id: string): Promise<ExpenseDto> {
    const expense = await expenseRepository.findById(id);
    if (!expense) throw ApiError.notFound('Expense not found');
    return toExpenseDto(expense);
  },

  async create(input: CreateExpenseInput): Promise<ExpenseDto> {
    const employee = await employeeRepository.findById(input.employeeId);
    if (!employee) throw ApiError.badRequest('The selected employee does not exist');

    const code = formatCode('EXP', await nextSequence('expense'));
    const created = await expenseRepository.create({
      code,
      title: input.title,
      category: input.category,
      amount: input.amount,
      date: input.date,
      employee: employee._id,
      status: ExpenseStatus.Draft,
      ...(input.description ? { description: input.description } : {}),
      approver: null,
      decidedAt: null,
      reimbursedAt: null,
    });
    return reload(created.id as string);
  },

  async update(id: string, input: UpdateExpenseInput): Promise<ExpenseDto> {
    const expense = await expenseRepository.findByIdRaw(id);
    if (!expense) throw ApiError.notFound('Expense not found');
    if (expense.status !== ExpenseStatus.Draft) {
      throw ApiError.badRequest('Only draft expenses can be edited');
    }

    if (input.title !== undefined) expense.title = input.title;
    if (input.category !== undefined) expense.category = input.category;
    if (input.amount !== undefined) expense.amount = input.amount;
    if (input.date !== undefined) expense.date = input.date;
    if (input.description !== undefined) expense.description = input.description;

    await expense.save();
    return reload(id);
  },

  async submit(id: string): Promise<ExpenseDto> {
    const expense = await expenseRepository.findByIdRaw(id);
    if (!expense) throw ApiError.notFound('Expense not found');
    if (expense.status !== ExpenseStatus.Draft) {
      throw ApiError.badRequest('Only draft expenses can be submitted');
    }
    expense.status = ExpenseStatus.Submitted;
    await expense.save();
    return reload(id);
  },

  async decide(id: string, approverUserId: string, input: ExpenseDecisionInput): Promise<ExpenseDto> {
    const expense = await expenseRepository.findByIdRaw(id);
    if (!expense) throw ApiError.notFound('Expense not found');
    if (expense.status !== ExpenseStatus.Submitted) {
      throw ApiError.badRequest('Only submitted expenses can be approved or rejected');
    }
    expense.status = input.status;
    expense.approver = approverUserId as unknown as never;
    expense.decisionNote = input.note;
    expense.decidedAt = new Date();
    await expense.save();
    return reload(id);
  },

  async reimburse(id: string): Promise<ExpenseDto> {
    const expense = await expenseRepository.findByIdRaw(id);
    if (!expense) throw ApiError.notFound('Expense not found');
    if (expense.status !== ExpenseStatus.Approved) {
      throw ApiError.badRequest('Only approved expenses can be reimbursed');
    }
    expense.status = ExpenseStatus.Reimbursed;
    expense.reimbursedAt = new Date();
    await expense.save();
    return reload(id);
  },

  async remove(id: string): Promise<void> {
    const expense = await expenseRepository.findByIdRaw(id);
    if (!expense) throw ApiError.notFound('Expense not found');
    if (expense.status !== ExpenseStatus.Draft) {
      throw ApiError.badRequest('Only draft expenses can be deleted');
    }
    await expenseRepository.deleteById(id);
  },

  async stats(): Promise<FinanceStats> {
    return expenseRepository.summary();
  },
};
