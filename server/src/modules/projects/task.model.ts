import { model, Schema, type HydratedDocument, type Model, type Types } from 'mongoose';
import {
  type Priority,
  PRIORITIES,
  type TaskDto,
  type TaskStatus as TaskStatusType,
  TASK_STATUSES,
  TaskStatus,
} from '@coresphere/shared';

export interface TaskAttrs {
  project: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatusType;
  priority: Priority;
  assignee?: Types.ObjectId | null;
  dueDate?: Date | null;
}

export interface TaskDoc extends TaskAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type TaskHydrated = HydratedDocument<TaskDoc>;

const taskSchema = new Schema<TaskDoc>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    status: { type: String, enum: TASK_STATUSES, required: true, default: TaskStatus.Todo, index: true },
    priority: { type: String, enum: PRIORITIES, required: true, default: 'medium' },
    assignee: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true },
);

interface PopulatedEmployee {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
}

function assigneeInfo(assignee: TaskDoc['assignee']): { id: string; name: string } | undefined {
  if (assignee && typeof assignee === 'object' && 'firstName' in assignee) {
    const a = assignee as unknown as PopulatedEmployee;
    return { id: String(a._id), name: `${a.firstName} ${a.lastName}`.trim() };
  }
  return undefined;
}

export function toTaskDto(doc: TaskHydrated): TaskDto {
  const assignee = assigneeInfo(doc.assignee);
  return {
    id: doc.id as string,
    projectId: String(doc.project),
    title: doc.title,
    ...(doc.description ? { description: doc.description } : {}),
    status: doc.status,
    priority: doc.priority,
    ...(assignee ? { assigneeId: assignee.id, assigneeName: assignee.name } : {}),
    ...(doc.dueDate ? { dueDate: doc.dueDate.toISOString().slice(0, 10) } : {}),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const TaskModel: Model<TaskDoc> = model<TaskDoc>('Task', taskSchema);
