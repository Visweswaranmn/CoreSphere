import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ATTENDANCE_STATUSES, ATTENDANCE_STATUS_LABELS } from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { useEmployeeOptions } from '@/features/employees/employeeHooks';
import { useRecordAttendance } from './attendanceHooks';

const schema = z.object({
  employeeId: z.string().min(1, 'Select an employee'),
  date: z.string().min(1, 'Date is required'),
  status: z.string().min(1, 'Select a status'),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const statusOptions = ATTENDANCE_STATUSES.map((s) => ({ value: s, label: ATTENDANCE_STATUS_LABELS[s] }));

export function RecordAttendanceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const { data: options } = useEmployeeOptions();
  const recordMutation = useRecordAttendance();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { employeeId: '', date: '', status: 'present', checkIn: '', checkOut: '', note: '' },
  });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const employeeOptions = (options ?? []).map((o) => o.option);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await recordMutation.mutateAsync({
        employeeId: values.employeeId,
        date: values.date,
        status: values.status,
        checkIn: values.checkIn || undefined,
        checkOut: values.checkOut || undefined,
        note: values.note || undefined,
      });
      toast({ title: 'Attendance recorded', tone: 'success' });
      onClose();
    } catch (error) {
      toast({
        title: 'Could not record attendance',
        description: error instanceof ApiClientError ? error.message : 'Please try again.',
        tone: 'error',
      });
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record attendance"
      description="Existing records for the same employee and day are updated."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={recordMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={recordMutation.isPending}>
            Save record
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
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Date" type="date" error={errors.date?.message} {...register('date')} />
          <Select label="Status" options={statusOptions} error={errors.status?.message} {...register('status')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Check in" type="time" error={errors.checkIn?.message} {...register('checkIn')} />
          <TextField label="Check out" type="time" error={errors.checkOut?.message} {...register('checkOut')} />
        </div>
        <TextField label="Note (optional)" error={errors.note?.message} {...register('note')} />
      </form>
    </Modal>
  );
}
