import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { payrollApi, type CreateRunPayload, type StructurePayload } from './payrollApi';

export const payrollKeys = {
  all: ['payroll'] as const,
  structures: (page: number, pageSize: number) => ['payroll', 'structures', page, pageSize] as const,
  structure: (employeeId: string) => ['payroll', 'structure', employeeId] as const,
  runs: (params: unknown) => ['payroll', 'runs', params] as const,
  run: (id: string) => ['payroll', 'run', id] as const,
  payslips: (params: unknown) => ['payroll', 'payslips', params] as const,
};

export function useSalaryStructures(page: number, pageSize: number) {
  return useQuery({
    queryKey: payrollKeys.structures(page, pageSize),
    queryFn: () => payrollApi.listStructures(page, pageSize),
    placeholderData: (previous) => previous,
  });
}

export function useUpsertStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, payload }: { employeeId: string; payload: StructurePayload }) =>
      payrollApi.upsertStructure(employeeId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: payrollKeys.all }),
  });
}

export function useRuns(params: { page: number; pageSize: number; status?: string }) {
  return useQuery({
    queryKey: payrollKeys.runs(params),
    queryFn: () => payrollApi.listRuns(params),
    placeholderData: (previous) => previous,
  });
}

export function useRun(id: string | undefined) {
  return useQuery({
    queryKey: payrollKeys.run(id ?? ''),
    queryFn: () => payrollApi.getRun(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRunPayload) => payrollApi.createRun(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: payrollKeys.all }),
  });
}

export function useProcessRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payrollApi.processRun(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: payrollKeys.all }),
  });
}

export function usePayRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payrollApi.payRun(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: payrollKeys.all }),
  });
}

export function usePayslips(params: { page: number; pageSize: number; runId?: string; employeeId?: string }) {
  return useQuery({
    queryKey: payrollKeys.payslips(params),
    queryFn: () => payrollApi.listPayslips(params),
    placeholderData: (previous) => previous,
  });
}
