import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { DealDto } from '@coresphere/shared';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/format';
import { TrendingUp } from 'lucide-react';
import { DealFormModal } from './DealFormModal';
import { PipelineBoard } from './PipelineBoard';
import { useDealStats, useDeals } from './salesHooks';

export function PipelinePage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<DealDto | undefined>();

  const { data, isLoading } = useDeals({ pageSize: 100 });
  const { data: stats } = useDealStats();
  const deals = data?.items ?? [];

  const tiles = [
    { label: 'Open pipeline', value: formatCurrency(stats?.openValue ?? 0), sub: `${stats?.openDeals ?? 0} deals` },
    { label: 'Weighted forecast', value: formatCurrency(stats?.weightedValue ?? 0), sub: 'probability-adjusted' },
    { label: 'Won value', value: formatCurrency(stats?.wonValue ?? 0), sub: 'closed-won' },
    { label: 'Win rate', value: `${stats?.winRate ?? 0}%`, sub: 'won vs. decided' },
  ];

  const openEdit = (deal: DealDto) => setEditing(deal);

  return (
    <div>
      <PageHeader
        title="Sales Pipeline"
        description="Track deals from lead to close."
        actions={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />New deal</Button>}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <p className="text-xs text-muted-fg">{t.label}</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{t.value}</p>
            <p className="text-xs text-muted-fg">{t.sub}</p>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-72 shrink-0" />)}
        </div>
      ) : deals.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No deals yet"
          description="Create your first deal to start building your pipeline."
          action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />New deal</Button>}
        />
      ) : (
        <PipelineBoard deals={deals} onEditDeal={openEdit} />
      )}

      <DealFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <DealFormModal open={Boolean(editing)} deal={editing} onClose={() => setEditing(undefined)} />
    </div>
  );
}
