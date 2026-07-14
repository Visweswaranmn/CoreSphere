import type { CustomerDto, CustomerStats, Paginated } from '@coresphere/shared';
import { apiClient } from '@/lib/apiClient';
import { toQueryString } from '@/lib/queryString';

export interface CustomerListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  industry?: string;
}

export interface CustomerPayload {
  name: string;
  contactName?: string;
  email: string;
  phone?: string;
  industry: string;
  status?: string;
  website?: string;
  address?: string;
  notes?: string;
}

export const crmApi = {
  list(params: CustomerListParams): Promise<Paginated<CustomerDto>> {
    return apiClient.get<Paginated<CustomerDto>>(`/crm/customers${toQueryString({ ...params })}`);
  },
  stats(): Promise<CustomerStats> {
    return apiClient.get<CustomerStats>('/crm/customers/stats');
  },
  create(payload: CustomerPayload): Promise<CustomerDto> {
    return apiClient.post<CustomerDto>('/crm/customers', payload);
  },
  update(id: string, payload: Partial<CustomerPayload>): Promise<CustomerDto> {
    return apiClient.patch<CustomerDto>(`/crm/customers/${id}`, payload);
  },
  remove(id: string): Promise<{ id: string }> {
    return apiClient.delete<{ id: string }>(`/crm/customers/${id}`);
  },
};
