import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, Search } from 'lucide-react';
import {
  type ProjectDto,
  PRIORITY_LABELS,
  PRIORITIES,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES,
} from '@coresphere/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatDate } from '@/lib/format';
import { PriorityBadge, ProjectStatusBadge } from './badges';
import { ProjectFormModal } from './ProjectFormModal';
import { useProjects, useProjectStats } from './projectHooks';

const PAGE_SIZE = 9;

const statusFilterOptions = [
  { value: '', label: 'All statuses' },
  ...PROJECT_STATUSES.map((s) => ({ value: s, label: PROJECT_STATUS_LABELS[s] })),
];
const priorityFilterOptions = [
  { value: '', label: 'All priorities' },
  ...PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] })),
];

function ProjectCard({ project }: { project: ProjectDto }) {
  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-md">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{project.name}</p>
            <p className="text-xs text-muted-fg">{project.code}</p>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>

        {project.description && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-fg">{project.description}</p>
        )}

        <div className="mt-auto space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-fg">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {project.members.slice(0, 4).map((m) => (
                <Avatar key={m.id} name={m.name} size="sm" className="ring-2 ring-surface" />
              ))}
              {project.members.length === 0 && (
                <span className="text-xs text-muted-fg">No members</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={project.priority} />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-fg">
            <span>{project.taskCount} tasks</span>
            <span>Due {formatDate(project.dueDate)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const search = useDebouncedValue(searchInput);

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, search: search || undefined, status: status || undefined, priority: priority || undefined }),
    [page, search, status, priority],
  );

  const { data, isLoading } = useProjects(params);
  const { data: stats } = useProjectStats();
  const resetPage = () => setPage(1);
  const items = data?.items ?? [];

  const tiles = [
    { label: 'Total', value: stats?.total ?? 0 },
    { label: 'Active', value: stats?.active ?? 0 },
    { label: 'Planning', value: stats?.planning ?? 0 },
    { label: 'Completed', value: stats?.completed ?? 0 },
  ];

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Plan, track, and deliver projects across your teams."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New project
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <p className="text-xs text-muted-fg">{t.label}</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{t.value}</p>
          </Card>
        ))}
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
          <input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              resetPage();
            }}
            placeholder="Search projects…"
            className="h-10 w-full rounded-lg border border-input bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Select
          options={statusFilterOptions}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            resetPage();
          }}
          className="sm:w-44"
        />
        <Select
          options={priorityFilterOptions}
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            resetPage();
          }}
          className="sm:w-44"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Create your first project to get started."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New project
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          {data && data.meta.totalPages > 1 && (
            <div className="mt-4 rounded-xl border border-border bg-surface">
              <Pagination meta={data.meta} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <ProjectFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
