import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type VendorDto, VENDOR_CATEGORIES } from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { useCreateVendor, useUpdateVendor } from './procurementHooks';

const schema = z.object({
  name: z.string().trim().min(1, 'Vendor name is required'),
  contactName: z.string().optional(),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().optional(),
  address: z.string().optional(),
  category: z.string().min(1, 'Select a category'),
  taxId: z.string().optional(),
  website: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const categoryOptions = VENDOR_CATEGORIES.map((c) => ({ value: c, label: c }));
const empty: FormValues = {
  name: '', contactName: '', email: '', phone: '', address: '', category: '', taxId: '', website: '', notes: '',
};

export function VendorFormModal({
  open,
  onClose,
  vendor,
}: {
  open: boolean;
  onClose: () => void;
  vendor?: VendorDto;
}) {
  const isEdit = Boolean(vendor);
  const { toast } = useToast();
  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor(vendor?.id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => {
    if (!open) return;
    reset(
      vendor
        ? {
            name: vendor.name,
            contactName: vendor.contactName ?? '',
            email: vendor.email,
            phone: vendor.phone ?? '',
            address: vendor.address ?? '',
            category: vendor.category,
            taxId: vendor.taxId ?? '',
            website: vendor.website ?? '',
            notes: vendor.notes ?? '',
          }
        : empty,
    );
  }, [open, vendor, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      contactName: values.contactName || undefined,
      email: values.email,
      phone: values.phone || undefined,
      address: values.address || undefined,
      category: values.category,
      taxId: values.taxId || undefined,
      website: values.website || undefined,
      notes: values.notes || undefined,
    };
    try {
      if (isEdit && vendor) {
        await updateMutation.mutateAsync(payload);
        toast({ title: 'Vendor updated', tone: 'success' });
      } else {
        const created = await createMutation.mutateAsync(payload);
        toast({ title: 'Vendor created', description: created.code, tone: 'success' });
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Could not save vendor',
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
      title={isEdit ? 'Edit vendor' : 'New vendor'}
      description={isEdit ? undefined : 'New vendors require approval before purchase orders can be raised.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isSaving}>
            {isEdit ? 'Save changes' : 'Create vendor'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Vendor name" error={errors.name?.message} {...register('name')} />
        <Select label="Category" placeholder="Select category" options={categoryOptions} error={errors.category?.message} {...register('category')} />
        <TextField label="Contact name" {...register('contactName')} />
        <TextField label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <TextField label="Phone" {...register('phone')} />
        <TextField label="Tax ID" {...register('taxId')} />
        <TextField label="Website" {...register('website')} />
        <TextField label="Address" {...register('address')} />
        <div className="sm:col-span-2">
          <Textarea label="Notes" rows={2} {...register('notes')} />
        </div>
      </form>
    </Modal>
  );
}
