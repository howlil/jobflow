import { ArrowLeft, HelpCircle } from 'lucide-react';
import { useState } from 'react';

import type { FillAnalysis } from '../../application/prepare-fill/prepare-fill-plan';
import {
  reusableAnswerCorrectionTarget,
  type CorrectionTarget,
} from '../../domain/corrections/correction-schema';
import type { FieldContext } from '../../domain/forms/field-context';
import type { CanonicalField } from '../../domain/matching/canonical-fields';
import type { ReusableAnswerOption } from '../../domain/matching/reusable-answers';
import { floatingFieldLabel } from './FloatingViews';

const CANONICAL_FIELD_LABELS: Record<CanonicalField, string> = {
  'personal.legalName.first': 'First name',
  'personal.legalName.middle': 'Middle name',
  'personal.legalName.last': 'Last name',
  'personal.preferredName': 'Preferred name',
  'contact.email.primary': 'Primary email',
  'contact.phone.primary': 'Primary phone',
  'contact.whatsapp': 'WhatsApp',
  'contact.address.line1': 'Address line 1',
  'contact.address.line2': 'Address line 2',
  'contact.address.city': 'City',
  'contact.address.state': 'State / province',
  'contact.address.country': 'Country',
  'contact.address.postalCode': 'Postal code',
  'links.linkedin': 'LinkedIn',
  'links.github': 'GitHub',
  'links.portfolio': 'Portfolio',
  'professional.headline': 'Professional headline',
  'professional.summary': 'Professional summary',
  'jobPreferences.willingToRelocate': 'Willing to relocate',
  'jobPreferences.willingToTravel': 'Willing to travel',
  'jobPreferences.availabilityDate': 'Availability date',
  'jobPreferences.noticePeriod': 'Notice period',
};

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
    setStatuses((current) => ({
      ...current,
      [key]: 'Reading current answer…',
    }));
    const remembered = await onRememberCurrentAnswer(item.context);
    setStatuses((current) => ({
      ...current,
      [key]: remembered
        ? 'Remembered. Future equivalent questions can reuse this answer.'
        : 'Fill this field on the page first, then try again.',
    }));
  }

  return (
    <section
      className="jobflow-panel__detail"
      aria-label="Fields needing review"
    >
      <button className="jobflow-panel__back" type="button" onClick={onBack}>
        <ArrowLeft aria-hidden="true" size={15} />
        Back
      </button>
      <div>
        <p className="jobflow-panel__section-label">Needs attention</p>
        <h2>Finish unresolved fields</h2>
        <p className="jobflow-panel__helper">
          Jobflow explains why each field was left alone. Confirm a known
          answer, remember what you entered manually, or leave the field for
          manual-only completion.
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
        return (
          <div
            className="jobflow-panel__review"
            key={`${item.context.formFingerprint}:${key}`}
          >
            <strong>{label}</strong>
            <small>{reasonFor(item)}</small>

            {item.match.status === 'review' ? (
              <div className="jobflow-panel__review-actions">
                {item.match.candidates.map((candidate) => {
                  const candidateLabel =
                    CANONICAL_FIELD_LABELS[candidate.field];
                  return (
                    <button
                      className="jobflow-panel__action jobflow-panel__action--secondary"
                      type="button"
                      key={candidate.field}
                      aria-label={`Use ${candidateLabel} for ${label}`}
                      onClick={() =>
                        onRemember?.(item.context, candidate.field)
                      }
                    >
                      {candidateLabel}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {item.match.status === 'review-answer' ? (
              <div className="jobflow-panel__review-actions">
                {item.match.candidates.map((candidate) => (
                  <button
                    className="jobflow-panel__action jobflow-panel__action--secondary"
                    type="button"
                    key={candidate.id}
                    aria-label={`Use ${candidate.label} for ${label}`}
                    onClick={() =>
                      onRemember?.(
                        item.context,
                        reusableAnswerCorrectionTarget(candidate.id),
                      )
                    }
                  >
                    {candidate.label}
                  </button>
                ))}
              </div>
            ) : null}

            {item.match.status === 'unknown' ? (
              <div className="jobflow-panel__review-actions">
                {reusableAnswers.slice(0, 3).map((answer) => (
                  <button
                    className="jobflow-panel__action jobflow-panel__action--secondary"
                    type="button"
                    key={answer.id}
                    aria-label={`Use ${answer.label} for ${label}`}
                    onClick={() =>
                      onRemember?.(
                        item.context,
                        reusableAnswerCorrectionTarget(answer.id),
                      )
                    }
                  >
                    {answer.label}
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
                aria-label={`Ignore ${label}`}
                onClick={() => onRemember?.(item.context, 'ignore')}
              >
                <HelpCircle aria-hidden="true" size={14} />
                Manual only
              </button>
            </div>
            {statuses[key] ? (
              <small role="status">{statuses[key]}</small>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
