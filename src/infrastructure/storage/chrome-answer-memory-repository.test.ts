import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = new Map<string, unknown>();

vi.mock('wxt/browser', () => ({
  browser: {
    storage: {
      local: {
        get: vi.fn(async (key: string) => ({ [key]: storage.get(key) })),
        set: vi.fn(async (value: Record<string, unknown>) => {
          for (const [key, entry] of Object.entries(value)) storage.set(key, entry);
        }),
      },
    },
  },
}));

import { createEmptyAnswerMemory } from '../../domain/matching/answer-memory';
import {
  ANSWER_MEMORY_STORAGE_KEY,
  ChromeAnswerMemoryRepository,
} from './chrome-answer-memory-repository';

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
});
