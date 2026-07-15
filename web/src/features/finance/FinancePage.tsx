import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { cn } from '@/lib/cn';
import { OverviewPanel } from './OverviewPanel';
import { ExpensesPanel } from './ExpensesPanel';
import { BudgetsPanel } from './BudgetsPanel';

type Tab = 'overview' | 'expenses' | 'budgets';

const tabs: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'budgets', label: 'Budgets' },
];

export function FinancePage() {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <div>
      <PageHeader title="Finance" description="Manage expenses, budgets, and financial approvals." />

      <div className="mb-6 flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-fg hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewPanel />}
      {tab === 'expenses' && <ExpensesPanel />}
      {tab === 'budgets' && <BudgetsPanel />}
    </div>
  );
}
