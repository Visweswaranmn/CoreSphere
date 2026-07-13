import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Surface container used across dashboards, forms, and tables. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-surface shadow-sm', className)}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  action,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { action?: ReactNode }) {
  return (
    <div
      className={cn('flex items-start justify-between gap-4 px-5 pt-5', className)}
      {...props}
    >
      <div className="min-w-0">{children}</div>
      {action}
    </div>
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-sm font-semibold text-foreground', className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-0.5 text-xs text-muted-fg', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center gap-3 border-t border-border px-5 py-3', className)}
      {...props}
    />
  );
}
