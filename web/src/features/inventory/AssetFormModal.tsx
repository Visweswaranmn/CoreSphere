import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ASSET_CATEGORIES, type AssetDto } from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { useCreateAsset, useUpdateAsset } from './inventoryHooks';

const schema = z.object({
  name: z.string().trim().min(1, 'Asset name is required'),
  category: z.string().min(1, 'Select a category'),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchaseCost: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const categoryOptions = ASSET_CATEGORIES.map((c) => ({ value: c, label: c }));
const empty: FormValues = { name: '', category: '', serialNumber: '', purchaseDate: '', purchaseCost: '', location: '', notes: '' };

export function AssetFormModal({ open, onClose, asset }: { open: boolean; onClose: () => void; asset?: AssetDto }) {
  const isEdit = Boolean(asset);
  const { toast } = useToast();
  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset(asset?.id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => {
    if (!open) return;
    reset(
      asset
        ? {
            name: asset.name,
            category: asset.category,
            serialNumber: asset.serialNumber ?? '',
            purchaseDate: asset.purchaseDate ?? '',
            purchaseCost: asset.purchaseCost != null ? String(asset.purchaseCost) : '',
            location: asset.location ?? '',
            notes: asset.notes ?? '',
          }
        : empty,
    );
  }, [open, asset, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      category: values.category,
      serialNumber: values.serialNumber || undefined,
      purchaseDate: values.purchaseDate || undefined,
      purchaseCost: values.purchaseCost ? Number(values.purchaseCost) : undefined,
      location: values.location || undefined,
      notes: values.notes || undefined,
    };
    try {
      if (isEdit && asset) {
        await updateMutation.mutateAsync(payload);
        toast({ title: 'Asset updated', tone: 'success' });
      } else {
        const created = await createMutation.mutateAsync(payload);
        toast({ title: 'Asset created', description: created.code, tone: 'success' });
      }
      onClose();
    } catch (error) {
      toast({ title: 'Could not save asset', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit asset' : 'New asset'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={onSubmit} isLoading={isSaving}>{isEdit ? 'Save changes' : 'Create asset'}</Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Asset name" error={errors.name?.message} {...register('name')} />
        <Select label="Category" placeholder="Select category" options={categoryOptions} error={errors.category?.message} {...register('category')} />
        <TextField label="Serial number" {...register('serialNumber')} />
        <TextField label="Location" {...register('location')} />
        <TextField label="Purchase date" type="date" {...register('purchaseDate')} />
        <TextField label="Purchase cost" type="number" {...register('purchaseCost')} />
        <div className="sm:col-span-2">
          <Textarea label="Notes" rows={2} {...register('notes')} />
        </div>
      </form>
    </Modal>
  );
}
