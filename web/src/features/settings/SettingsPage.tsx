import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { cn } from '@/lib/cn';
import { OrgProfilePanel } from './OrgProfilePanel';
import { UsersPanel } from './UsersPanel';

type Tab = 'organization' | 'users';

const tabs: { key: Tab; label: string }[] = [
  { key: 'organization', label: 'Organization' },
  { key: 'users', label: 'Users' },
];

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>('organization');

  return (
    <div>
      <PageHeader title="System Settings" description="Configure your organization and manage users." />

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

      {tab === 'organization' ? <OrgProfilePanel /> : <UsersPanel />}
    </div>
  );
}
