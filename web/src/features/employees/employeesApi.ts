import type { EmployeeDto, EmployeeStats, EmployeeStatus, Paginated } from '@coresphere/shared';
import { apiClient } from '@/lib/apiClient';
import { toQueryString } from '@/lib/queryString';

export interface EmployeeListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  department?: string;
  status?: string;
  employmentType?: string;
  sort?: string;
}

export interface EmployeePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  jobTitle: string;
  employmentType: string;
  dateOfJoining: string;
  location?: string;
  managerId?: string | null;
}

export const employeesApi = {
  list(params: EmployeeListParams): Promise<Paginated<EmployeeDto>> {
    return apiClient.get<Paginated<EmployeeDto>>(`/hr/employees${toQueryString({ ...params })}`);
  },
  get(id: string): Promise<EmployeeDto> {
    return apiClient.get<EmployeeDto>(`/hr/employees/${id}`);
  },
  stats(): Promise<EmployeeStats> {
    return apiClient.get<EmployeeStats>('/hr/employees/stats');
  },
  create(payload: EmployeePayload): Promise<EmployeeDto> {
    return apiClient.post<EmployeeDto>('/hr/employees', payload);
  },
  update(id: string, payload: Partial<EmployeePayload>): Promise<EmployeeDto> {
    return apiClient.patch<EmployeeDto>(`/hr/employees/${id}`, payload);
  },
  changeStatus(id: string, status: EmployeeStatus): Promise<EmployeeDto> {
    return apiClient.patch<EmployeeDto>(`/hr/employees/${id}/status`, { status });
  },
  remove(id: string): Promise<{ id: string }> {
    return apiClient.delete<{ id: string }>(`/hr/employees/${id}`);
  },
};
