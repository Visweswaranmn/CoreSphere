import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { computePay, type SalaryStructureDto } from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/lib/format';
import { ApiClientError } from '@/lib/apiClient';
import { useEmployeeOptions } from '@/features/employees/employeeHooks';
import { useUpsertStructure } from './payrollHooks';

const componentSchema = z.object({
  name: z.string().trim().min(1, 'Required'),
  amount: z.coerce.number().min(0, '≥ 0'),
});

const schema = z.object({
  employeeId: z.string().min(1, 'Select an employee'),
  basicSalary: z.coerce.number().min(0, 'Must be zero or more'),
  effectiveFrom: z.string().min(1, 'Required'),
  allowances: z.array(componentSchema),
  deductions: z.array(componentSchema),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  structure?: SalaryStructureDto;
}

function ComponentRows({
  title,
  control,
  register,
  namePrefix,
}: {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  namePrefix: 'allowances' | 'deductions';
}) {
  const { fields, append, remove } = useFieldArray({ control, name: namePrefix });
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <Button type="button" size="sm" variant="ghost" onClick={() => append({ name: '', amount: 0 })}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      {fields.length === 0 ? (
        <p className="text-xs text-muted-fg">None added.</p>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <input
                placeholder="Name"
                className="h-9 flex-1 rounded-lg border border-input bg-surface px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register(`${namePrefix}.${index}.name` as const)}
              />
              <input
                type="number"
                placeholder="0"
                className="h-9 w-32 rounded-lg border border-input bg-surface px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register(`${namePrefix}.${index}.amount` as const)}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-1 text-muted-fg hover:text-danger"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SalaryStructureModal({ open, onClose, structure }: Props) {
  const isEdit = Boolean(structure);
  const { toast } = useToast();
  const { data: options } = useEmployeeOptions();
  const upsert = useUpsertStructure();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { employeeId: '', basicSalary: 0, effectiveFrom: '', allowances: [], deductions: [] },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      structure
        ? {
            employeeId: structure.employeeId,
            basicSalary: structure.basicSalary,
            effectiveFrom: structure.effectiveFrom.slice(0, 10),
            allowances: structure.allowances,
            deductions: structure.deductions,
          }
        : {
            employeeId: '',
            basicSalary: 0,
            effectiveFrom: new Date().toISOString().slice(0, 10),
            allowances: [],
            deductions: [],
          },
    );
  }, [open, structure, reset]);

  const values = watch();
  const preview = computePay(
    Number(values.basicSalary) || 0,
    (values.allowances ?? []).map((a) => ({ name: a.name, amount: Number(a.amount) || 0 })),
    (values.deductions ?? []).map((d) => ({ name: d.name, amount: Number(d.amount) || 0 })),
  );

  const onSubmit = handleSubmit(async (form) => {
    try {
      await upsert.mutateAsync({
        employeeId: form.employeeId,
        payload: {
          basicSalary: form.basicSalary,
          allowances: form.allowances,
          deductions: form.deductions,
          effectiveFrom: form.effectiveFrom,
        },
      });
      toast({ title: 'Salary structure saved', tone: 'success' });
      onClose();
    } catch (error) {
      toast({
        title: 'Could not save structure',
        description: error instanceof ApiClientError ? error.message : 'Please try again.',
        tone: 'error',
      });
    }
  });

  const employeeOptions = (options ?? []).map((o) => o.option);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Edit salary structure' : 'Add salary structure'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={upsert.isPending}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={upsert.isPending}>
            Save structure
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isEdit ? (
            <TextField label="Employee" value={`${structure?.employeeName} · ${structure?.employeeCode}`} disabled />
          ) : (
            <Select
              label="Employee"
              placeholder="Select employee"
              options={employeeOptions}
              error={errors.employeeId?.message}
              {...register('employeeId')}
            />
          )}
          <TextField
            label="Basic salary"
            type="number"
            error={errors.basicSalary?.message}
            {...register('basicSalary')}
          />
          <TextField
            label="Effective from"
            type="date"
            error={errors.effectiveFrom?.message}
            {...register('effectiveFrom')}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ComponentRows title="Allowances" control={control} register={register} namePrefix="allowances" />
          <ComponentRows title="Deductions" control={control} register={register} namePrefix="deductions" />
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-lg bg-surface-muted p-3 text-center">
          <div>
            <p className="text-xs text-muted-fg">Gross</p>
            <p className="text-sm font-semibold text-foreground">{formatCurrency(preview.grossPay)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-fg">Deductions</p>
            <p className="text-sm font-semibold text-danger">{formatCurrency(preview.totalDeductions)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-fg">Net</p>
            <p className="text-sm font-semibold text-success">{formatCurrency(preview.netPay)}</p>
          </div>
        </div>
      </form>
    </Modal>
  );
}
