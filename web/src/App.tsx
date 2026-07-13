import { Boxes } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SystemStatusCard } from '@/features/health/SystemStatusCard';

/**
 * Phase 1 landing surface. Establishes the theme system, API client, and data
 * layer. It is replaced by the authenticated application shell in Phase 3.
 */
export default function App() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface/60 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-fg">
            <Boxes className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">CoreSphere ERP</p>
            <p className="text-xs text-muted-fg">Enterprise Resource Planning</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
        <div className="max-w-xl text-center">
          <span className="inline-block rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-fg">
            Phase 1 · Foundation
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            The platform foundation is live
          </h1>
          <p className="mt-3 text-sm text-muted-fg sm:text-base">
            Monorepo, type-safe API client, centralized error handling, and the theming system are
            in place. The panel below verifies the backend and database connection end to end.
          </p>
        </div>

        <SystemStatusCard />
      </main>

      <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-fg">
        CoreSphere ERP · Built phase by phase
      </footer>
    </div>
  );
}
