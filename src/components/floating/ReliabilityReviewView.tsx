import { ArrowLeft, HelpCircle } from 'lucide-react';
import { useState } from 'react';

import type { FillAnalysis } from '../../application/prepare-fill/prepare-fill-plan';
import {
  reusableAnswerCorrectionTarget,
  type CorrectionTarget,
} from '../../domain/corrections/correction-schema';
import type { FieldContext } from '../../domain/forms/field-context';
import type { ReusableAnswerOption } from '../../domain/matching/reusable-answers';
import { floatingFieldLabel } from './FloatingViews';

function reasonFor(item: FillAnalysis): string {
  if (item.match.status === 'review-answer') {
    return 'A previous answer looks relevant, but Jobflow needs confirmation before reusing it.';
  }
  if (item.match.status === 'review') {
    return 'More than one reusable profile field could match this question.';
  }
  return 'Jobflow cannot safely infer this answer yet. Fill it on the page, then remember it for future applications.';
}

export function ReliabilityReviewView({
  reviewItems,
  unknownItems,
  reusableAnswers,
  onBack,
  onRemember,
  onRememberCurrentAnswer,
}: {
  reviewItems: FillAnalysis[];
  unknownItems: FillAnalysis[];
  reusableAnswers: ReusableAnswerOption[];
  onBack: () => void;
  onRemember?: (context: FieldContext, target: CorrectionTarget) => void;
  onRememberCurrentAnswer?: (context: FieldContext) => Promise<boolean>;
}) {
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const items = [...reviewItems, ...unknownItems];

  async function rememberCurrent(item: FillAnalysis) {
    if (onRememberCurrentAnswer === undefined) return;
    const key = item.context.fieldFingerprint;
    setStatuses((current) => ({ ...current, [key]: 'Reading current answer…' }));
    const remembered = await onRememberCurrentAnswer(item.context);
    setStatuses((current) => ({
      ...current,
      [key]: remembered
        ? 'Remembered. Future equivalent questions can reuse this answer.'
        : 'Fill this field on the page first, then try again.',
    }));
  }

  return (
    <section className="jobflow-panel__detail" aria-label="Fields needing review">
      <button className="jobflow-panel__back" type="button" onClick={onBack}>
        <ArrowLeft aria-hidden="true" size={15} />
        Back
      </button>
      <div>
        <p className="jobflow-panel__section-label">Needs attention</p>
        <h2>Finish unresolved fields</h2>
        <p className="jobflow-panel__helper">
          Jobflow explains why each field was left alone. Confirm a known answer, remember what you entered manually, or leave the field for manual-only completion.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="jobflow-panel__review">
          <strong>No unresolved reusable fields.</strong>
        </div>
      ) : null}

      {items.map((item) => {
        const label = floatingFieldLabel(item.context);
        const key = item.context.fieldFingerprint;
        const answerCandidates =
          item.match.status === 'review-answer' ? item.match.candidates : [];
        return (
          <div className="jobflow-panel__review" key={`${item.context.formFingerprint}:${key}`}>
            <strong>{label}</strong>
            <small>{reasonFor(item)}</small>

            {answerCandidates.length > 0 ? (
              <div className="jobflow-panel__review-actions">
                {answerCandidates.map((candidate) => (
                  <button
                    className="jobflow-panel__action jobflow-panel__action--secondary"
                    type="button"
                    key={candidate.id}
                    onClick={() =>
                      onRemember?.(
                        item.context,
                        reusableAnswerCorrectionTarget(candidate.id),
                      )
                    }
                  >
                    Use {candidate.label}
                  </button>
                ))}
              </div>
            ) : null}

            {item.match.status === 'unknown' || item.match.status === 'unknown-answer' ? (
              <div className="jobflow-panel__review-actions">
                {reusableAnswers.slice(0, 3).map((answer) => (
                  <button
                    className="jobflow-panel__action jobflow-panel__action--secondary"
                    type="button"
                    key={answer.id}
                    onClick={() =>
                      onRemember?.(
                        item.context,
                        reusableAnswerCorrectionTarget(answer.id),
                      )
                    }
                  >
                    Use {answer.label}
                  </button>
                ))}
                {onRememberCurrentAnswer !== undefined ? (
                  <button
                    className="jobflow-panel__action jobflow-panel__action--secondary"
                    type="button"
                    onClick={() => void rememberCurrent(item)}
                  >
                    Remember current answer
                  </button>
                ) : null}
              </div>
            ) : null}

            <div className="jobflow-panel__review-actions">
              <button
                className="jobflow-panel__action jobflow-panel__action--secondary"
                type="button"
                onClick={() => onRemember?.(item.context, 'ignore')}
              >
                <HelpCircle aria-hidden="true" size={14} />
                Manual only
              </button>
            </div>
            {statuses[key] ? <small role="status">{statuses[key]}</small> : null}
          </div>
        );
      })}
    </section>
  );
}
