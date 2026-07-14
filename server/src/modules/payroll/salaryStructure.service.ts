import type { SalaryStructureDto } from '@coresphere/shared';
import { ApiError } from '../../utils/ApiError';
import { employeeRepository } from '../employees/employee.repository';
import { salaryStructureRepository } from './salaryStructure.repository';
import { toSalaryStructureDto } from './salaryStructure.model';
import type { UpsertStructureInput } from './payroll.schemas';

export const salaryStructureService = {
  async list(page: number, pageSize: number): Promise<{ items: SalaryStructureDto[]; total: number }> {
    const { items, total } = await salaryStructureRepository.findPaginated(page, pageSize);
    return { items: items.map(toSalaryStructureDto), total };
  },

  async getByEmployee(employeeId: string): Promise<SalaryStructureDto> {
    const structure = await salaryStructureRepository.findByEmployee(employeeId);
    if (!structure) throw ApiError.notFound('No salary structure defined for this employee');
    return toSalaryStructureDto(structure);
  },

  async upsert(employeeId: string, input: UpsertStructureInput): Promise<SalaryStructureDto> {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) throw ApiError.badRequest('The selected employee does not exist');

    const structure = await salaryStructureRepository.upsert(employeeId, {
      basicSalary: input.basicSalary,
      allowances: input.allowances,
      deductions: input.deductions,
      effectiveFrom: input.effectiveFrom,
    });
    return toSalaryStructureDto(structure);
  },
};
