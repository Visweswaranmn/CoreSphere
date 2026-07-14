import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/respond';
import { buildPaginated } from '../../utils/pagination';
import { projectService } from './project.service';
import { taskService } from './task.service';
import type {
  CreateProjectInput,
  CreateTaskInput,
  ListProjectsQuery,
  ListTasksQuery,
  UpdateProjectInput,
  UpdateTaskInput,
} from './project.schemas';

// ─── Projects ────────────────────────────────────────────────────────────────
export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListProjectsQuery;
  const { items, total } = await projectService.list(query);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const getProjectStats = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, await projectService.stats());
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, await projectService.getById(req.params.id as string));
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.create(req.body as CreateProjectInput);
  return sendSuccess(res, project, 201, 'Project created');
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.update(req.params.id as string, req.body as UpdateProjectInput);
  return sendSuccess(res, project, 200, 'Project updated');
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await projectService.remove(req.params.id as string);
  return sendSuccess(res, { id: req.params.id }, 200, 'Project removed');
});

export const addMember = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.addMember(
    req.params.id as string,
    (req.body as { employeeId: string }).employeeId,
  );
  return sendSuccess(res, project, 200, 'Member added');
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.removeMember(
    req.params.id as string,
    req.params.employeeId as string,
  );
  return sendSuccess(res, project, 200, 'Member removed');
});

// ─── Tasks ───────────────────────────────────────────────────────────────────
export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await taskService.listByProject(
    req.params.projectId as string,
    req.query as unknown as ListTasksQuery,
  );
  return sendSuccess(res, tasks);
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.create(req.params.projectId as string, req.body as CreateTaskInput);
  return sendSuccess(res, task, 201, 'Task created');
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await taskService.update(req.params.taskId as string, req.body as UpdateTaskInput);
  return sendSuccess(res, task, 200, 'Task updated');
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  await taskService.remove(req.params.taskId as string);
  return sendSuccess(res, { id: req.params.taskId }, 200, 'Task removed');
});
