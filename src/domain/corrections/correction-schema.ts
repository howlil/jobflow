import { z } from 'zod';

import {
  isCanonicalField,
  type CanonicalField,
} from '../matching/canonical-fields';

export type CorrectionTarget = CanonicalField | 'ignore';

export type FieldCorrection = {
  origin: string;
  formFingerprint: string;
  fieldFingerprint: string;
  target: CorrectionTarget;
  updatedAt: string;
};

export type StoredCorrectionEnvelope = {
  schemaVersion: 1;
  entries: FieldCorrection[];
};

const EntrySchema = z.object({
  origin: z.string().min(1),
  formFingerprint: z.string().min(1),
  fieldFingerprint: z.string().min(1),
  target: z.custom<CorrectionTarget>(
    (value) => value === 'ignore' || isCanonicalField(value),
  ),
  updatedAt: z.string().min(1),
});

const EnvelopeSchema = z.object({
  schemaVersion: z.literal(1),
  entries: z.array(EntrySchema),
});

export function createEmptyStoredCorrections(): StoredCorrectionEnvelope {
  return { schemaVersion: 1, entries: [] };
}

export function parseStoredCorrections(
  value: unknown,
): StoredCorrectionEnvelope {
  return EnvelopeSchema.parse(value);
}
