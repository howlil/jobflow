import { describe, expect, it, vi } from 'vitest';

import { createEmptyAnswerMemory } from '../matching/answer-memory';
import { createEmptyStoredProfile } from '../profile/create-empty-profile';
import { syncAnswerMemoryToVariant } from './learned-answers';

describe('syncAnswerMemoryToVariant', () => {
  it('creates a reusable application variant when none exists', () => {
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(
      '00000000-0000-4000-8000-000000000001',
    );
    const profile = createEmptyStoredProfile('2026-09-05T00:00:00.000Z');
    const memory = createEmptyAnswerMemory();
    memory.entries.push({
      id: 'memory-1',
      question: 'Why are you interested in this role?',
      answer: 'I enjoy building reliable systems.',
      tags: [],
      updatedAt: '2026-09-05T01:00:00.000Z',
    });

    const result = syncAnswerMemoryToVariant(
      profile,
      memory,
      null,
      '2026-09-05T02:00:00.000Z',
    );

    expect(result.variants).toHaveLength(1);
    expect(result.preferences.defaultVariantId).toBe(result.variants[0]?.id);
    expect(result.variants[0]?.customAnswers).toEqual([
      {
        id: 'memory-1',
        question: 'Why are you interested in this role?',
        answer: 'I enjoy building reliable systems.',
        canonicalIntent: '',
        tags: [],
      },
    ]);
  });

  it('updates the default variant and deduplicates equivalent questions', () => {
    const profile = createEmptyStoredProfile('2026-09-05T00:00:00.000Z');
    profile.variants.push({
      id: 'backend',
      name: 'Backend',
      targetRoles: ['Backend Engineer'],
      customAnswers: [
        {
          id: 'answer-existing',
          question: 'Why this company?',
          answer: 'Old answer',
          canonicalIntent: 'motivation',
          tags: ['motivation'],
        },
      ],
    });
    profile.preferences.defaultVariantId = 'backend';
    const memory = createEmptyAnswerMemory();
    memory.entries.push({
      id: 'memory-2',
      question: 'Why this company?',
      answer: 'New answer',
      tags: [],
      updatedAt: '2026-09-05T01:00:00.000Z',
    });

    const result = syncAnswerMemoryToVariant(profile, memory);

    expect(result.variants[0]?.customAnswers).toHaveLength(1);
    expect(result.variants[0]?.customAnswers?.[0]).toMatchObject({
      id: 'answer-existing',
      answer: 'New answer',
      canonicalIntent: 'motivation',
    });
  });
});
