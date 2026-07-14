import { type FilterQuery } from 'mongoose';
import { TaskStatus } from '@coresphere/shared';
import { TaskModel, type TaskAttrs, type TaskDoc, type TaskHydrated } from './task.model';
import type { ListTasksQuery } from './project.schemas';

const ASSIGNEE_POPULATE = { path: 'assignee', select: 'firstName lastName' };

export const taskRepository = {
  findByProject(projectId: string, query: ListTasksQuery): Promise<TaskHydrated[]> {
    const filter: FilterQuery<TaskDoc> = { project: projectId };
    if (query.status) filter.status = query.status;
    if (query.assigneeId) filter.assignee = query.assigneeId;
    return TaskModel.find(filter).populate(ASSIGNEE_POPULATE).sort({ createdAt: 1 }).exec();
  },

  findById(id: string): Promise<TaskHydrated | null> {
    return TaskModel.findById(id).populate(ASSIGNEE_POPULATE).exec();
  },

  async create(attrs: TaskAttrs): Promise<TaskHydrated> {
    const created = await TaskModel.create(attrs);
    return created.populate(ASSIGNEE_POPULATE);
  },

  async deleteById(id: string): Promise<TaskHydrated | null> {
    return TaskModel.findByIdAndDelete(id).exec();
  },

  deleteByProject(projectId: string): Promise<unknown> {
    return TaskModel.deleteMany({ project: projectId }).exec();
  },

  /** Returns [total, done] task counts for a project. */
  async counts(projectId: string): Promise<[number, number]> {
    const [total, done] = await Promise.all([
      TaskModel.countDocuments({ project: projectId }).exec(),
      TaskModel.countDocuments({ project: projectId, status: TaskStatus.Done }).exec(),
    ]);
    return [total, done];
  },
};
