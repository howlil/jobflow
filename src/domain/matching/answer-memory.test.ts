import { describe, expect, it, vi } from 'vitest';

import type { FieldContext } from '../forms/field-context';
import {
  answerMemoryAsReusableAnswers,
  createEmptyAnswerMemory,
  rememberAnswer,
} from './answer-memory';
import { matchReusableAnswer } from './reusable-answers';

const context: FieldContext = {
  controlKind: 'input',
  inputType: 'text',
  label: 'Do you require sponsorship?',
  name: 'sponsorship',
  id: 'sponsorship',
  placeholder: '',
  ariaLabel: '',
  options: [],
  sectionText: 'Work authorization',
  origin: 'https://jobs.example.test',
  formFingerprint: 'form-a',
  fieldFingerprint: 'field-a',
};

describe('answer memory', () => {
  it('remembers a manual answer and reuses it for an equivalent future question', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'answer-1' });
    const memory = rememberAnswer(
      createEmptyAnswerMemory(),
      context,
      'No',
      '2026-09-04T00:00:00.000Z',
    );

    expect(memory.entries).toHaveLength(1);
    expect(memory.entries[0]?.answer).toBe('No');

    const nextContext = {
      ...context,
      origin: 'https://careers.other.test',
      formFingerprint: 'form-b',
      fieldFingerprint: 'field-b',
    };
    expect(
      matchReusableAnswer(nextContext, answerMemoryAsReusableAnswers(memory)),
    ).toEqual({
      status: 'ready-answer',
      answerId: 'memory-answer-1',
      reason: 'exact-reusable-answer',
      sensitivity: 'normal',
    });
    vi.unstubAllGlobals();
  });

  it('updates the remembered value for the same normalized question', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'answer-1' });
    const first = rememberAnswer(createEmptyAnswerMemory(), context, 'No');
    const second = rememberAnswer(
      first,
      { ...context, label: '  Do you require sponsorship? ' },
      'Yes',
    );

    expect(second.entries).toHaveLength(1);
    expect(second.entries[0]?.answer).toBe('Yes');
    vi.unstubAllGlobals();
  });
});
