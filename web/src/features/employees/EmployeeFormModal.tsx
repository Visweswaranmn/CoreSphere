import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DEPARTMENTS,
  type EmployeeDto,
  EMPLOYMENT_TYPE_LABELS,
  EMPLOYMENT_TYPES,
} from '@coresphere/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import type { EmployeePayload } from './employeesApi';
import { useCreateEmployee, useEmployeeOptions, useUpdateEmployee } from './employeeHooks';
import { employeeFormSchema, type EmployeeFormValues } from './employeeSchema';

interface EmployeeFormModalProps {
  open: boolean;
  onClose: () => void;
  employee?: EmployeeDto;
}

const emptyValues: EmployeeFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  jobTitle: '',
  employmentType: '',
  dateOfJoining: '',
  location: '',
  managerId: '',
};

const departmentOptions = DEPARTMENTS.map((d) => ({ value: d, label: d }));
const employmentTypeOptions = EMPLOYMENT_TYPES.map((t) => ({
  value: t,
  label: EMPLOYMENT_TYPE_LABELS[t],
}));

export function EmployeeFormModal({ open, onClose, employee }: EmployeeFormModalProps) {
  const isEdit = Boolean(employee);
  const { toast } = useToast();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee(employee?.id ?? '');
  const { data: options } = useEmployeeOptions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      employee
        ? {
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.phone ?? '',
            department: employee.department,
            jobTitle: employee.jobTitle,
            employmentType: employee.employmentType,
            dateOfJoining: employee.dateOfJoining.slice(0, 10),
            location: employee.location ?? '',
            managerId: employee.managerId ?? '',
          }
        : emptyValues,
    );
  }, [open, employee, reset]);

  const managerOptions = (options ?? [])
    .filter((o) => o.option.value !== employee?.id)
    .map((o) => o.option);

  const onSubmit = handleSubmit(async (values) => {
    const payload: EmployeePayload = {
      ...values,
      phone: values.phone || undefined,
      location: values.location || undefined,
      managerId: values.managerId || null,
    };

    try {
      if (isEdit && employee) {
        await updateMutation.mutateAsync(payload);
        toast({ title: 'Employee updated', tone: 'success' });
      } else {
        const created = await createMutation.mutateAsync(payload);
        toast({ title: 'Employee added', description: created.employeeCode, tone: 'success' });
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Could not save employee',
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
      title={isEdit ? 'Edit employee' : 'Add employee'}
      description={isEdit ? undefined : 'New employees start in the onboarding stage.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSubmit} isLoading={isSaving}>
            {isEdit ? 'Save changes' : 'Add employee'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="First name" error={errors.firstName?.message} {...register('firstName')} />
        <TextField label="Last name" error={errors.lastName?.message} {...register('lastName')} />
        <TextField
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField label="Phone" error={errors.phone?.message} {...register('phone')} />
        <Select
          label="Department"
          placeholder="Select department"
          options={departmentOptions}
          error={errors.department?.message}
          {...register('department')}
        />
        <TextField label="Job title" error={errors.jobTitle?.message} {...register('jobTitle')} />
        <Select
          label="Employment type"
          placeholder="Select type"
          options={employmentTypeOptions}
          error={errors.employmentType?.message}
          {...register('employmentType')}
        />
        <TextField
          label="Date of joining"
          type="date"
          error={errors.dateOfJoining?.message}
          {...register('dateOfJoining')}
        />
        <TextField label="Location" error={errors.location?.message} {...register('location')} />
        <Select
          label="Manager (optional)"
          placeholder="No manager"
          options={managerOptions}
          error={errors.managerId?.message}
          {...register('managerId')}
        />
      </form>
    </Modal>
  );
}
