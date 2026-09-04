import { browser } from 'wxt/browser';

import {
  createEmptyAnswerMemory,
  parseAnswerMemory,
  type AnswerMemoryEnvelope,
} from '../../domain/matching/answer-memory';
import { parseStoredProfile } from '../../domain/profile/migrations';
import { syncAnswerMemoryToVariant } from '../../domain/variants/learned-answers';
import { PROFILE_STORAGE_KEY } from './chrome-profile-repository';

export const ANSWER_MEMORY_STORAGE_KEY = 'jobflow.answerMemory';

export class ChromeAnswerMemoryRepository {
  async load(): Promise<AnswerMemoryEnvelope> {
    const stored = await browser.storage.local.get(ANSWER_MEMORY_STORAGE_KEY);
    const raw = stored[ANSWER_MEMORY_STORAGE_KEY];
    return raw === undefined
      ? createEmptyAnswerMemory()
      : parseAnswerMemory(raw);
  }

  async save(memory: AnswerMemoryEnvelope): Promise<void> {
    const validatedMemory = parseAnswerMemory(memory);
    const storedProfile = await browser.storage.local.get(PROFILE_STORAGE_KEY);
    const rawProfile = storedProfile[PROFILE_STORAGE_KEY];
    const values: Record<string, unknown> = {
      [ANSWER_MEMORY_STORAGE_KEY]: validatedMemory,
    };

    if (rawProfile !== undefined) {
      const profile = parseStoredProfile(rawProfile);
      values[PROFILE_STORAGE_KEY] = syncAnswerMemoryToVariant(
        profile,
        validatedMemory,
      );
    }

    await browser.storage.local.set(values);
  }
}
