import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DEAL_STAGE_LABELS, DEAL_STAGES, type DealDto } from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { useCustomerOptions } from '@/features/crm/crmHooks';
import { useCreateDeal, useUpdateDeal } from './salesHooks';

const schema = z.object({
  title: z.string().trim().min(1, 'Deal title is required'),
  customerId: z.string().min(1, 'Select a customer'),
  value: z.string().min(1, 'Value is required'),
  stage: z.string().min(1),
  expectedCloseDate: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const stageOptions = DEAL_STAGES.map((s) => ({ value: s, label: DEAL_STAGE_LABELS[s] }));

export function DealFormModal({ open, onClose, deal }: { open: boolean; onClose: () => void; deal?: DealDto }) {
  const isEdit = Boolean(deal);
  const { toast } = useToast();
  const { data: customers } = useCustomerOptions();
  const createMutation = useCreateDeal();
  const updateMutation = useUpdateDeal(deal?.id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', customerId: '', value: '', stage: 'lead', expectedCloseDate: '', notes: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      deal
        ? {
            title: deal.title,
            customerId: deal.customerId,
            value: String(deal.value),
            stage: deal.stage,
            expectedCloseDate: deal.expectedCloseDate ?? '',
            notes: deal.notes ?? '',
          }
        : { title: '', customerId: '', value: '', stage: 'lead', expectedCloseDate: '', notes: '' },
    );
  }, [open, deal, reset]);

  const customerOptions = [{ value: '', label: 'Select customer' }, ...(customers ?? [])];

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      title: values.title,
      customerId: values.customerId,
      value: Number(values.value),
      stage: values.stage,
      expectedCloseDate: values.expectedCloseDate || undefined,
      notes: values.notes || undefined,
    };
    try {
      if (isEdit && deal) {
        await updateMutation.mutateAsync(payload);
        toast({ title: 'Deal updated', tone: 'success' });
      } else {
        const created = await createMutation.mutateAsync(payload);
        toast({ title: 'Deal created', description: created.code, tone: 'success' });
      }
      onClose();
    } catch (error) {
      toast({ title: 'Could not save deal', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit deal' : 'New deal'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={onSubmit} isLoading={isSaving}>{isEdit ? 'Save changes' : 'Create deal'}</Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField label="Deal title" error={errors.title?.message} {...register('title')} />
        <Select label="Customer" options={customerOptions} error={errors.customerId?.message} {...register('customerId')} />
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Value" type="number" error={errors.value?.message} {...register('value')} />
          <Select label="Stage" options={stageOptions} {...register('stage')} />
        </div>
        <TextField label="Expected close date" type="date" {...register('expectedCloseDate')} />
        <Textarea label="Notes" rows={2} {...register('notes')} />
      </form>
    </Modal>
  );
}
