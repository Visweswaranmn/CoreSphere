import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@coresphere/shared';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { objectId } from '../employees/employee.schemas';
import {
  addMemberSchema,
  createProjectSchema,
  createTaskSchema,
  listProjectsQuerySchema,
  listTasksQuerySchema,
  updateProjectSchema,
  updateTaskSchema,
} from './project.schemas';
import {
  addMember,
  createProject,
  createTask,
  deleteProject,
  deleteTask,
  getProject,
  getProjectStats,
  listProjects,
  listTasks,
  removeMember,
  updateProject,
  updateTask,
} from './project.controller';

export const projectRouter: Router = Router();

const idParams = z.object({ id: objectId });
const projectIdParams = z.object({ projectId: objectId });
const taskIdParams = z.object({ taskId: objectId });
const memberParams = z.object({ id: objectId, employeeId: objectId });

// Project management is restricted to Project Managers (Super Admin bypasses).
projectRouter.use(authenticate, authorize(Role.ProjectManager));

// Collection + stats
projectRouter.get('/', validate({ query: listProjectsQuerySchema }), listProjects);
projectRouter.get('/stats', getProjectStats);
projectRouter.post('/', validate({ body: createProjectSchema }), createProject);

// Task mutations (two-segment `/tasks/:taskId` — distinct from `/:id`)
projectRouter.patch(
  '/tasks/:taskId',
  validate({ params: taskIdParams, body: updateTaskSchema }),
  updateTask,
);
projectRouter.delete('/tasks/:taskId', validate({ params: taskIdParams }), deleteTask);

// Single project
projectRouter.get('/:id', validate({ params: idParams }), getProject);
projectRouter.patch('/:id', validate({ params: idParams, body: updateProjectSchema }), updateProject);
projectRouter.delete('/:id', validate({ params: idParams }), deleteProject);

// Members
projectRouter.post('/:id/members', validate({ params: idParams, body: addMemberSchema }), addMember);
projectRouter.delete('/:id/members/:employeeId', validate({ params: memberParams }), removeMember);

// Project tasks (list + create)
projectRouter.get(
  '/:projectId/tasks',
  validate({ params: projectIdParams, query: listTasksQuerySchema }),
  listTasks,
);
projectRouter.post(
  '/:projectId/tasks',
  validate({ params: projectIdParams, body: createTaskSchema }),
  createTask,
);
