const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat('en-US');

/** Formats a number as whole-dollar currency, e.g. $1,240,000. */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** Compact currency for chart axes/tiles, e.g. $1.2M. */
export function formatCompactCurrency(value: number): string {
  return `$${compactFormatter.format(value)}`;
}

/** Thousands-separated integer. */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

/** Formats an ISO date/date-time string as e.g. "Mar 1, 2025" (empty if invalid). */
export function formatDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

/** Formats a byte count as a human-readable size, e.g. 1.4 MB. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

const relativeFormatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

/** Formats an ISO timestamp as a relative time, e.g. "3 hours ago". */
export function formatRelativeTime(value: string): string {
  const date = new Date(value).getTime();
  if (Number.isNaN(date)) return '';
  const diffSeconds = Math.round((date - Date.now()) / 1000);
  const abs = Math.abs(diffSeconds);
  if (abs < 60) return relativeFormatter.format(Math.round(diffSeconds / 1), 'second');
  if (abs < 3600) return relativeFormatter.format(Math.round(diffSeconds / 60), 'minute');
  if (abs < 86400) return relativeFormatter.format(Math.round(diffSeconds / 3600), 'hour');
  return relativeFormatter.format(Math.round(diffSeconds / 86400), 'day');
}
