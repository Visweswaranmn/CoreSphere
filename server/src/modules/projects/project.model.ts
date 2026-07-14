import { model, Schema, type HydratedDocument, type Model, type Types } from 'mongoose';
import {
  computeProgress,
  type Priority,
  PRIORITIES,
  type ProjectDto,
  type ProjectStatus as ProjectStatusType,
  PROJECT_STATUSES,
  ProjectStatus,
} from '@coresphere/shared';

export interface ProjectAttrs {
  code: string;
  name: string;
  description?: string;
  status: ProjectStatusType;
  priority: Priority;
  startDate?: Date | null;
  dueDate?: Date | null;
  lead?: Types.ObjectId | null;
  members: Types.ObjectId[];
  budget?: number | null;
  taskCount: number;
  completedTaskCount: number;
}

export interface ProjectDoc extends ProjectAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectHydrated = HydratedDocument<ProjectDoc>;

const projectSchema = new Schema<ProjectDoc>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: PROJECT_STATUSES,
      required: true,
      default: ProjectStatus.Planning,
      index: true,
    },
    priority: { type: String, enum: PRIORITIES, required: true, default: 'medium' },
    startDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    lead: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    members: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
    budget: { type: Number, min: 0, default: null },
    taskCount: { type: Number, required: true, default: 0 },
    completedTaskCount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

interface PopulatedEmployee {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  employeeCode: string;
  jobTitle: string;
}

function isPopulated(value: unknown): value is PopulatedEmployee {
  return typeof value === 'object' && value !== null && 'firstName' in value;
}

export function toProjectDto(doc: ProjectHydrated): ProjectDto {
  const lead = isPopulated(doc.lead) ? doc.lead : undefined;
  const members = (doc.members as unknown[])
    .filter(isPopulated)
    .map((m) => ({
      id: String(m._id),
      name: `${m.firstName} ${m.lastName}`.trim(),
      employeeCode: m.employeeCode,
      jobTitle: m.jobTitle,
    }));

  return {
    id: doc.id as string,
    code: doc.code,
    name: doc.name,
    ...(doc.description ? { description: doc.description } : {}),
    status: doc.status,
    priority: doc.priority,
    ...(doc.startDate ? { startDate: doc.startDate.toISOString().slice(0, 10) } : {}),
    ...(doc.dueDate ? { dueDate: doc.dueDate.toISOString().slice(0, 10) } : {}),
    ...(lead ? { leadId: String(lead._id), leadName: `${lead.firstName} ${lead.lastName}`.trim() } : {}),
    members,
    ...(doc.budget != null ? { budget: doc.budget } : {}),
    taskCount: doc.taskCount,
    completedTaskCount: doc.completedTaskCount,
    progress: computeProgress(doc.completedTaskCount, doc.taskCount),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const ProjectModel: Model<ProjectDoc> = model<ProjectDoc>('Project', projectSchema);
