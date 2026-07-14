import {
  type Priority,
  PRIORITY_LABELS,
  type ProjectStatus,
  PROJECT_STATUS_LABELS,
} from '@coresphere/shared';
import { Badge, type BadgeTone } from '@/components/ui/Badge';

const projectTone: Record<ProjectStatus, BadgeTone> = {
  planning: 'neutral',
  active: 'success',
  on_hold: 'warning',
  completed: 'primary',
  cancelled: 'danger',
};

const priorityTone: Record<Priority, BadgeTone> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge tone={projectTone[status]} dot>
      {PROJECT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge tone={priorityTone[priority]}>{PRIORITY_LABELS[priority]}</Badge>;
}
