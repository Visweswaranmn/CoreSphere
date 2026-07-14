import type { TaskDto } from '@coresphere/shared';
import { ApiError } from '../../utils/ApiError';
import { employeeRepository } from '../employees/employee.repository';
import { projectRepository } from './project.repository';
import { taskRepository } from './task.repository';
import { toTaskDto } from './task.model';
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from './project.schemas';

/** Recomputes and persists a project's cached task counts. */
async function syncProjectCounts(projectId: string): Promise<void> {
  const [total, done] = await taskRepository.counts(projectId);
  await projectRepository.setTaskCounts(projectId, total, done);
}

async function assertAssigneeExists(id: string | null | undefined): Promise<void> {
  if (!id) return;
  const employee = await employeeRepository.findById(id);
  if (!employee) throw ApiError.badRequest('The selected assignee does not exist');
}

export const taskService = {
  async listByProject(projectId: string, query: ListTasksQuery): Promise<TaskDto[]> {
    const project = await projectRepository.findByIdRaw(projectId);
    if (!project) throw ApiError.notFound('Project not found');
    const tasks = await taskRepository.findByProject(projectId, query);
    return tasks.map(toTaskDto);
  },

  async create(projectId: string, input: CreateTaskInput): Promise<TaskDto> {
    const project = await projectRepository.findByIdRaw(projectId);
    if (!project) throw ApiError.notFound('Project not found');
    await assertAssigneeExists(input.assigneeId);

    const task = await taskRepository.create({
      project: project._id,
      title: input.title,
      ...(input.description ? { description: input.description } : {}),
      status: input.status,
      priority: input.priority,
      assignee: input.assigneeId ? (input.assigneeId as unknown as never) : null,
      dueDate: input.dueDate ?? null,
    });

    await syncProjectCounts(projectId);
    return toTaskDto(task);
  },

  async update(taskId: string, input: UpdateTaskInput): Promise<TaskDto> {
    const task = await taskRepository.findById(taskId);
    if (!task) throw ApiError.notFound('Task not found');

    if (input.assigneeId !== undefined) {
      await assertAssigneeExists(input.assigneeId);
      task.assignee = input.assigneeId ? (input.assigneeId as unknown as never) : null;
    }
    if (input.title !== undefined) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.status !== undefined) task.status = input.status;
    if (input.priority !== undefined) task.priority = input.priority;
    if (input.dueDate !== undefined) task.dueDate = input.dueDate;

    await task.save();
    await task.populate('assignee', 'firstName lastName');
    await syncProjectCounts(String(task.project));
    return toTaskDto(task);
  },

  async remove(taskId: string): Promise<void> {
    const task = await taskRepository.deleteById(taskId);
    if (!task) throw ApiError.notFound('Task not found');
    await syncProjectCounts(String(task.project));
  },
};
