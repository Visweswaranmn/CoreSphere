import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EXPENSE_CATEGORIES, type ExpenseDto } from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { useEmployeeOptions } from '@/features/employees/employeeHooks';
import { useCreateExpense, useUpdateExpense } from './financeHooks';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  category: z.string().min(1, 'Select a category'),
  amount: z.string().min(1, 'Amount is required'),
  date: z.string().min(1, 'Date is required'),
  employeeId: z.string().min(1, 'Select an employee'),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const categoryOptions = EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }));

export function ExpenseFormModal({ open, onClose, expense }: { open: boolean; onClose: () => void; expense?: ExpenseDto }) {
  const isEdit = Boolean(expense);
  const { toast } = useToast();
  const { data: options } = useEmployeeOptions();
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense(expense?.id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', category: '', amount: '', date: '', employeeId: '', description: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      expense
        ? {
            title: expense.title,
            category: expense.category,
            amount: String(expense.amount),
            date: expense.date,
            employeeId: expense.employeeId,
            description: expense.description ?? '',
          }
        : { title: '', category: '', amount: '', date: '', employeeId: '', description: '' },
    );
  }, [open, expense, reset]);

  const employeeOptions = [{ value: '', label: 'Select employee' }, ...(options ?? []).map((o) => o.option)];

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      title: values.title,
      category: values.category,
      amount: Number(values.amount),
      date: values.date,
      employeeId: values.employeeId,
      description: values.description || undefined,
    };
    try {
      if (isEdit && expense) {
        await updateMutation.mutateAsync(payload);
        toast({ title: 'Expense updated', tone: 'success' });
      } else {
        const created = await createMutation.mutateAsync(payload);
        toast({ title: 'Expense created', description: created.code, tone: 'success' });
      }
      onClose();
    } catch (error) {
      toast({ title: 'Could not save expense', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit expense' : 'New expense'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={onSubmit} isLoading={isSaving}>{isEdit ? 'Save changes' : 'Create expense'}</Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField label="Title" error={errors.title?.message} {...register('title')} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Category" placeholder="Select category" options={categoryOptions} error={errors.category?.message} {...register('category')} />
          <TextField label="Amount" type="number" error={errors.amount?.message} {...register('amount')} />
          <TextField label="Date incurred" type="date" error={errors.date?.message} {...register('date')} />
          <Select label="Claimant" options={employeeOptions} error={errors.employeeId?.message} {...register('employeeId')} />
        </div>
        <Textarea label="Description" rows={2} {...register('description')} />
      </form>
    </Modal>
  );
}
