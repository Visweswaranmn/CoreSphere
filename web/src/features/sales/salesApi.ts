import type { DealDto, Paginated, SalesStats } from '@coresphere/shared';
import { apiClient } from '@/lib/apiClient';
import { toQueryString } from '@/lib/queryString';

export interface DealListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  stage?: string;
  customerId?: string;
}

export interface DealPayload {
  title: string;
  customerId: string;
  value: number;
  stage?: string;
  expectedCloseDate?: string;
  notes?: string;
}

export const salesApi = {
  list(params: DealListParams): Promise<Paginated<DealDto>> {
    return apiClient.get<Paginated<DealDto>>(`/sales/deals${toQueryString({ ...params })}`);
  },
  stats(): Promise<SalesStats> {
    return apiClient.get<SalesStats>('/sales/deals/stats');
  },
  create(payload: DealPayload): Promise<DealDto> {
    return apiClient.post<DealDto>('/sales/deals', payload);
  },
  update(id: string, payload: Partial<DealPayload>): Promise<DealDto> {
    return apiClient.patch<DealDto>(`/sales/deals/${id}`, payload);
  },
  changeStage(id: string, stage: string): Promise<DealDto> {
    return apiClient.patch<DealDto>(`/sales/deals/${id}/stage`, { stage });
  },
  remove(id: string): Promise<{ id: string }> {
    return apiClient.delete<{ id: string }>(`/sales/deals/${id}`);
  },
};
