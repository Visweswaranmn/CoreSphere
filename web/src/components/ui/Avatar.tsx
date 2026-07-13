import { cn } from '@/lib/cn';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
  return (first + last).toUpperCase() || '?';
}

/** Circular user avatar: renders the image when provided, else initials. */
export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  return src ? (
    <img
      src={src}
      alt={name}
      className={cn('rounded-full object-cover', sizeClasses[size], className)}
    />
  ) : (
    <span
      aria-hidden
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary',
        sizeClasses[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
