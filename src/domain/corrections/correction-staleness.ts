import type { FieldCorrection } from './correction-schema';

const DAY_MS = 24 * 60 * 60 * 1000;

export function isCorrectionStale(
  correction: FieldCorrection,
  now = new Date(),
  staleAfterDays = 180,
): boolean {
  const updatedAt = Date.parse(correction.updatedAt);
  if (!Number.isFinite(updatedAt)) return true;

  const thresholdMs = Math.max(0, staleAfterDays) * DAY_MS;
  return now.getTime() - updatedAt > thresholdMs;
}
