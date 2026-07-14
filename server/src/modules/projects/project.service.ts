import { type ProjectDto, type ProjectStats, ProjectStatus } from '@coresphere/shared';
import { ApiError } from '../../utils/ApiError';
import { formatCode, nextSequence } from '../../utils/sequence';
import { employeeRepository } from '../employees/employee.repository';
import { projectRepository } from './project.repository';
import { taskRepository } from './task.repository';
import { toProjectDto } from './project.model';
import type { CreateProjectInput, ListProjectsQuery, UpdateProjectInput } from './project.schemas';

async function assertEmployeeExists(id: string | null | undefined, label: string): Promise<void> {
  if (!id) return;
  const employee = await employeeRepository.findById(id);
  if (!employee) throw ApiError.badRequest(`The selected ${label} does not exist`);
}

export const projectService = {
  async list(query: ListProjectsQuery): Promise<{ items: ProjectDto[]; total: number }> {
    const { items, total } = await projectRepository.findPaginated(query);
    return { items: items.map(toProjectDto), total };
  },

  async getById(id: string): Promise<ProjectDto> {
    const project = await projectRepository.findById(id);
    if (!project) throw ApiError.notFound('Project not found');
    return toProjectDto(project);
  },

  async create(input: CreateProjectInput): Promise<ProjectDto> {
    await assertEmployeeExists(input.leadId, 'lead');
    const code = formatCode('PRJ', await nextSequence('project'));

    const created = await projectRepository.create({
      code,
      name: input.name,
      ...(input.description ? { description: input.description } : {}),
      status: input.status ?? ProjectStatus.Planning,
      priority: input.priority,
      startDate: input.startDate ?? null,
      dueDate: input.dueDate ?? null,
      lead: input.leadId ? (input.leadId as unknown as never) : null,
      members: [],
      budget: input.budget ?? null,
      taskCount: 0,
      completedTaskCount: 0,
    });

    const project = await projectRepository.findById(created.id as string);
    return toProjectDto(project!);
  },

  async update(id: string, input: UpdateProjectInput): Promise<ProjectDto> {
    const project = await projectRepository.findByIdRaw(id);
    if (!project) throw ApiError.notFound('Project not found');

    if (input.leadId !== undefined) {
      await assertEmployeeExists(input.leadId, 'lead');
      project.lead = input.leadId ? (input.leadId as unknown as never) : null;
    }
    if (input.name !== undefined) project.name = input.name;
    if (input.description !== undefined) project.description = input.description;
    if (input.status !== undefined) project.status = input.status;
    if (input.priority !== undefined) project.priority = input.priority;
    if (input.startDate !== undefined) project.startDate = input.startDate;
    if (input.dueDate !== undefined) project.dueDate = input.dueDate;
    if (input.budget !== undefined) project.budget = input.budget;

    await project.save();
    const updated = await projectRepository.findById(id);
    return toProjectDto(updated!);
  },

  async remove(id: string): Promise<void> {
    const project = await projectRepository.findByIdRaw(id);
    if (!project) throw ApiError.notFound('Project not found');
    await taskRepository.deleteByProject(id);
    await projectRepository.deleteById(id);
  },

  async addMember(projectId: string, employeeId: string): Promise<ProjectDto> {
    const project = await projectRepository.findByIdRaw(projectId);
    if (!project) throw ApiError.notFound('Project not found');
    await assertEmployeeExists(employeeId, 'employee');

    if (!project.members.some((m) => String(m) === employeeId)) {
      project.members.push(employeeId as unknown as never);
      await project.save();
    }
    const updated = await projectRepository.findById(projectId);
    return toProjectDto(updated!);
  },

  async removeMember(projectId: string, employeeId: string): Promise<ProjectDto> {
    const project = await projectRepository.findByIdRaw(projectId);
    if (!project) throw ApiError.notFound('Project not found');

    project.members = project.members.filter((m) => String(m) !== employeeId) as typeof project.members;
    await project.save();
    const updated = await projectRepository.findById(projectId);
    return toProjectDto(updated!);
  },

  async stats(): Promise<ProjectStats> {
    return projectRepository.stats();
  },
};
