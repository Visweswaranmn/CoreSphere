import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EmployeeStatus } from '@coresphere/shared';
import type { SelectOption } from '@/components/ui/Select';
import {
  employeesApi,
  type EmployeeListParams,
  type EmployeePayload,
} from './employeesApi';

export const employeeKeys = {
  all: ['employees'] as const,
  list: (params: EmployeeListParams) => ['employees', 'list', params] as const,
  detail: (id: string) => ['employees', 'detail', id] as const,
  stats: () => ['employees', 'stats'] as const,
  options: () => ['employees', 'options'] as const,
};

export function useEmployees(params: EmployeeListParams) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeesApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: employeeKeys.detail(id ?? ''),
    queryFn: () => employeesApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useEmployeeStats() {
  return useQuery({ queryKey: employeeKeys.stats(), queryFn: () => employeesApi.stats() });
}

/** Lightweight employee list for select inputs (managers, assignees). */
export function useEmployeeOptions() {
  return useQuery({
    queryKey: employeeKeys.options(),
    queryFn: async () => {
      const page = await employeesApi.list({ pageSize: 100, sort: 'fullName' });
      return page.items.map<{ option: SelectOption; code: string }>((e) => ({
        option: { value: e.id, label: `${e.fullName} · ${e.employeeCode}` },
        code: e.employeeCode,
      }));
    },
  });
}

function useInvalidateEmployees() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: employeeKeys.all });
}

export function useCreateEmployee() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (payload: EmployeePayload) => employeesApi.create(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateEmployee(id: string) {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (payload: Partial<EmployeePayload>) => employeesApi.update(id, payload),
    onSuccess: invalidate,
  });
}

export function useChangeEmployeeStatus(id: string) {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (status: EmployeeStatus) => employeesApi.changeStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useDeleteEmployee() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (id: string) => employeesApi.remove(id),
    onSuccess: invalidate,
  });
}
