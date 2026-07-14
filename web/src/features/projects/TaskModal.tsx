import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PRIORITIES,
  PRIORITY_LABELS,
  type TaskDto,
  TASK_STATUS_LABELS,
  TASK_STATUSES,
} from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { useEmployeeOptions } from '@/features/employees/employeeHooks';
import { useCreateTask, useUpdateTask } from './projectHooks';

const schema = z.object({
  title: z.string().trim().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.string().min(1),
  priority: z.string().min(1),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const statusOptions = TASK_STATUSES.map((s) => ({ value: s, label: TASK_STATUS_LABELS[s] }));
const priorityOptions = PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }));

export function TaskModal({
  open,
  onClose,
  projectId,
  task,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  task?: TaskDto;
}) {
  const isEdit = Boolean(task);
  const { toast } = useToast();
  const { data: options } = useEmployeeOptions();
  const createMutation = useCreateTask(projectId);
  const updateMutation = useUpdateTask();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', status: 'todo', priority: 'medium', assigneeId: '', dueDate: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      task
        ? {
            title: task.title,
            description: task.description ?? '',
            status: task.status,
            priority: task.priority,
            assigneeId: task.assigneeId ?? '',
            dueDate: task.dueDate ?? '',
          }
        : { title: '', description: '', status: 'todo', priority: 'medium', assigneeId: '', dueDate: '' },
    );
  }, [open, task, reset]);

  const assigneeOptions = [{ value: '', label: 'Unassigned' }, ...(options ?? []).map((o) => o.option)];

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      title: values.title,
      description: values.description || undefined,
      status: values.status,
      priority: values.priority,
      assigneeId: values.assigneeId || null,
      dueDate: values.dueDate || null,
    };
    try {
      if (isEdit && task) {
        await updateMutation.mutateAsync({ taskId: task.id, payload });
        toast({ title: 'Task updated', tone: 'success' });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: 'Task created', tone: 'success' });
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Could not save task',
        description: error instanceof ApiClientError ? error.message : 'Please try again.',
        tone: 'error',
      });
    }
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit task' : 'New task'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isSaving}>
            {isEdit ? 'Save changes' : 'Create task'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField label="Title" error={errors.title?.message} {...register('title')} />
        <Textarea label="Description" rows={2} {...register('description')} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Status" options={statusOptions} {...register('status')} />
          <Select label="Priority" options={priorityOptions} {...register('priority')} />
          <Select label="Assignee" options={assigneeOptions} {...register('assigneeId')} />
          <TextField label="Due date" type="date" {...register('dueDate')} />
        </div>
      </form>
    </Modal>
  );
}
