import { Loader2 } from 'lucide-react';

/** Centered spinner shown while the session is being resolved. */
export function FullPageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-background text-muted-fg">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
