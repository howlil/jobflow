import {
  isReusableAnswerCorrectionTarget,
  reusableAnswerIdFromCorrectionTarget,
  type FieldCorrection,
} from '../corrections/correction-schema';
import type { FieldContext } from '../forms/field-context';
import type { BaseProfile } from '../profile/profile-schema';
import type { CanonicalField } from './canonical-fields';
import { matchField, type MatchResult } from './match-field';
import {
  matchReusableAnswer,
  type ReusableAnswerMatchResult,
} from './reusable-answers';

export type CorrectionAwareMatchResult =
  | MatchResult
  | Exclude<ReusableAnswerMatchResult, { status: 'unknown-answer' }>
  | {
      status: 'ready';
      field: CanonicalField;
      reason: 'user-correction';
      sensitivity: 'normal';
    }
  | {
      status: 'ready-answer';
      answerId: string;
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
  customAnswers: BaseProfile['customAnswers'] = [],
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

  if (correction !== undefined) {
    if (correction.target === 'ignore') {
      return { status: 'unknown', reason: 'user-ignored' };
    }

    if (isReusableAnswerCorrectionTarget(correction.target)) {
      const answerId = reusableAnswerIdFromCorrectionTarget(correction.target);
      const answer = customAnswers.find((item) => item.id === answerId);
      if (answer !== undefined && answer.answer.trim().length > 0) {
        return {
          status: 'ready-answer',
          answerId,
          reason: 'user-correction',
          sensitivity: 'normal',
        };
      }
      return base;
    }

    return {
      status: 'ready',
      field: correction.target,
      reason: 'user-correction',
      sensitivity: 'normal',
    };
  }

  if (base.status === 'ready' || base.status === 'review') return base;

  const reusable = matchReusableAnswer(context, customAnswers);
  if (reusable.status === 'ready-answer') return reusable;
  if (reusable.status === 'review-answer') return reusable;

  return base;
}
