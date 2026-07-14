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
