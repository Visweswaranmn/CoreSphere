import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { STOCK_MOVEMENT_TYPE_LABELS, STOCK_MOVEMENT_TYPES } from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { useRecordMovement } from './inventoryHooks';

const schema = z.object({
  type: z.string().min(1),
  quantity: z.string().min(1, 'Quantity is required'),
  reason: z.string().optional(),
  reference: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const typeOptions = STOCK_MOVEMENT_TYPES.map((t) => ({ value: t, label: STOCK_MOVEMENT_TYPE_LABELS[t] }));

export function MovementModal({ open, onClose, itemId }: { open: boolean; onClose: () => void; itemId: string }) {
  const { toast } = useToast();
  const record = useRecordMovement(itemId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { type: 'in', quantity: '', reason: '', reference: '' } });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const type = watch('type');

  const onSubmit = handleSubmit(async (values) => {
    try {
      await record.mutateAsync({
        type: values.type,
        quantity: Number(values.quantity),
        reason: values.reason || undefined,
        reference: values.reference || undefined,
      });
      toast({ title: 'Stock movement recorded', tone: 'success' });
      onClose();
    } catch (error) {
      toast({ title: 'Could not record movement', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record stock movement"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={record.isPending}>Cancel</Button>
          <Button onClick={onSubmit} isLoading={record.isPending}>Record</Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Select label="Type" options={typeOptions} {...register('type')} />
        <TextField
          label={type === 'adjustment' ? 'Set quantity to' : 'Quantity'}
          type="number"
          hint={type === 'adjustment' ? 'Sets stock to this absolute value.' : undefined}
          error={errors.quantity?.message}
          {...register('quantity')}
        />
        <TextField label="Reason (optional)" {...register('reason')} />
        <TextField label="Reference (optional)" {...register('reference')} />
      </form>
    </Modal>
  );
}
