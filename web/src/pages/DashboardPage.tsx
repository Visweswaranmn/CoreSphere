import { Boxes, LogOut, ShieldCheck } from 'lucide-react';
import { ROLE_LABELS } from '@coresphere/shared';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SystemStatusCard } from '@/features/health/SystemStatusCard';
import { useAuth } from '@/features/auth/useAuth';

/**
 * Minimal authenticated landing for Phase 2. It confirms the session and role,
 * and is replaced by the full application shell + executive dashboard in Phase 3.
 */
export function DashboardPage() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-fg">
            <Boxes className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">CoreSphere ERP</p>
            <p className="text-xs text-muted-fg">Enterprise Resource Planning</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-foreground">{user.fullName}</p>
            <p className="text-xs text-muted-fg">{user.email}</p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </span>
          <ThemeToggle />
          <Button variant="secondary" size="sm" onClick={() => void logout()}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="mb-8">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-fg">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            {ROLE_LABELS[user.role]}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back, {user.firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-fg">
            You are signed in. Authentication and role-based access control are active. The full
            dashboard and navigation arrive in Phase 3.
          </p>
        </div>

        <SystemStatusCard />
      </main>
    </div>
  );
}
