import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LEAVE_TYPE_LABELS, LEAVE_TYPES } from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { useEmployeeOptions } from '@/features/employees/employeeHooks';
import { useCreateLeave } from './leaveHooks';

const schema = z
  .object({
    employeeId: z.string().min(1, 'Select an employee'),
    type: z.string().min(1, 'Select a leave type'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    reason: z.string().trim().min(1, 'A reason is required'),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after the start date',
    path: ['endDate'],
  });
type FormValues = z.infer<typeof schema>;

const typeOptions = LEAVE_TYPES.map((t) => ({ value: t, label: LEAVE_TYPE_LABELS[t] }));

export function LeaveRequestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const { data: options } = useEmployeeOptions();
  const createMutation = useCreateLeave();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { employeeId: '', type: 'annual', startDate: '', endDate: '', reason: '' },
  });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const employeeOptions = (options ?? []).map((o) => o.option);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(values);
      toast({ title: 'Leave request submitted', tone: 'success' });
      onClose();
    } catch (error) {
      toast({
        title: 'Could not submit request',
        description: error instanceof ApiClientError ? error.message : 'Please try again.',
        tone: 'error',
      });
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request leave"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={createMutation.isPending}>
            Submit request
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Select
          label="Employee"
          placeholder="Select employee"
          options={employeeOptions}
          error={errors.employeeId?.message}
          {...register('employeeId')}
        />
        <Select label="Leave type" options={typeOptions} error={errors.type?.message} {...register('type')} />
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Start date" type="date" error={errors.startDate?.message} {...register('startDate')} />
          <TextField label="End date" type="date" error={errors.endDate?.message} {...register('endDate')} />
        </div>
        <Textarea label="Reason" rows={3} error={errors.reason?.message} {...register('reason')} />
      </form>
    </Modal>
  );
}
