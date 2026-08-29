import type { FieldCorrection } from '../corrections/correction-schema';
import type { FieldContext } from '../forms/field-context';
import type { CanonicalField } from './canonical-fields';
import { matchField, type MatchResult } from './match-field';

export type CorrectionAwareMatchResult =
  | MatchResult
  | {
      status: 'ready';
      field: CanonicalField;
      reason: 'user-correction';
      sensitivity: 'normal';
    }
  | {
      status: 'unknown';
      reason: 'user-ignored';
    };

export function matchFieldWithCorrections(
  context: FieldContext,
  corrections: FieldCorrection[],
): CorrectionAwareMatchResult {
  const base = matchField(context);
  if (
    base.status === 'sensitive' ||
    (base.status === 'unknown' && base.reason === 'file-input')
  ) {
    return base;
  }

  const correction = corrections.find(
    (entry) =>
      entry.origin === context.origin &&
      entry.formFingerprint === context.formFingerprint &&
      entry.fieldFingerprint === context.fieldFingerprint,
  );

  if (correction === undefined) return base;
  if (correction.target === 'ignore') {
    return { status: 'unknown', reason: 'user-ignored' };
  }

  return {
    status: 'ready',
    field: correction.target,
    reason: 'user-correction',
    sensitivity: 'normal',
  };
}
