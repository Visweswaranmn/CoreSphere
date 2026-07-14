import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FolderKanban, Plus, Trash2, UserPlus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { DropdownItem, DropdownMenu } from '@/components/ui/DropdownMenu';
import type { TaskDto } from '@coresphere/shared';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDate } from '@/lib/format';
import { ApiClientError } from '@/lib/apiClient';
import { useEmployeeOptions } from '@/features/employees/employeeHooks';
import { PriorityBadge, ProjectStatusBadge } from './badges';
import { ProjectFormModal } from './ProjectFormModal';
import { TaskModal } from './TaskModal';
import { KanbanBoard } from './KanbanBoard';
import {
  useAddMember,
  useDeleteProject,
  useProject,
  useRemoveMember,
  useTasks,
} from './projectHooks';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: project, isLoading } = useProject(id);
  const { data: tasks } = useTasks(id);
  const { data: options } = useEmployeeOptions();
  const addMember = useAddMember(id ?? '');
  const removeMember = useRemoveMember(id ?? '');
  const deleteProject = useDeleteProject();

  const [editOpen, setEditOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDto | undefined>();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const back = (
    <Link
      to="/projects"
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to projects
    </Link>
  );

  if (isLoading || !project) {
    return (
      <div>
        {back}
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const memberIds = new Set(project.members.map((m) => m.id));
  const addableMembers = (options ?? []).filter((o) => !memberIds.has(o.option.value));

  const handleAddMember = async (employeeId: string) => {
    try {
      await addMember.mutateAsync(employeeId);
    } catch (error) {
      toast({
        title: 'Could not add member',
        description: error instanceof ApiClientError ? error.message : 'Please try again.',
        tone: 'error',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(project.id);
      toast({ title: 'Project removed', tone: 'success' });
      navigate('/projects');
    } catch (error) {
      toast({
        title: 'Could not remove project',
        description: error instanceof ApiClientError ? error.message : 'Please try again.',
        tone: 'error',
      });
    }
  };

  const openNewTask = () => {
    setEditingTask(undefined);
    setTaskModalOpen(true);
  };
  const openEditTask = (task: TaskDto) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  return (
    <div>
      {back}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-foreground">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
          </div>
          <p className="mt-1 text-sm text-muted-fg">
            {project.code}
            {project.leadName ? ` · Lead: ${project.leadName}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button variant="secondary" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-fg">Progress</span>
                <span className="font-medium text-foreground">
                  {project.progress}% · {project.completedTaskCount}/{project.taskCount} tasks
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
            {project.description && <p className="text-sm text-muted-fg">{project.description}</p>}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-fg">Start</p>
                <p className="text-sm text-foreground">{formatDate(project.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-fg">Due</p>
                <p className="text-sm text-foreground">{formatDate(project.dueDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-fg">Budget</p>
                <p className="text-sm text-foreground">
                  {project.budget != null ? formatCurrency(project.budget) : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            action={
              <DropdownMenu
                trigger={
                  <span className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-fg hover:text-foreground">
                    <UserPlus className="h-3.5 w-3.5" />
                    Add
                  </span>
                }
              >
                {addableMembers.length === 0 ? (
                  <p className="px-2.5 py-2 text-sm text-muted-fg">No employees to add</p>
                ) : (
                  addableMembers.map((o) => (
                    <DropdownItem key={o.option.value} onSelect={() => handleAddMember(o.option.value)}>
                      {o.option.label}
                    </DropdownItem>
                  ))
                )}
              </DropdownMenu>
            }
          >
            <CardTitle>Team ({project.members.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            {project.members.length === 0 ? (
              <p className="text-sm text-muted-fg">No members yet.</p>
            ) : (
              project.members.map((m) => (
                <div key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={m.name} size="sm" />
                    <div>
                      <p className="text-sm text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-fg">{m.jobTitle}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMember.mutate(m.id)}
                    className="text-muted-fg hover:text-danger"
                    aria-label={`Remove ${m.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Task Board</h2>
        <Button onClick={openNewTask}>
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      {tasks && tasks.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No tasks yet"
          description="Add tasks to start tracking work on this project."
          action={
            <Button onClick={openNewTask}>
              <Plus className="h-4 w-4" />
              New task
            </Button>
          }
        />
      ) : (
        <KanbanBoard tasks={tasks ?? []} onEditTask={openEditTask} />
      )}

      <ProjectFormModal open={editOpen} project={project} onClose={() => setEditOpen(false)} />
      <TaskModal
        open={taskModalOpen}
        projectId={project.id}
        task={editingTask}
        onClose={() => setTaskModalOpen(false)}
      />

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        size="sm"
        title="Remove project"
        description={`This permanently removes ${project.name} and all its tasks.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={deleteProject.isPending}>
              Remove
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-fg">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
