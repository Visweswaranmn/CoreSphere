import type { LucideIcon } from 'lucide-react';
import { Construction } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  phase: string;
}

/**
 * Honest scaffold for modules not yet implemented. Navigation and access
 * control are live; the module's features are delivered in the noted phase.
 */
export function ModulePlaceholder({ title, description, icon, phase }: ModulePlaceholderProps) {
  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={<Badge tone="info">Planned · {phase}</Badge>}
      />
      <EmptyState
        icon={icon}
        title={`${title} is on the roadmap`}
        description={`This module arrives in ${phase}. The route, layout, and role-based access are already wired up.`}
        action={
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-fg">
            <Construction className="h-3.5 w-3.5" />
            Under construction
          </span>
        }
      />
    </div>
  );
}
