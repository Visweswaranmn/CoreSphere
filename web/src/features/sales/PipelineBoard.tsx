import { ArrowRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DEAL_STAGE_LABELS, DEAL_STAGES, type DealDto, type DealStage } from '@coresphere/shared';
import { DropdownItem, DropdownMenu, DropdownSeparator } from '@/components/ui/DropdownMenu';
import { useToast } from '@/hooks/useToast';
import { formatCompactCurrency, formatCurrency } from '@/lib/format';
import { ApiClientError } from '@/lib/apiClient';
import { useChangeDealStage, useDeleteDeal } from './salesHooks';

const stageAccent: Record<DealStage, string> = {
  lead: 'bg-slate-400',
  qualified: 'bg-sky-500',
  proposal: 'bg-indigo-500',
  negotiation: 'bg-amber-500',
  won: 'bg-success',
  lost: 'bg-danger',
};

function DealCard({ deal, onEdit }: { deal: DealDto; onEdit: (deal: DealDto) => void }) {
  const { toast } = useToast();
  const changeStage = useChangeDealStage();
  const deleteDeal = useDeleteDeal();

  const run = async (promise: Promise<unknown>, success: string) => {
    try {
      await promise;
      if (success) toast({ title: success, tone: 'success' });
    } catch (error) {
      toast({ title: 'Action failed', description: error instanceof ApiClientError ? error.message : 'Please try again.', tone: 'error' });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-sm">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{deal.title}</p>
        <DropdownMenu
          trigger={<span className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-fg hover:bg-surface-muted hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></span>}
        >
          <DropdownItem icon={Pencil} onSelect={() => onEdit(deal)}>Edit</DropdownItem>
          <DropdownSeparator />
          {DEAL_STAGES.filter((s) => s !== deal.stage).map((s) => (
            <DropdownItem key={s} icon={ArrowRight} onSelect={() => run(changeStage.mutateAsync({ id: deal.id, stage: s }), '')}>
              Move to {DEAL_STAGE_LABELS[s]}
            </DropdownItem>
          ))}
          <DropdownSeparator />
          <DropdownItem icon={Trash2} danger onSelect={() => run(deleteDeal.mutateAsync(deal.id), 'Deal removed')}>Delete</DropdownItem>
        </DropdownMenu>
      </div>
      <p className="mb-2 text-xs text-muted-fg">{deal.customerName}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{formatCurrency(deal.value)}</span>
        <span className="text-xs text-muted-fg">{deal.probability}% · {formatCompactCurrency(deal.weightedValue)}</span>
      </div>
    </div>
  );
}

export function PipelineBoard({ deals, onEditDeal }: { deals: DealDto[]; onEditDeal: (deal: DealDto) => void }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {DEAL_STAGES.map((stage) => {
        const columnDeals = deals.filter((d) => d.stage === stage);
        const columnValue = columnDeals.reduce((sum, d) => sum + d.value, 0);
        return (
          <div key={stage} className="w-72 shrink-0 rounded-xl bg-surface-muted/50 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${stageAccent[stage]}`} />
                <p className="text-sm font-medium text-foreground">{DEAL_STAGE_LABELS[stage]}</p>
                <span className="rounded-full bg-surface px-1.5 text-xs text-muted-fg">{columnDeals.length}</span>
              </div>
              <span className="text-xs font-medium text-muted-fg">{formatCompactCurrency(columnValue)}</span>
            </div>
            <div className="space-y-2">
              {columnDeals.length === 0 ? (
                <p className="px-1 py-6 text-center text-xs text-muted-fg">No deals</p>
              ) : (
                columnDeals.map((deal) => <DealCard key={deal.id} deal={deal} onEdit={onEditDeal} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
