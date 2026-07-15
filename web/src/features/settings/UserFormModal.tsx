import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type AuthUser, ROLE_LABELS, ROLES } from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { useCreateUser, useUpdateUser } from './settingsHooks';

const roleOptions = ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }));
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
];

const schema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().optional(),
  role: z.string().min(1),
  status: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

export function UserFormModal({ open, onClose, user }: { open: boolean; onClose: () => void; user?: AuthUser }) {
  const isEdit = Boolean(user);
  const { toast } = useToast();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser(user?.id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', role: 'employee', status: 'active' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      user
        ? { firstName: user.firstName, lastName: user.lastName, email: user.email, password: '', role: user.role, status: user.status }
        : { firstName: '', lastName: '', email: '', password: '', role: 'employee', status: 'active' },
    );
  }, [open, user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEdit && user) {
        await updateUser.mutateAsync({ firstName: values.firstName, lastName: values.lastName, role: values.role, status: values.status });
        toast({ title: 'User updated', tone: 'success' });
      } else {
        if (!values.password || values.password.length < 8) {
          toast({ title: 'Password required', description: 'At least 8 characters with upper, lower, and a number.', tone: 'error' });
          return;
        }
        await createUser.mutateAsync({ firstName: values.firstName, lastName: values.lastName, email: values.email, password: values.password, role: values.role });
        toast({ title: 'User created', tone: 'success' });
      }
      onClose();
    } catch (error) {
      toast({ title: 'Could not save user', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  });

  const isSaving = createUser.isPending || updateUser.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit user' : 'New user'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={onSubmit} isLoading={isSaving}>{isEdit ? 'Save changes' : 'Create user'}</Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <TextField label="First name" error={errors.firstName?.message} {...register('firstName')} />
          <TextField label="Last name" error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <TextField label="Email" type="email" disabled={isEdit} error={errors.email?.message} {...register('email')} />
        {!isEdit && (
          <TextField label="Temporary password" type="password" hint="Min 8 chars, with upper, lower, and a number." {...register('password')} />
        )}
        <div className="grid grid-cols-2 gap-4">
          <Select label="Role" options={roleOptions} {...register('role')} />
          {isEdit && <Select label="Status" options={statusOptions} {...register('status')} />}
        </div>
      </form>
    </Modal>
  );
}
