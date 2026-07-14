import type { AttendanceDto, AttendanceSummary, Paginated } from '@coresphere/shared';
import { apiClient } from '@/lib/apiClient';
import { toQueryString } from '@/lib/queryString';

export interface AttendanceListParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  status?: string;
  from?: string;
  to?: string;
}

export interface RecordAttendancePayload {
  employeeId: string;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  note?: string;
}

export const attendanceApi = {
  list(params: AttendanceListParams): Promise<Paginated<AttendanceDto>> {
    return apiClient.get<Paginated<AttendanceDto>>(`/hr/attendance${toQueryString({ ...params })}`);
  },
  record(payload: RecordAttendancePayload): Promise<AttendanceDto> {
    return apiClient.post<AttendanceDto>('/hr/attendance', payload);
  },
  summary(params: { employeeId?: string; from: string; to: string }): Promise<AttendanceSummary> {
    return apiClient.get<AttendanceSummary>(`/hr/attendance/summary${toQueryString({ ...params })}`);
  },
};
