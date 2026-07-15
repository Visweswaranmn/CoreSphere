import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CURRENCIES, MONTH_NAMES, TIMEZONES } from '@coresphere/shared';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { useSettings, useUpdateSettings } from './settingsHooks';

const schema = z.object({
  name: z.string().trim().min(1, 'Organization name is required'),
  legalName: z.string().optional(),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().min(1),
  timezone: z.string().min(1),
  fiscalYearStartMonth: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

const currencyOptions = CURRENCIES.map((c) => ({ value: c, label: c }));
const timezoneOptions = TIMEZONES.map((t) => ({ value: t, label: t }));
const monthOptions = MONTH_NAMES.map((m, i) => ({ value: String(i + 1), label: m }));

export function OrgProfilePanel() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useSettings();
  const update = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!settings) return;
    reset({
      name: settings.name,
      legalName: settings.legalName ?? '',
      email: settings.email,
      phone: settings.phone ?? '',
      address: settings.address ?? '',
      currency: settings.currency,
      timezone: settings.timezone,
      fiscalYearStartMonth: String(settings.fiscalYearStartMonth),
    });
  }, [settings, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await update.mutateAsync({
        name: values.name,
        legalName: values.legalName || undefined,
        email: values.email,
        phone: values.phone || undefined,
        address: values.address || undefined,
        currency: values.currency,
        timezone: values.timezone,
        fiscalYearStartMonth: Number(values.fiscalYearStartMonth),
      });
      toast({ title: 'Settings saved', tone: 'success' });
    } catch (error) {
      toast({ title: 'Could not save settings', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  });

  if (isLoading || !settings) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Organization name" error={errors.name?.message} {...register('name')} />
            <TextField label="Legal name" {...register('legalName')} />
            <TextField label="Contact email" type="email" error={errors.email?.message} {...register('email')} />
            <TextField label="Phone" {...register('phone')} />
            <div className="sm:col-span-2">
              <TextField label="Address" {...register('address')} />
            </div>
            <Select label="Default currency" options={currencyOptions} {...register('currency')} />
            <Select label="Timezone" options={timezoneOptions} {...register('timezone')} />
            <Select label="Fiscal year starts" options={monthOptions} {...register('fiscalYearStartMonth')} />
          </div>
          <div className="flex justify-end">
            <Button onClick={onSubmit} isLoading={update.isPending}>Save changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
