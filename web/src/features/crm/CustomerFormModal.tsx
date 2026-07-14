import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type CustomerDto, CUSTOMER_STATUS_LABELS, CUSTOMER_STATUSES, INDUSTRIES } from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { useCreateCustomer, useUpdateCustomer } from './crmHooks';

const schema = z.object({
  name: z.string().trim().min(1, 'Account name is required'),
  contactName: z.string().optional(),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().optional(),
  industry: z.string().min(1, 'Select an industry'),
  status: z.string().min(1),
  website: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const industryOptions = INDUSTRIES.map((v) => ({ value: v, label: v }));
const statusOptions = CUSTOMER_STATUSES.map((s) => ({ value: s, label: CUSTOMER_STATUS_LABELS[s] }));
const empty: FormValues = { name: '', contactName: '', email: '', phone: '', industry: '', status: 'prospect', website: '', address: '', notes: '' };

export function CustomerFormModal({ open, onClose, customer }: { open: boolean; onClose: () => void; customer?: CustomerDto }) {
  const isEdit = Boolean(customer);
  const { toast } = useToast();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer(customer?.id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => {
    if (!open) return;
    reset(
      customer
        ? {
            name: customer.name,
            contactName: customer.contactName ?? '',
            email: customer.email,
            phone: customer.phone ?? '',
            industry: customer.industry,
            status: customer.status,
            website: customer.website ?? '',
            address: customer.address ?? '',
            notes: customer.notes ?? '',
          }
        : empty,
    );
  }, [open, customer, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      contactName: values.contactName || undefined,
      email: values.email,
      phone: values.phone || undefined,
      industry: values.industry,
      status: values.status,
      website: values.website || undefined,
      address: values.address || undefined,
      notes: values.notes || undefined,
    };
    try {
      if (isEdit && customer) {
        await updateMutation.mutateAsync(payload);
        toast({ title: 'Customer updated', tone: 'success' });
      } else {
        const created = await createMutation.mutateAsync(payload);
        toast({ title: 'Customer created', description: created.code, tone: 'success' });
      }
      onClose();
    } catch (error) {
      toast({ title: 'Could not save customer', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit customer' : 'New customer'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={onSubmit} isLoading={isSaving}>{isEdit ? 'Save changes' : 'Create customer'}</Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Account name" error={errors.name?.message} {...register('name')} />
        <Select label="Industry" placeholder="Select industry" options={industryOptions} error={errors.industry?.message} {...register('industry')} />
        <TextField label="Contact name" {...register('contactName')} />
        <TextField label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <TextField label="Phone" {...register('phone')} />
        <Select label="Status" options={statusOptions} {...register('status')} />
        <TextField label="Website" {...register('website')} />
        <TextField label="Address" {...register('address')} />
        <div className="sm:col-span-2">
          <Textarea label="Notes" rows={2} {...register('notes')} />
        </div>
      </form>
    </Modal>
  );
}
