import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  settingsApi,
  type CreateUserPayload,
  type SettingsPayload,
  type UpdateUserPayload,
} from './settingsApi';

export const settingsKeys = {
  all: ['settings'] as const,
  org: () => ['settings', 'org'] as const,
  users: (p: unknown) => ['settings', 'users', p] as const,
};

export function useSettings() {
  return useQuery({ queryKey: settingsKeys.org(), queryFn: () => settingsApi.getSettings() });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SettingsPayload) => settingsApi.updateSettings(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.org() }),
  });
}

export function useUsers(params: { page?: number; pageSize?: number; search?: string }) {
  return useQuery({
    queryKey: settingsKeys.users(params),
    queryFn: () => settingsApi.listUsers(params),
    placeholderData: (previous) => previous,
  });
}

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['settings', 'users'] });
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: (p: CreateUserPayload) => settingsApi.createUser(p), onSuccess: invalidate });
}

export function useUpdateUser(id: string) {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: (p: UpdateUserPayload) => settingsApi.updateUser(id, p), onSuccess: invalidate });
}
