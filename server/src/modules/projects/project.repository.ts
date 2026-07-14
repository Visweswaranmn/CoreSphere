import { type FilterQuery } from 'mongoose';
import { ProjectModel, type ProjectAttrs, type ProjectDoc, type ProjectHydrated } from './project.model';
import type { ListProjectsQuery } from './project.schemas';

const LEAD_POPULATE = { path: 'lead', select: 'firstName lastName' };
const MEMBERS_POPULATE = { path: 'members', select: 'firstName lastName employeeCode jobTitle' };

const SORT_MAP: Record<ListProjectsQuery['sort'], Record<string, 1 | -1>> = {
  '-createdAt': { createdAt: -1 },
  createdAt: { createdAt: 1 },
  name: { name: 1 },
  '-name': { name: -1 },
  dueDate: { dueDate: 1 },
  '-dueDate': { dueDate: -1 },
};

function buildFilter(query: ListProjectsQuery): FilterQuery<ProjectDoc> {
  const filter: FilterQuery<ProjectDoc> = {};
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.search) {
    const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { code: rx }];
  }
  return filter;
}

export const projectRepository = {
  async findPaginated(query: ListProjectsQuery): Promise<{ items: ProjectHydrated[]; total: number }> {
    const filter = buildFilter(query);
    const [items, total] = await Promise.all([
      ProjectModel.find(filter)
        .populate(LEAD_POPULATE)
        .populate(MEMBERS_POPULATE)
        .sort(SORT_MAP[query.sort])
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      ProjectModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  findById(id: string): Promise<ProjectHydrated | null> {
    return ProjectModel.findById(id).populate(LEAD_POPULATE).populate(MEMBERS_POPULATE).exec();
  },

  findByIdRaw(id: string): Promise<ProjectHydrated | null> {
    return ProjectModel.findById(id).exec();
  },

  create(attrs: ProjectAttrs): Promise<ProjectHydrated> {
    return ProjectModel.create(attrs);
  },

  async deleteById(id: string): Promise<boolean> {
    const res = await ProjectModel.findByIdAndDelete(id).exec();
    return res !== null;
  },

  async setTaskCounts(projectId: string, taskCount: number, completedTaskCount: number): Promise<void> {
    await ProjectModel.updateOne({ _id: projectId }, { $set: { taskCount, completedTaskCount } }).exec();
  },

  async stats(): Promise<{ total: number; planning: number; active: number; onHold: number; completed: number }> {
    const [total, planning, active, onHold, completed] = await Promise.all([
      ProjectModel.countDocuments().exec(),
      ProjectModel.countDocuments({ status: 'planning' }).exec(),
      ProjectModel.countDocuments({ status: 'active' }).exec(),
      ProjectModel.countDocuments({ status: 'on_hold' }).exec(),
      ProjectModel.countDocuments({ status: 'completed' }).exec(),
    ]);
    return { total, planning, active, onHold, completed };
  },
};
