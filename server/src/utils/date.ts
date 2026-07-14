/** Strips the time component, returning UTC midnight for the given date. */
export function toUtcDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Whole days between two dates, inclusive of both endpoints. */
export function inclusiveDayCount(start: Date, end: Date): number {
  const a = toUtcDateOnly(start).getTime();
  const b = toUtcDateOnly(end).getTime();
  return Math.floor((b - a) / 86_400_000) + 1;
}

/** Hours between two `HH:mm` times, rounded to two decimals (0 if invalid). */
export function hoursBetween(checkIn?: string, checkOut?: string): number | undefined {
  if (!checkIn || !checkOut) return undefined;
  const [inH, inM] = checkIn.split(':').map(Number);
  const [outH, outM] = checkOut.split(':').map(Number);
  if (inH == null || inM == null || outH == null || outM == null) return undefined;
  const minutes = outH * 60 + outM - (inH * 60 + inM);
  if (minutes <= 0) return undefined;
  return Math.round((minutes / 60) * 100) / 100;
}
