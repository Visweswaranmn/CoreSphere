import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SelectOption } from '@/components/ui/Select';
import { crmApi, type CustomerListParams, type CustomerPayload } from './crmApi';

export const crmKeys = {
  all: ['crm'] as const,
  list: (p: CustomerListParams) => ['crm', 'list', p] as const,
  stats: () => ['crm', 'stats'] as const,
  options: () => ['crm', 'options'] as const,
};

export function useCustomers(params: CustomerListParams) {
  return useQuery({
    queryKey: crmKeys.list(params),
    queryFn: () => crmApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useCustomerStats() {
  return useQuery({ queryKey: crmKeys.stats(), queryFn: () => crmApi.stats() });
}

/** Lightweight customer list for deal select inputs. */
export function useCustomerOptions() {
  return useQuery({
    queryKey: crmKeys.options(),
    queryFn: async () => {
      const page = await crmApi.list({ pageSize: 100 });
      return page.items.map<SelectOption>((c) => ({ value: c.id, label: `${c.name} · ${c.code}` }));
    },
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: crmKeys.all });
}

export function useCreateCustomer() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (p: CustomerPayload) => crmApi.create(p), onSuccess: invalidate });
}

export function useUpdateCustomer(id: string) {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (p: Partial<CustomerPayload>) => crmApi.update(id, p), onSuccess: invalidate });
}

export function useDeleteCustomer() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => crmApi.remove(id), onSuccess: invalidate });
}
