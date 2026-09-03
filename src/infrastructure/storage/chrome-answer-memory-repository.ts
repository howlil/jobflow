import { browser } from 'wxt/browser';

import {
  createEmptyAnswerMemory,
  parseAnswerMemory,
  type AnswerMemoryEnvelope,
} from '../../domain/matching/answer-memory';

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
    await browser.storage.local.set({
      [ANSWER_MEMORY_STORAGE_KEY]: parseAnswerMemory(memory),
    });
  }
}
