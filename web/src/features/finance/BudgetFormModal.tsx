import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type BudgetDto, EXPENSE_CATEGORIES, MONTH_NAMES } from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { useCreateBudget, useUpdateBudget } from './financeHooks';

const schema = z.object({
  name: z.string().trim().min(1, 'Budget name is required'),
  category: z.string().min(1, 'Select a category'),
  month: z.string().min(1),
  year: z.string().min(1),
  amount: z.string().min(1, 'Amount is required'),
});
type FormValues = z.infer<typeof schema>;

const now = new Date();
const categoryOptions = EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }));
const monthOptions = MONTH_NAMES.map((name, i) => ({ value: String(i + 1), label: name }));

export function BudgetFormModal({ open, onClose, budget }: { open: boolean; onClose: () => void; budget?: BudgetDto }) {
  const isEdit = Boolean(budget);
  const { toast } = useToast();
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget(budget?.id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', category: '', month: String(now.getMonth() + 1), year: String(now.getFullYear()), amount: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      budget
        ? { name: budget.name, category: budget.category, month: String(budget.month), year: String(budget.year), amount: String(budget.amount) }
        : { name: '', category: '', month: String(now.getMonth() + 1), year: String(now.getFullYear()), amount: '' },
    );
  }, [open, budget, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEdit && budget) {
        await updateMutation.mutateAsync({ name: values.name, amount: Number(values.amount) });
        toast({ title: 'Budget updated', tone: 'success' });
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          category: values.category,
          month: Number(values.month),
          year: Number(values.year),
          amount: Number(values.amount),
        });
        toast({ title: 'Budget created', tone: 'success' });
      }
      onClose();
    } catch (error) {
      toast({ title: 'Could not save budget', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit budget' : 'New budget'}
      description={isEdit ? 'Category and period are fixed; adjust the allocation.' : 'Spend is tracked from approved expenses in this category and period.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={onSubmit} isLoading={isSaving}>{isEdit ? 'Save changes' : 'Create budget'}</Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField label="Budget name" error={errors.name?.message} {...register('name')} />
        <Select label="Category" placeholder="Select category" options={categoryOptions} error={errors.category?.message} disabled={isEdit} {...register('category')} />
        <div className="grid grid-cols-3 gap-4">
          <Select label="Month" options={monthOptions} disabled={isEdit} {...register('month')} />
          <TextField label="Year" type="number" disabled={isEdit} {...register('year')} />
          <TextField label="Amount" type="number" error={errors.amount?.message} {...register('amount')} />
        </div>
      </form>
    </Modal>
  );
}
