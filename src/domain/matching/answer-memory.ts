import { z } from 'zod';

import type { FieldContext } from '../forms/field-context';
import { normalizeFieldText } from './normalize-field-text';
import type { ReusableAnswer } from './reusable-answers';

const AnswerMemoryEntrySchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  tags: z.array(z.string()),
  updatedAt: z.string().min(1),
});

const AnswerMemoryEnvelopeSchema = z.object({
  schemaVersion: z.literal(1),
  entries: z.array(AnswerMemoryEntrySchema),
});

export type AnswerMemoryEntry = z.infer<typeof AnswerMemoryEntrySchema>;
export type AnswerMemoryEnvelope = z.infer<typeof AnswerMemoryEnvelopeSchema>;

export function createEmptyAnswerMemory(): AnswerMemoryEnvelope {
  return { schemaVersion: 1, entries: [] };
}

export function parseAnswerMemory(value: unknown): AnswerMemoryEnvelope {
  return AnswerMemoryEnvelopeSchema.parse(value);
}

export function questionForContext(context: FieldContext): string {
  return (
    context.label.trim() ||
    context.ariaLabel.trim() ||
    context.placeholder.trim() ||
    context.name.trim()
  );
}

function questionKey(value: string): string {
  return normalizeFieldText(value);
}

export function rememberAnswer(
  memory: AnswerMemoryEnvelope,
  context: FieldContext,
  answer: string,
  now = new Date().toISOString(),
): AnswerMemoryEnvelope {
  const question = questionForContext(context);
  const normalizedQuestion = questionKey(question);
  const normalizedAnswer = answer.trim();
  if (!normalizedQuestion || !normalizedAnswer) return memory;

  const existing = memory.entries.find(
    (entry) => questionKey(entry.question) === normalizedQuestion,
  );
  const entry: AnswerMemoryEntry = {
    id: existing?.id ?? `memory-${globalThis.crypto.randomUUID()}`,
    question,
    answer: normalizedAnswer,
    tags: existing?.tags ?? [],
    updatedAt: now,
  };

  return {
    schemaVersion: 1,
    entries: [
      entry,
      ...memory.entries.filter((candidate) => candidate.id !== entry.id),
    ],
  };
}

export function answerMemoryAsReusableAnswers(
  memory: AnswerMemoryEnvelope,
): ReusableAnswer[] {
  return memory.entries.map((entry) => ({
    id: entry.id,
    question: entry.question,
    answer: entry.answer,
    canonicalIntent: '',
    tags: entry.tags,
  }));
}
