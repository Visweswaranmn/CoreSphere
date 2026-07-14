import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { computeOrderTotals } from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/lib/format';
import { ApiClientError } from '@/lib/apiClient';
import { useCreateOrder, useVendors } from './procurementHooks';

const schema = z.object({
  vendorId: z.string().min(1, 'Select a vendor'),
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().optional(),
  taxRate: z.coerce.number().min(0).max(100),
  expectedDate: z.string().optional(),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Required'),
        quantity: z.coerce.number().positive('> 0'),
        unitPrice: z.coerce.number().min(0, '≥ 0'),
      }),
    )
    .min(1, 'Add at least one item'),
});
type FormValues = z.infer<typeof schema>;

export function OrderFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const { data: vendorsData } = useVendors({ status: 'approved', pageSize: 100 });

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { vendorId: '', title: '', description: '', taxRate: 0, expectedDate: '', items: [{ name: '', quantity: 1, unitPrice: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const vendorOptions = [
    { value: '', label: 'Select vendor' },
    ...(vendorsData?.items ?? []).map((v) => ({ value: v.id, label: `${v.name} · ${v.code}` })),
  ];

  const values = watch();
  const preview = computeOrderTotals(
    (values.items ?? []).map((i) => ({ name: i.name, quantity: Number(i.quantity) || 0, unitPrice: Number(i.unitPrice) || 0 })),
    Number(values.taxRate) || 0,
  );

  const onSubmit = handleSubmit(async (form) => {
    try {
      const created = await createOrder.mutateAsync({
        vendorId: form.vendorId,
        title: form.title,
        description: form.description || undefined,
        taxRate: form.taxRate,
        expectedDate: form.expectedDate || undefined,
        items: form.items,
      });
      toast({ title: 'Purchase order created', description: created.code, tone: 'success' });
      onClose();
    } catch (error) {
      toast({ title: 'Could not create order', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="New purchase order"
      description="Orders start as a draft. Vendors must be approved."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createOrder.isPending}>Cancel</Button>
          <Button onClick={onSubmit} isLoading={createOrder.isPending}>Create draft</Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Vendor" options={vendorOptions} error={errors.vendorId?.message} {...register('vendorId')} />
          <TextField label="Title" error={errors.title?.message} {...register('title')} />
        </div>
        <Textarea label="Description" rows={2} {...register('description')} />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Line items</p>
            <Button type="button" size="sm" variant="ghost" onClick={() => append({ name: '', quantity: 1, unitPrice: 0 })}>
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          </div>
          {errors.items?.message && <p className="mb-2 text-xs text-danger">{errors.items.message}</p>}
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <input placeholder="Item name" className="h-9 flex-1 rounded-lg border border-input bg-surface px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...register(`items.${index}.name` as const)} />
                <input type="number" placeholder="Qty" className="h-9 w-20 rounded-lg border border-input bg-surface px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...register(`items.${index}.quantity` as const)} />
                <input type="number" placeholder="Unit price" className="h-9 w-28 rounded-lg border border-input bg-surface px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...register(`items.${index}.unitPrice` as const)} />
                <button type="button" onClick={() => remove(index)} className="mt-1 text-muted-fg hover:text-danger" aria-label="Remove item">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Tax rate (%)" type="number" {...register('taxRate')} />
          <TextField label="Expected date" type="date" {...register('expectedDate')} />
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-lg bg-surface-muted p-3 text-center">
          <div>
            <p className="text-xs text-muted-fg">Subtotal</p>
            <p className="text-sm font-semibold text-foreground">{formatCurrency(preview.subtotal)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-fg">Tax</p>
            <p className="text-sm font-semibold text-foreground">{formatCurrency(preview.taxAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-fg">Total</p>
            <p className="text-sm font-semibold text-primary">{formatCurrency(preview.total)}</p>
          </div>
        </div>
      </form>
    </Modal>
  );
}
