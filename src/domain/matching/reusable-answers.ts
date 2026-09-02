import type { FieldContext } from '../forms/field-context';
import type { BaseProfile } from '../profile/profile-schema';
import { normalizeFieldText } from './normalize-field-text';

export type ReusableAnswer = BaseProfile['customAnswers'][number];

export type ReusableAnswerOption = {
  id: string;
  label: string;
};

export type ReusableAnswerCandidate = ReusableAnswerOption & {
  score: number;
};

export type ReusableAnswerMatchResult =
  | {
      status: 'ready-answer';
      answerId: string;
      reason: 'exact-reusable-answer';
      sensitivity: 'normal';
    }
  | {
      status: 'review-answer';
      candidates: ReusableAnswerCandidate[];
      reason: 'ambiguous-reusable-answer';
      sensitivity: 'normal';
    }
  | {
      status: 'unknown-answer';
      reason: 'no-reusable-answer';
    };

function answerLabel(answer: ReusableAnswer): string {
  return (
    answer.question.trim() || answer.canonicalIntent.trim() || 'Reusable answer'
  );
}

export function reusableAnswerOptions(
  answers: ReusableAnswer[],
): ReusableAnswerOption[] {
  return answers
    .filter((answer) => answer.answer.trim().length > 0)
    .map((answer) => ({ id: answer.id, label: answerLabel(answer) }));
}

function contextSignals(context: FieldContext): string[] {
  return [context.label, context.ariaLabel, context.placeholder, context.name]
    .map(normalizeFieldText)
    .filter(Boolean);
}

function answerAliases(answer: ReusableAnswer): string[] {
  return [answer.question, ...answer.tags]
    .map(normalizeFieldText)
    .filter(Boolean);
}

function tokenScore(signal: string, alias: string): number {
  if (signal === alias) return 1;
  if (!signal || !alias) return 0;

  const signalTokens = new Set(signal.split(' '));
  const aliasTokens = new Set(alias.split(' '));
  const intersection = [...aliasTokens].filter((token) =>
    signalTokens.has(token),
  );
  if (intersection.length === 0) return 0;

  const precision = intersection.length / signalTokens.size;
  const recall = intersection.length / aliasTokens.size;
  return (2 * precision * recall) / (precision + recall);
}

export function matchReusableAnswer(
  context: FieldContext,
  answers: ReusableAnswer[],
): ReusableAnswerMatchResult {
  if (context.controlKind === 'file' || context.inputType === 'file') {
    return { status: 'unknown-answer', reason: 'no-reusable-answer' };
  }

  const signals = contextSignals(context);
  const eligible = answers.filter(
    (answer) =>
      answer.answer.trim().length > 0 && answerAliases(answer).length > 0,
  );

  for (const answer of eligible) {
    const aliases = answerAliases(answer);
    if (aliases.some((alias) => signals.includes(alias))) {
      return {
        status: 'ready-answer',
        answerId: answer.id,
        reason: 'exact-reusable-answer',
        sensitivity: 'normal',
      };
    }
  }

  const candidates = eligible
    .map((answer) => ({
      id: answer.id,
      label: answerLabel(answer),
      score: Math.max(
        ...answerAliases(answer).flatMap((alias) =>
          signals.map((signal) => tokenScore(signal, alias)),
        ),
        0,
      ),
    }))
    .filter((candidate) => candidate.score >= 0.68)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  return candidates.length > 0
    ? {
        status: 'review-answer',
        candidates,
        reason: 'ambiguous-reusable-answer',
        sensitivity: 'normal',
      }
    : { status: 'unknown-answer', reason: 'no-reusable-answer' };
}
