import {
  type EmployeeDto,
  type EmployeeStats,
  EMPLOYEE_STATUS_TRANSITIONS,
  EmployeeStatus,
} from '@coresphere/shared';
import { ApiError } from '../../utils/ApiError';
import { formatCode, nextSequence } from '../../utils/sequence';
import { employeeRepository } from './employee.repository';
import { toEmployeeDto } from './employee.model';
import type {
  ChangeStatusInput,
  CreateEmployeeInput,
  ListEmployeesQuery,
  UpdateEmployeeInput,
} from './employee.schemas';

async function resolveManager(managerId: string | null | undefined, selfId?: string): Promise<void> {
  if (!managerId) return;
  if (selfId && managerId === selfId) {
    throw ApiError.badRequest('An employee cannot be their own manager');
  }
  const manager = await employeeRepository.findById(managerId);
  if (!manager) {
    throw ApiError.badRequest('The selected manager does not exist');
  }
}

export const employeeService = {
  async list(query: ListEmployeesQuery): Promise<{ items: EmployeeDto[]; total: number }> {
    const { items, total } = await employeeRepository.findPaginated(query);
    return { items: items.map(toEmployeeDto), total };
  },

  async getById(id: string): Promise<EmployeeDto> {
    const employee = await employeeRepository.findById(id);
    if (!employee) throw ApiError.notFound('Employee not found');
    return toEmployeeDto(employee);
  },

  async create(input: CreateEmployeeInput): Promise<EmployeeDto> {
    if (await employeeRepository.existsByEmail(input.email)) {
      throw ApiError.conflict('An employee with this email already exists');
    }
    await resolveManager(input.managerId);

    const employeeCode = formatCode('EMP', await nextSequence('employee'));
    const employee = await employeeRepository.create({
      employeeCode,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      ...(input.phone ? { phone: input.phone } : {}),
      department: input.department,
      jobTitle: input.jobTitle,
      employmentType: input.employmentType,
      status: EmployeeStatus.Onboarding,
      dateOfJoining: input.dateOfJoining,
      ...(input.location ? { location: input.location } : {}),
      manager: input.managerId ? (input.managerId as unknown as never) : null,
    });

    return toEmployeeDto(employee);
  },

  async update(id: string, input: UpdateEmployeeInput): Promise<EmployeeDto> {
    const employee = await employeeRepository.findById(id);
    if (!employee) throw ApiError.notFound('Employee not found');

    if (input.email && input.email !== employee.email) {
      if (await employeeRepository.existsByEmail(input.email)) {
        throw ApiError.conflict('An employee with this email already exists');
      }
      employee.email = input.email;
    }

    if (input.managerId !== undefined) {
      await resolveManager(input.managerId, id);
      employee.manager = input.managerId ? (input.managerId as unknown as never) : null;
    }

    if (input.firstName !== undefined) employee.firstName = input.firstName;
    if (input.lastName !== undefined) employee.lastName = input.lastName;
    if (input.phone !== undefined) employee.phone = input.phone;
    if (input.department !== undefined) employee.department = input.department;
    if (input.jobTitle !== undefined) employee.jobTitle = input.jobTitle;
    if (input.employmentType !== undefined) employee.employmentType = input.employmentType;
    if (input.dateOfJoining !== undefined) employee.dateOfJoining = input.dateOfJoining;
    if (input.location !== undefined) employee.location = input.location;

    await employee.save();
    await employee.populate('manager', 'firstName lastName');
    return toEmployeeDto(employee);
  },

  async changeStatus(id: string, input: ChangeStatusInput): Promise<EmployeeDto> {
    const employee = await employeeRepository.findById(id);
    if (!employee) throw ApiError.notFound('Employee not found');

    const allowed = EMPLOYEE_STATUS_TRANSITIONS[employee.status];
    if (input.status !== employee.status && !allowed.includes(input.status)) {
      throw ApiError.badRequest(
        `Cannot change status from '${employee.status}' to '${input.status}'`,
      );
    }

    employee.status = input.status;
    await employee.save();
    return toEmployeeDto(employee);
  },

  async remove(id: string): Promise<void> {
    const deleted = await employeeRepository.deleteById(id);
    if (!deleted) throw ApiError.notFound('Employee not found');
  },

  async stats(): Promise<EmployeeStats> {
    return employeeRepository.stats();
  },
};
