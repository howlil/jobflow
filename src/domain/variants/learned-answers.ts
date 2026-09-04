import type { AnswerMemoryEnvelope } from '../matching/answer-memory';
import { normalizeFieldText } from '../matching/normalize-field-text';
import type { StoredProfileEnvelope } from '../profile/profile-schema';

function answerKey(question: string): string {
  return normalizeFieldText(question);
}

function createLearnedVariantId(): string {
  return `variant-${globalThis.crypto.randomUUID()}`;
}

export function syncAnswerMemoryToVariant(
  envelope: StoredProfileEnvelope,
  memory: AnswerMemoryEnvelope,
  preferredVariantId: string | null = null,
  now = new Date().toISOString(),
): StoredProfileEnvelope {
  if (memory.entries.length === 0) return envelope;

  const next = structuredClone(envelope);
  const preferredIndex =
    preferredVariantId === null
      ? -1
      : next.variants.findIndex((variant) => variant.id === preferredVariantId);
  const defaultIndex =
    next.preferences.defaultVariantId === null
      ? -1
      : next.variants.findIndex(
          (variant) => variant.id === next.preferences.defaultVariantId,
        );
  let targetIndex = preferredIndex >= 0 ? preferredIndex : defaultIndex;

  if (targetIndex < 0 && next.variants.length > 0) targetIndex = 0;
  if (targetIndex < 0) {
    const id = createLearnedVariantId();
    next.variants.push({
      id,
      name: 'Learned from applications',
      targetRoles: [],
      customAnswers: [],
    });
    next.preferences.defaultVariantId = id;
    targetIndex = 0;
  }

  const target = next.variants[targetIndex];
  if (target === undefined) return envelope;
  target.customAnswers ??= [];

  for (const entry of memory.entries) {
    const key = answerKey(entry.question);
    const existingIndex = target.customAnswers.findIndex(
      (answer) => answerKey(answer.question) === key,
    );
    const existing =
      existingIndex < 0 ? undefined : target.customAnswers[existingIndex];
    const learned = {
      id: existing?.id ?? entry.id,
      question: entry.question,
      answer: entry.answer,
      canonicalIntent: existing?.canonicalIntent ?? '',
      tags: entry.tags,
    };

    if (existingIndex < 0) target.customAnswers.unshift(learned);
    else target.customAnswers[existingIndex] = learned;
  }

  next.metadata.updatedAt = now;
  return next;
}
