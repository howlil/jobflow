import { z } from 'zod';

import {
  isCanonicalField,
  type CanonicalField,
} from '../matching/canonical-fields';

export type ReusableAnswerCorrectionTarget = `answer:${string}`;
export type CorrectionTarget =
  | CanonicalField
  | ReusableAnswerCorrectionTarget
  | 'ignore';

export type FieldCorrection = {
  origin: string;
  formFingerprint: string;
  fieldFingerprint: string;
  target: CorrectionTarget;
  updatedAt: string;
};

export type StoredCorrectionEnvelope = {
  schemaVersion: 2;
  entries: FieldCorrection[];
};

export function reusableAnswerCorrectionTarget(
  answerId: string,
): ReusableAnswerCorrectionTarget {
  return `answer:${answerId}`;
}

export function isReusableAnswerCorrectionTarget(
  value: unknown,
): value is ReusableAnswerCorrectionTarget {
  return (
    typeof value === 'string' &&
    value.startsWith('answer:') &&
    value.slice('answer:'.length).trim().length > 0
  );
}

export function reusableAnswerIdFromCorrectionTarget(
  target: ReusableAnswerCorrectionTarget,
): string {
  return target.slice('answer:'.length);
}

function isCorrectionTarget(value: unknown): value is CorrectionTarget {
  return (
    value === 'ignore' ||
    isCanonicalField(value) ||
    isReusableAnswerCorrectionTarget(value)
  );
}

const EntrySchema = z.object({
  origin: z.string().min(1),
  formFingerprint: z.string().min(1),
  fieldFingerprint: z.string().min(1),
  target: z.custom<CorrectionTarget>(isCorrectionTarget),
  updatedAt: z.string().min(1),
});

const V1EntrySchema = z.object({
  origin: z.string().min(1),
  formFingerprint: z.string().min(1),
  fieldFingerprint: z.string().min(1),
  target: z.custom<CanonicalField | 'ignore'>(
    (value) => value === 'ignore' || isCanonicalField(value),
  ),
  updatedAt: z.string().min(1),
});

const V1EnvelopeSchema = z.object({
  schemaVersion: z.literal(1),
  entries: z.array(V1EntrySchema),
});

const V2EnvelopeSchema = z.object({
  schemaVersion: z.literal(2),
  entries: z.array(EntrySchema),
});

export function createEmptyStoredCorrections(): StoredCorrectionEnvelope {
  return { schemaVersion: 2, entries: [] };
}

export function parseStoredCorrections(
  value: unknown,
): StoredCorrectionEnvelope {
  const parsed = z.union([V1EnvelopeSchema, V2EnvelopeSchema]).parse(value);
  return parsed.schemaVersion === 1
    ? { schemaVersion: 2, entries: parsed.entries }
    : parsed;
}
