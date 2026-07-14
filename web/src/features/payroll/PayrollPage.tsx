import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { cn } from '@/lib/cn';
import { RunsPanel } from './RunsPanel';
import { StructuresPanel } from './StructuresPanel';

type Tab = 'runs' | 'structures';

const tabs: { key: Tab; label: string }[] = [
  { key: 'runs', label: 'Payroll Runs' },
  { key: 'structures', label: 'Salary Structures' },
];

export function PayrollPage() {
  const [tab, setTab] = useState<Tab>('runs');

  return (
    <div>
      <PageHeader title="Payroll" description="Manage compensation, run payroll, and issue payslips." />

      <div className="mb-6 flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-fg hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'runs' ? <RunsPanel /> : <StructuresPanel />}
    </div>
  );
}
