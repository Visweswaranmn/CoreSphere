import { z } from 'zod';
import { DEPARTMENTS, EmployeeStatus, EmploymentType } from '@coresphere/shared';
import { paginationQuerySchema } from '../../utils/pagination';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier');

const departmentEnum = z.enum([...DEPARTMENTS] as unknown as [string, ...string[]]);

export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(60),
  lastName: z.string().trim().min(1, 'Last name is required').max(60),
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  phone: z.string().trim().max(30).optional(),
  department: departmentEnum,
  jobTitle: z.string().trim().min(1, 'Job title is required').max(100),
  employmentType: z.nativeEnum(EmploymentType),
  dateOfJoining: z.coerce.date(),
  location: z.string().trim().max(100).optional(),
  managerId: objectId.nullable().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const changeStatusSchema = z.object({
  status: z.nativeEnum(EmployeeStatus),
});

export const listEmployeesQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  department: z.string().trim().optional(),
  status: z.nativeEnum(EmployeeStatus).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  sort: z
    .enum(['-createdAt', 'createdAt', 'fullName', '-fullName', 'dateOfJoining', '-dateOfJoining'])
    .default('-createdAt'),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
