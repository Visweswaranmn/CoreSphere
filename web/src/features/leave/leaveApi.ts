import type { LeaveBalanceDto, LeaveRequestDto, Paginated } from '@coresphere/shared';
import { apiClient } from '@/lib/apiClient';
import { toQueryString } from '@/lib/queryString';

export interface LeaveListParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  status?: string;
}

export interface CreateLeavePayload {
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface DecidePayload {
  status: 'approved' | 'rejected';
  note?: string;
}

export const leaveApi = {
  list(params: LeaveListParams): Promise<Paginated<LeaveRequestDto>> {
    return apiClient.get<Paginated<LeaveRequestDto>>(`/hr/leave${toQueryString({ ...params })}`);
  },
  create(payload: CreateLeavePayload): Promise<LeaveRequestDto> {
    return apiClient.post<LeaveRequestDto>('/hr/leave', payload);
  },
  decide(id: string, payload: DecidePayload): Promise<LeaveRequestDto> {
    return apiClient.patch<LeaveRequestDto>(`/hr/leave/${id}/decision`, payload);
  },
  balance(employeeId: string): Promise<LeaveBalanceDto[]> {
    return apiClient.get<LeaveBalanceDto[]>(`/hr/leave/balance${toQueryString({ employeeId })}`);
  },
};
