/** Parse Hero Settings ACF `dealsDate` (ISO, `Y-m-d H:i:s`, etc.). */
export const parseDealEndsAt = (value: string | undefined): number => {
  if (!value?.trim()) return NaN;
  const trimmed = value.trim();
  const direct = new Date(trimmed).getTime();
  if (Number.isFinite(direct)) return direct;
  const normalized = trimmed.replace(" ", "T");
  const withTz = new Date(normalized).getTime();
  return Number.isFinite(withTz) ? withTz : NaN;
};

/** True when a deal end time is set and already passed (SSR-safe when `now` is omitted on server). */
export const isDealExpired = (
  value: string | undefined,
  now: number = Date.now(),
): boolean => {
  const parsed = parseDealEndsAt(value);
  return Number.isFinite(parsed) && parsed <= now;
};
