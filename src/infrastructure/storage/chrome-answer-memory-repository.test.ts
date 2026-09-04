import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = new Map<string, unknown>();

vi.mock('wxt/browser', () => ({
  browser: {
    storage: {
      local: {
        get: vi.fn(async (key: string) => ({ [key]: storage.get(key) })),
        set: vi.fn(async (value: Record<string, unknown>) => {
          for (const [key, entry] of Object.entries(value))
            storage.set(key, entry);
        }),
      },
    },
  },
}));

import { createEmptyAnswerMemory } from '../../domain/matching/answer-memory';
import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import {
  ANSWER_MEMORY_STORAGE_KEY,
  ChromeAnswerMemoryRepository,
} from './chrome-answer-memory-repository';
import { PROFILE_STORAGE_KEY } from './chrome-profile-repository';

describe('ChromeAnswerMemoryRepository', () => {
  beforeEach(() => storage.clear());

  it('returns empty local memory and persists validated entries', async () => {
    const repository = new ChromeAnswerMemoryRepository();
    expect(await repository.load()).toEqual(createEmptyAnswerMemory());

    const memory = {
      schemaVersion: 1 as const,
      entries: [
        {
          id: 'memory-1',
          question: 'Do you require sponsorship?',
          answer: 'No',
          tags: [],
          updatedAt: '2026-09-04T00:00:00.000Z',
        },
      ],
    };
    await repository.save(memory);

    expect(storage.get(ANSWER_MEMORY_STORAGE_KEY)).toEqual(memory);
    expect(await repository.load()).toEqual(memory);
  });

  it('stores remembered form answers in an application variant when a profile exists', async () => {
    const profile = createEmptyStoredProfile('2026-09-05T00:00:00.000Z');
    profile.variants.push({ id: 'backend', name: 'Backend', targetRoles: [] });
    profile.preferences.defaultVariantId = 'backend';
    storage.set(PROFILE_STORAGE_KEY, profile);

    const repository = new ChromeAnswerMemoryRepository();
    await repository.save({
      schemaVersion: 1,
      entries: [
        {
          id: 'memory-variant',
          question: 'Why are you interested in this role?',
          answer: 'I like high-scale backend systems.',
          tags: [],
          updatedAt: '2026-09-05T01:00:00.000Z',
        },
      ],
    });

    const storedProfile = storage.get(PROFILE_STORAGE_KEY) as ReturnType<
      typeof createEmptyStoredProfile
    >;
    expect(storedProfile.variants[0]?.customAnswers?.[0]).toMatchObject({
      id: 'memory-variant',
      answer: 'I like high-scale backend systems.',
    });
  });
});
