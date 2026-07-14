import type {
  Paginated,
  PayrollRunDto,
  PayslipDto,
  SalaryComponent,
  SalaryStructureDto,
} from '@coresphere/shared';
import { apiClient } from '@/lib/apiClient';
import { toQueryString } from '@/lib/queryString';

export interface StructurePayload {
  basicSalary: number;
  allowances: SalaryComponent[];
  deductions: SalaryComponent[];
  effectiveFrom: string;
}

export interface CreateRunPayload {
  month: number;
  year: number;
  notes?: string;
}

export const payrollApi = {
  listStructures(page: number, pageSize: number): Promise<Paginated<SalaryStructureDto>> {
    return apiClient.get<Paginated<SalaryStructureDto>>(
      `/hr/payroll/structures${toQueryString({ page, pageSize })}`,
    );
  },
  getStructure(employeeId: string): Promise<SalaryStructureDto> {
    return apiClient.get<SalaryStructureDto>(`/hr/payroll/structures/employee/${employeeId}`);
  },
  upsertStructure(employeeId: string, payload: StructurePayload): Promise<SalaryStructureDto> {
    return apiClient.put<SalaryStructureDto>(`/hr/payroll/structures/employee/${employeeId}`, payload);
  },

  listRuns(params: { page: number; pageSize: number; status?: string }): Promise<Paginated<PayrollRunDto>> {
    return apiClient.get<Paginated<PayrollRunDto>>(`/hr/payroll/runs${toQueryString({ ...params })}`);
  },
  getRun(id: string): Promise<PayrollRunDto> {
    return apiClient.get<PayrollRunDto>(`/hr/payroll/runs/${id}`);
  },
  createRun(payload: CreateRunPayload): Promise<PayrollRunDto> {
    return apiClient.post<PayrollRunDto>('/hr/payroll/runs', payload);
  },
  processRun(id: string): Promise<PayrollRunDto> {
    return apiClient.post<PayrollRunDto>(`/hr/payroll/runs/${id}/process`);
  },
  payRun(id: string): Promise<PayrollRunDto> {
    return apiClient.post<PayrollRunDto>(`/hr/payroll/runs/${id}/pay`);
  },

  listPayslips(params: {
    page: number;
    pageSize: number;
    runId?: string;
    employeeId?: string;
  }): Promise<Paginated<PayslipDto>> {
    return apiClient.get<Paginated<PayslipDto>>(`/hr/payroll/payslips${toQueryString({ ...params })}`);
  },
};
