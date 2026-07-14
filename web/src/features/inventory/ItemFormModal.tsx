import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  INVENTORY_CATEGORIES,
  INVENTORY_UNITS,
  type InventoryItemDto,
  WAREHOUSES,
} from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { useCreateItem, useUpdateItem } from './inventoryHooks';

const schema = z.object({
  name: z.string().trim().min(1, 'Item name is required'),
  category: z.string().min(1, 'Select a category'),
  unit: z.string().min(1, 'Select a unit'),
  warehouse: z.string().min(1, 'Select a warehouse'),
  quantity: z.string().optional(),
  reorderLevel: z.string().min(1, 'Required'),
  unitCost: z.string().min(1, 'Required'),
});
type FormValues = z.infer<typeof schema>;

const opt = (arr: readonly string[]) => arr.map((v) => ({ value: v, label: v }));

export function ItemFormModal({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item?: InventoryItemDto;
}) {
  const isEdit = Boolean(item);
  const { toast } = useToast();
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem(item?.id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', category: '', unit: '', warehouse: '', quantity: '0', reorderLevel: '0', unitCost: '0' },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      item
        ? {
            name: item.name,
            category: item.category,
            unit: item.unit,
            warehouse: item.warehouse,
            quantity: String(item.quantity),
            reorderLevel: String(item.reorderLevel),
            unitCost: String(item.unitCost),
          }
        : { name: '', category: '', unit: '', warehouse: '', quantity: '0', reorderLevel: '0', unitCost: '0' },
    );
  }, [open, item, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEdit && item) {
        await updateMutation.mutateAsync({
          name: values.name,
          category: values.category,
          unit: values.unit,
          warehouse: values.warehouse,
          reorderLevel: Number(values.reorderLevel),
          unitCost: Number(values.unitCost),
        });
        toast({ title: 'Item updated', tone: 'success' });
      } else {
        const created = await createMutation.mutateAsync({
          name: values.name,
          category: values.category,
          unit: values.unit,
          warehouse: values.warehouse,
          quantity: Number(values.quantity ?? '0'),
          reorderLevel: Number(values.reorderLevel),
          unitCost: Number(values.unitCost),
        });
        toast({ title: 'Item created', description: created.code, tone: 'success' });
      }
      onClose();
    } catch (error) {
      toast({ title: 'Could not save item', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit item' : 'New inventory item'}
      description={isEdit ? 'Stock quantity is adjusted through movements.' : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={onSubmit} isLoading={isSaving}>{isEdit ? 'Save changes' : 'Create item'}</Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Item name" error={errors.name?.message} {...register('name')} />
        <Select label="Category" placeholder="Select category" options={opt(INVENTORY_CATEGORIES)} error={errors.category?.message} {...register('category')} />
        <Select label="Unit" placeholder="Select unit" options={opt(INVENTORY_UNITS)} error={errors.unit?.message} {...register('unit')} />
        <Select label="Warehouse" placeholder="Select warehouse" options={opt(WAREHOUSES)} error={errors.warehouse?.message} {...register('warehouse')} />
        {!isEdit && <TextField label="Opening stock" type="number" error={errors.quantity?.message} {...register('quantity')} />}
        <TextField label="Reorder level" type="number" error={errors.reorderLevel?.message} {...register('reorderLevel')} />
        <TextField label="Unit cost" type="number" error={errors.unitCost?.message} {...register('unitCost')} />
      </form>
    </Modal>
  );
}
