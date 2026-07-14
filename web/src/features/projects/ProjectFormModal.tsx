import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PRIORITIES,
  PRIORITY_LABELS,
  type ProjectDto,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES,
} from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { useEmployeeOptions } from '@/features/employees/employeeHooks';
import { useCreateProject, useUpdateProject } from './projectHooks';

const schema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.string().min(1),
  priority: z.string().min(1),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  leadId: z.string().optional(),
  budget: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const statusOptions = PROJECT_STATUSES.map((s) => ({ value: s, label: PROJECT_STATUS_LABELS[s] }));
const priorityOptions = PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }));

export function ProjectFormModal({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project?: ProjectDto;
}) {
  const isEdit = Boolean(project);
  const { toast } = useToast();
  const { data: options } = useEmployeeOptions();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject(project?.id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', status: 'planning', priority: 'medium', startDate: '', dueDate: '', leadId: '', budget: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      project
        ? {
            name: project.name,
            description: project.description ?? '',
            status: project.status,
            priority: project.priority,
            startDate: project.startDate ?? '',
            dueDate: project.dueDate ?? '',
            leadId: project.leadId ?? '',
            budget: project.budget != null ? String(project.budget) : '',
          }
        : { name: '', description: '', status: 'planning', priority: 'medium', startDate: '', dueDate: '', leadId: '', budget: '' },
    );
  }, [open, project, reset]);

  const leadOptions = [{ value: '', label: 'No lead' }, ...(options ?? []).map((o) => o.option)];

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      status: values.status,
      priority: values.priority,
      startDate: values.startDate || undefined,
      dueDate: values.dueDate || undefined,
      leadId: values.leadId || null,
      budget: values.budget ? Number(values.budget) : null,
    };
    try {
      if (isEdit && project) {
        await updateMutation.mutateAsync(payload);
        toast({ title: 'Project updated', tone: 'success' });
      } else {
        const created = await createMutation.mutateAsync(payload);
        toast({ title: 'Project created', description: created.code, tone: 'success' });
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Could not save project',
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
      size="lg"
      title={isEdit ? 'Edit project' : 'New project'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isSaving}>
            {isEdit ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField label="Project name" error={errors.name?.message} {...register('name')} />
        <Textarea label="Description" rows={2} {...register('description')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Status" options={statusOptions} {...register('status')} />
          <Select label="Priority" options={priorityOptions} {...register('priority')} />
          <TextField label="Start date" type="date" {...register('startDate')} />
          <TextField label="Due date" type="date" {...register('dueDate')} />
          <Select label="Project lead" options={leadOptions} {...register('leadId')} />
          <TextField label="Budget" type="number" {...register('budget')} />
        </div>
      </form>
    </Modal>
  );
}
