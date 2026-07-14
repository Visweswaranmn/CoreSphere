import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  leaveApi,
  type CreateLeavePayload,
  type DecidePayload,
  type LeaveListParams,
} from './leaveApi';

export const leaveKeys = {
  all: ['leave'] as const,
  list: (params: LeaveListParams) => ['leave', 'list', params] as const,
  balance: (employeeId: string) => ['leave', 'balance', employeeId] as const,
};

export function useLeaves(params: LeaveListParams) {
  return useQuery({
    queryKey: leaveKeys.list(params),
    queryFn: () => leaveApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useLeaveBalance(employeeId: string | undefined) {
  return useQuery({
    queryKey: leaveKeys.balance(employeeId ?? ''),
    queryFn: () => leaveApi.balance(employeeId as string),
    enabled: Boolean(employeeId),
  });
}

function useInvalidateLeave() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: leaveKeys.all });
}

export function useCreateLeave() {
  const invalidate = useInvalidateLeave();
  return useMutation({
    mutationFn: (payload: CreateLeavePayload) => leaveApi.create(payload),
    onSuccess: invalidate,
  });
}

export function useDecideLeave() {
  const invalidate = useInvalidateLeave();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DecidePayload }) =>
      leaveApi.decide(id, payload),
    onSuccess: invalidate,
  });
}
