import { z } from 'zod';
import { Priority, ProjectStatus, TaskStatus } from '@coresphere/shared';
import { paginationQuerySchema } from '../../utils/pagination';
import { objectId } from '../employees/employee.schemas';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required').max(120),
  description: z.string().trim().max(2000).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  priority: z.nativeEnum(Priority).default(Priority.Medium),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  leadId: objectId.nullable().optional(),
  budget: z.coerce.number().min(0).nullable().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const listProjectsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  sort: z.enum(['-createdAt', 'createdAt', 'name', '-name', 'dueDate', '-dueDate']).default('-createdAt'),
});

export const addMemberSchema = z.object({ employeeId: objectId });

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required').max(200),
  description: z.string().trim().max(2000).optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.Todo),
  priority: z.nativeEnum(Priority).default(Priority.Medium),
  assigneeId: objectId.nullable().optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  assigneeId: objectId.nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
});

export const listTasksQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  assigneeId: objectId.optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
