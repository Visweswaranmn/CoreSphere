import type { AuthUser, OrgSettingsDto, Paginated } from '@coresphere/shared';
import { apiClient } from '@/lib/apiClient';
import { toQueryString } from '@/lib/queryString';

export interface SettingsPayload {
  name?: string;
  legalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  currency?: string;
  timezone?: string;
  fiscalYearStartMonth?: number;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
}

export const settingsApi = {
  getSettings(): Promise<OrgSettingsDto> {
    return apiClient.get<OrgSettingsDto>('/settings');
  },
  updateSettings(payload: SettingsPayload): Promise<OrgSettingsDto> {
    return apiClient.put<OrgSettingsDto>('/settings', payload);
  },

  listUsers(params: { page?: number; pageSize?: number; search?: string }): Promise<Paginated<AuthUser>> {
    return apiClient.get<Paginated<AuthUser>>(`/users${toQueryString({ ...params })}`);
  },
  createUser(payload: CreateUserPayload): Promise<AuthUser> {
    return apiClient.post<AuthUser>('/users', payload);
  },
  updateUser(id: string, payload: UpdateUserPayload): Promise<AuthUser> {
    return apiClient.patch<AuthUser>(`/users/${id}`, payload);
  },
};
