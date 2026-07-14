export const ProjectStatus = {
  Planning: 'planning',
  Active: 'active',
  OnHold: 'on_hold',
  Completed: 'completed',
  Cancelled: 'cancelled',
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];
export const PROJECT_STATUSES: readonly ProjectStatus[] = Object.values(ProjectStatus);
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.Planning]: 'Planning',
  [ProjectStatus.Active]: 'Active',
  [ProjectStatus.OnHold]: 'On Hold',
  [ProjectStatus.Completed]: 'Completed',
  [ProjectStatus.Cancelled]: 'Cancelled',
};

export const Priority = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Critical: 'critical',
} as const;
export type Priority = (typeof Priority)[keyof typeof Priority];
export const PRIORITIES: readonly Priority[] = Object.values(Priority);
export const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.Low]: 'Low',
  [Priority.Medium]: 'Medium',
  [Priority.High]: 'High',
  [Priority.Critical]: 'Critical',
};

export const TaskStatus = {
  Todo: 'todo',
  InProgress: 'in_progress',
  InReview: 'in_review',
  Done: 'done',
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
export const TASK_STATUSES: readonly TaskStatus[] = Object.values(TaskStatus);
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'To Do',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.InReview]: 'In Review',
  [TaskStatus.Done]: 'Done',
};

export interface ProjectMemberDto {
  id: string;
  name: string;
  employeeCode: string;
  jobTitle: string;
}

export interface ProjectDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  startDate?: string;
  dueDate?: string;
  leadId?: string;
  leadName?: string;
  members: ProjectMemberDto[];
  budget?: number;
  taskCount: number;
  completedTaskCount: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDto {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStats {
  total: number;
  planning: number;
  active: number;
  onHold: number;
  completed: number;
}

/** Progress as a 0–100 integer from completed vs. total task counts. */
export function computeProgress(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}
