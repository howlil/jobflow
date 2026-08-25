import { describe, expect, it } from 'vitest';

import type { FieldCorrection } from './correction-schema';
import { isCorrectionStale } from './correction-staleness';

function correction(updatedAt: string): FieldCorrection {
  return {
    origin: 'https://jobs.example.test',
    formFingerprint: 'form-a',
    fieldFingerprint: 'field-a',
    target: 'links.github',
    updatedAt,
  };
}

describe('isCorrectionStale', () => {
  const now = new Date('2026-08-25T00:00:00.000Z');

  it('marks corrections older than the configured age as stale', () => {
    expect(
      isCorrectionStale(correction('2025-01-01T00:00:00.000Z'), now, 180),
    ).toBe(true);
  });

  it('keeps recent corrections fresh', () => {
    expect(
      isCorrectionStale(correction('2026-08-01T00:00:00.000Z'), now, 180),
    ).toBe(false);
  });

  it('treats malformed timestamps as stale so users can review them', () => {
    expect(isCorrectionStale(correction('not-a-date'), now, 180)).toBe(true);
  });
});
