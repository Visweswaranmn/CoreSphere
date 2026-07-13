import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Inline loading spinner. */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin text-muted-fg', className)} />;
}
