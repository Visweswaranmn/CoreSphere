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
