import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  projectsApi,
  type ProjectListParams,
  type ProjectPayload,
  type TaskPayload,
} from './projectsApi';

export const projectKeys = {
  all: ['projects'] as const,
  list: (params: ProjectListParams) => ['projects', 'list', params] as const,
  detail: (id: string) => ['projects', 'detail', id] as const,
  stats: () => ['projects', 'stats'] as const,
  tasks: (projectId: string) => ['projects', 'tasks', projectId] as const,
};

export function useProjects(params: ProjectListParams) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectsApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(id ?? ''),
    queryFn: () => projectsApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useProjectStats() {
  return useQuery({ queryKey: projectKeys.stats(), queryFn: () => projectsApi.stats() });
}

export function useTasks(projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.tasks(projectId ?? ''),
    queryFn: () => projectsApi.listTasks(projectId as string),
    enabled: Boolean(projectId),
  });
}

function useInvalidateProjects() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: projectKeys.all });
}

export function useCreateProject() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: (payload: ProjectPayload) => projectsApi.create(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateProject(id: string) {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: (payload: Partial<ProjectPayload>) => projectsApi.update(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteProject() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: invalidate,
  });
}

export function useAddMember(id: string) {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: (employeeId: string) => projectsApi.addMember(id, employeeId),
    onSuccess: invalidate,
  });
}

export function useRemoveMember(id: string) {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: (employeeId: string) => projectsApi.removeMember(id, employeeId),
    onSuccess: invalidate,
  });
}

export function useCreateTask(projectId: string) {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: (payload: TaskPayload) => projectsApi.createTask(projectId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateTask() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: TaskPayload }) =>
      projectsApi.updateTask(taskId, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteTask() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: (taskId: string) => projectsApi.deleteTask(taskId),
    onSuccess: invalidate,
  });
}
