import { describe, expect, it } from 'vitest';

import type { ApplicationVariant } from '../profile/profile-schema';
import { recommendApplicationVariant } from './recommend-variant';

const variants: ApplicationVariant[] = [
  { id: 'backend', name: 'Backend Engineer', targetRoles: ['Backend Engineer'] },
  { id: 'devops', name: 'DevOps Engineer', targetRoles: ['DevOps Engineer'] },
];

describe('recommendApplicationVariant', () => {
  it('prefers the variant whose deterministic keywords match the page', () => {
    const result = recommendApplicationVariant(
      variants,
      ['Senior Backend Engineer', 'Go PostgreSQL Kafka'],
      'devops',
    );

    expect(result.variantId).toBe('backend');
    expect(result.score).toBeGreaterThan(0);
    expect(result.evidence).toContain('backend');
  });

  it('falls back to the configured default when there is no evidence', () => {
    const result = recommendApplicationVariant(
      variants,
      ['Unrelated application'],
      'devops',
    );

    expect(result).toEqual({ variantId: 'devops', score: 0, evidence: [] });
  });

  it('returns null when no variants exist', () => {
    expect(recommendApplicationVariant([], ['Backend Engineer'], null)).toEqual({
      variantId: null,
      score: 0,
      evidence: [],
    });
  });
});
