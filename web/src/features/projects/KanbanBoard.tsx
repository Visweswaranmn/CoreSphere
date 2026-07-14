import { ArrowRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  type TaskDto,
  type TaskStatus,
  TASK_STATUS_LABELS,
  TASK_STATUSES,
} from '@coresphere/shared';
import { Avatar } from '@/components/ui/Avatar';
import { DropdownItem, DropdownMenu, DropdownSeparator } from '@/components/ui/DropdownMenu';
import { useToast } from '@/hooks/useToast';
import { ApiClientError } from '@/lib/apiClient';
import { PriorityBadge } from './badges';
import { useDeleteTask, useUpdateTask } from './projectHooks';

function TaskCard({ task, onEdit }: { task: TaskDto; onEdit: (task: TaskDto) => void }) {
  const { toast } = useToast();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const move = async (status: TaskStatus) => {
    try {
      await updateTask.mutateAsync({ taskId: task.id, payload: { title: task.title, status } });
    } catch (error) {
      toast({
        title: 'Could not move task',
        description: error instanceof ApiClientError ? error.message : 'Please try again.',
        tone: 'error',
      });
    }
  };

  const remove = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      toast({ title: 'Task removed', tone: 'success' });
    } catch (error) {
      toast({
        title: 'Could not remove task',
        description: error instanceof ApiClientError ? error.message : 'Please try again.',
        tone: 'error',
      });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{task.title}</p>
        <DropdownMenu
          trigger={
            <span className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-fg hover:bg-surface-muted hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          }
        >
          <DropdownItem icon={Pencil} onSelect={() => onEdit(task)}>
            Edit
          </DropdownItem>
          <DropdownSeparator />
          {TASK_STATUSES.filter((s) => s !== task.status).map((s) => (
            <DropdownItem key={s} icon={ArrowRight} onSelect={() => move(s)}>
              Move to {TASK_STATUS_LABELS[s]}
            </DropdownItem>
          ))}
          <DropdownSeparator />
          <DropdownItem icon={Trash2} danger onSelect={remove}>
            Delete
          </DropdownItem>
        </DropdownMenu>
      </div>

      {task.description && <p className="mb-3 line-clamp-2 text-xs text-muted-fg">{task.description}</p>}

      <div className="flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        {task.assigneeName ? (
          <Avatar name={task.assigneeName} size="sm" />
        ) : (
          <span className="text-xs text-muted-fg">Unassigned</span>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({
  tasks,
  onEditTask,
}: {
  tasks: TaskDto[];
  onEditTask: (task: TaskDto) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {TASK_STATUSES.map((status) => {
        const columnTasks = tasks.filter((t) => t.status === status);
        return (
          <div key={status} className="rounded-xl bg-surface-muted/50 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-sm font-medium text-foreground">{TASK_STATUS_LABELS[status]}</p>
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted-fg">
                {columnTasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {columnTasks.length === 0 ? (
                <p className="px-1 py-6 text-center text-xs text-muted-fg">No tasks</p>
              ) : (
                columnTasks.map((task) => <TaskCard key={task.id} task={task} onEdit={onEditTask} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
