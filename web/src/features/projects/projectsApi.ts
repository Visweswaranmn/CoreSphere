import type { Paginated, ProjectDto, ProjectStats, TaskDto } from '@coresphere/shared';
import { apiClient } from '@/lib/apiClient';
import { toQueryString } from '@/lib/queryString';

export interface ProjectListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  priority?: string;
  sort?: string;
}

export interface ProjectPayload {
  name: string;
  description?: string;
  status?: string;
  priority: string;
  startDate?: string;
  dueDate?: string;
  leadId?: string | null;
  budget?: number | null;
}

export interface TaskPayload {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export const projectsApi = {
  list(params: ProjectListParams): Promise<Paginated<ProjectDto>> {
    return apiClient.get<Paginated<ProjectDto>>(`/projects${toQueryString({ ...params })}`);
  },
  get(id: string): Promise<ProjectDto> {
    return apiClient.get<ProjectDto>(`/projects/${id}`);
  },
  stats(): Promise<ProjectStats> {
    return apiClient.get<ProjectStats>('/projects/stats');
  },
  create(payload: ProjectPayload): Promise<ProjectDto> {
    return apiClient.post<ProjectDto>('/projects', payload);
  },
  update(id: string, payload: Partial<ProjectPayload>): Promise<ProjectDto> {
    return apiClient.patch<ProjectDto>(`/projects/${id}`, payload);
  },
  remove(id: string): Promise<{ id: string }> {
    return apiClient.delete<{ id: string }>(`/projects/${id}`);
  },
  addMember(id: string, employeeId: string): Promise<ProjectDto> {
    return apiClient.post<ProjectDto>(`/projects/${id}/members`, { employeeId });
  },
  removeMember(id: string, employeeId: string): Promise<ProjectDto> {
    return apiClient.delete<ProjectDto>(`/projects/${id}/members/${employeeId}`);
  },

  listTasks(projectId: string): Promise<TaskDto[]> {
    return apiClient.get<TaskDto[]>(`/projects/${projectId}/tasks`);
  },
  createTask(projectId: string, payload: TaskPayload): Promise<TaskDto> {
    return apiClient.post<TaskDto>(`/projects/${projectId}/tasks`, payload);
  },
  updateTask(taskId: string, payload: TaskPayload): Promise<TaskDto> {
    return apiClient.patch<TaskDto>(`/projects/tasks/${taskId}`, payload);
  },
  deleteTask(taskId: string): Promise<{ id: string }> {
    return apiClient.delete<{ id: string }>(`/projects/tasks/${taskId}`);
  },
};
