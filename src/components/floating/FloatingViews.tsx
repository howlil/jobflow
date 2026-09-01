import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  HelpCircle,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';

import {
  APPLICATION_STAGES,
  type ApplicationStage,
} from '../../domain/applications/application-schema';
import type { ApplicationDraft } from '../../application/applications/application-service';
import type { PageAnalysisSummary } from '../../application/forms/analyze-field-contexts';
import type { PageDocumentFieldSummary } from '../../application/forms/page-messages';
import type { FillAnalysis } from '../../application/prepare-fill/prepare-fill-plan';
import type { CorrectionTarget } from '../../domain/corrections/correction-schema';
import type { FieldContext } from '../../domain/forms/field-context';
import type { CanonicalField } from '../../domain/matching/canonical-fields';
import type { SensitiveVaultStatus } from './FloatingPanel';

const CANONICAL_FIELD_LABELS: Record<CanonicalField, string> = {
  'personal.legalName.first': 'First name',
  'personal.legalName.middle': 'Middle name',
  'personal.legalName.last': 'Last name',
  'personal.preferredName': 'Preferred name',
  'contact.email.primary': 'Primary email',
  'contact.phone.primary': 'Primary phone',
  'contact.whatsapp': 'WhatsApp',
  'contact.address.city': 'City',
  'contact.address.state': 'State / province',
  'contact.address.country': 'Country',
  'contact.address.postalCode': 'Postal code',
  'links.linkedin': 'LinkedIn',
  'links.github': 'GitHub',
  'links.portfolio': 'Portfolio',
  'professional.headline': 'Professional headline',
  'jobPreferences.willingToRelocate': 'Willing to relocate',
  'jobPreferences.willingToTravel': 'Willing to travel',
  'jobPreferences.availabilityDate': 'Availability date',
};

export function floatingFieldLabel(context: FieldContext): string {
  return (
    context.label ||
    context.ariaLabel ||
    context.placeholder ||
    context.name ||
    'Unlabeled field'
  );
}

function intentLabel(intent: PageDocumentFieldSummary['intent']): string {
  if (intent === 'cover_letter') return 'Cover letter';
  if (intent === 'resume') return 'Resume';
  if (intent === 'transcript') return 'Transcript';
  if (intent === 'certificate') return 'Certificate';
  if (intent === 'portfolio') return 'Portfolio';
  return 'File upload';
}

const STAGE_LABELS: Record<ApplicationStage, string> = {
  saved: 'Saved',
  applying: 'Applying',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  closed: 'Closed',
};

export function AssistantHomeView({
  summary,
  attachableDocuments,
  documentStatus,
  onAttachDocument,
  onFill,
  onOpenOptions,
  onOpenPipeline,
  onOpenReview,
  onOpenSensitive,
}: {
  summary: PageAnalysisSummary;
  attachableDocuments: PageDocumentFieldSummary[];
  documentStatus: Record<string, string>;
  onAttachDocument: (item: PageDocumentFieldSummary) => void | Promise<void>;
  onFill: () => void;
  onOpenOptions?: () => void;
  onOpenPipeline?: () => void;
  onOpenReview: () => void;
  onOpenSensitive: () => void;
}) {
  const fillLabel =
    summary.ready === 0
      ? 'No safe fields ready to fill yet'
      : `Fill ${summary.ready} ready ${summary.ready === 1 ? 'field' : 'fields'}`;

  return (
    <div className="jobflow-panel__body">
      <div
        className="jobflow-panel__summary"
        aria-label="Form analysis summary"
      >
        <div>
          <strong>{summary.ready} ready</strong>
          <span>
            {summary.needsReview} review · {summary.sensitive} sensitive
          </span>
        </div>
        {summary.unknown > 0 ? (
          <small>{summary.unknown} unrecognized</small>
        ) : null}
      </div>

      <button
        className="jobflow-panel__fill"
        type="button"
        disabled={summary.ready === 0}
        onClick={onFill}
      >
        <CheckCircle2 aria-hidden="true" size={16} />
        {fillLabel}
      </button>

      {attachableDocuments.length > 0 ? (
        <section
          className="jobflow-panel__section"
          aria-label="Detected document fields"
        >
          <div className="jobflow-panel__section-heading">
            <FileText aria-hidden="true" size={14} />
            <span>Documents</span>
          </div>
          {attachableDocuments.map((item) => (
            <div
              className="jobflow-panel__document"
              key={item.fieldFingerprint}
            >
              <div className="jobflow-panel__document-copy">
                <strong>{intentLabel(item.intent)}</strong>
                <span>{item.recommendedDocument?.fileName}</span>
                {documentStatus[item.fieldFingerprint] ? (
                  <small role="status">
                    {documentStatus[item.fieldFingerprint]}
                  </small>
                ) : null}
              </div>
              <button
                className="jobflow-panel__action jobflow-panel__action--secondary"
                type="button"
                onClick={() => void onAttachDocument(item)}
              >
                Attach
              </button>
            </div>
          ))}
        </section>
      ) : null}

      {onOpenPipeline !== undefined ? (
        <section className="jobflow-panel__section">
          <div className="jobflow-panel__section-heading">
            <span>Pipeline</span>
          </div>
          <button
            className="jobflow-panel__open-profile"
            type="button"
            onClick={onOpenPipeline}
          >
            Review and save this job
          </button>
        </section>
      ) : null}

      {summary.needsReview > 0 || summary.sensitive > 0 ? (
        <section className="jobflow-panel__section">
          <div className="jobflow-panel__section-heading">
            <span>Needs attention</span>
          </div>
          <div className="jobflow-panel__menu">
            {summary.needsReview > 0 ? (
              <button type="button" onClick={onOpenReview}>
                <span>
                  <HelpCircle aria-hidden="true" size={15} />
                  Review ambiguous fields
                </span>
                <strong>{summary.needsReview}</strong>
              </button>
            ) : null}
            {summary.sensitive > 0 ? (
              <button type="button" onClick={onOpenSensitive}>
                <span>
                  <ShieldCheck aria-hidden="true" size={15} />
                  Sensitive fields
                </span>
                <strong>{summary.sensitive}</strong>
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {onOpenOptions !== undefined ? (
        <button
          className="jobflow-panel__open-profile"
          type="button"
          onClick={onOpenOptions}
        >
          Open profile workspace
          <ExternalLink aria-hidden="true" size={15} />
        </button>
      ) : null}
    </div>
  );
}

export function AssistantPipelineView({
  initialDraft,
  status,
  onBack,
  onSave,
}: {
  initialDraft: ApplicationDraft;
  status: string | null;
  onBack: () => void;
  onSave: (draft: ApplicationDraft) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState<ApplicationDraft>(initialDraft);

  return (
    <section
      className="jobflow-panel__detail"
      aria-label="Save job to pipeline"
    >
      <button className="jobflow-panel__back" type="button" onClick={onBack}>
        <ArrowLeft aria-hidden="true" size={15} />
        Back
      </button>
      <div>
        <p className="jobflow-panel__section-label">Pipeline</p>
        <h2>Review job details</h2>
        <p className="jobflow-panel__helper">
          Confirm the job details and optionally set the next follow-up before
          saving this local application.
        </p>
      </div>
      <div className="jobflow-panel__form">
        <label>
          Company
          <input
            value={draft.company}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                company: event.target.value,
              }))
            }
          />
        </label>
        <label>
          Role
          <input
            value={draft.role}
            onChange={(event) =>
              setDraft((current) => ({ ...current, role: event.target.value }))
            }
          />
        </label>
        <label>
          Job URL
          <input
            type="url"
            value={draft.jobUrl ?? ''}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                jobUrl: event.target.value,
              }))
            }
          />
        </label>
        <label>
          Stage
          <select
            value={draft.stage}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                stage: event.target.value as ApplicationStage,
                substage: undefined,
              }))
            }
          >
            {APPLICATION_STAGES.filter((stage) => stage !== 'closed').map(
              (stage) => (
                <option value={stage} key={stage}>
                  {STAGE_LABELS[stage]}
                </option>
              ),
            )}
          </select>
        </label>
        <label>
          Next action
          <input
            type="date"
            value={draft.nextActionAt ?? ''}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                nextActionAt: event.target.value,
              }))
            }
          />
        </label>
        <label>
          Notes
          <textarea
            value={draft.notes ?? ''}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                notes: event.target.value,
              }))
            }
          />
        </label>
      </div>
      {status !== null ? (
        <p className="jobflow-panel__status" role="status">
          {status}
        </p>
      ) : null}
      <button
        className="jobflow-panel__action jobflow-panel__action--primary"
        type="button"
        onClick={() => void onSave(draft)}
      >
        Save to pipeline
      </button>
    </section>
  );
}

export function AssistantReviewView({
  reviewItems,
  onBack,
  onRemember,
}: {
  reviewItems: FillAnalysis[];
  onBack: () => void;
  onRemember?: (context: FieldContext, target: CorrectionTarget) => void;
}) {
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
        <p className="jobflow-panel__section-label">Review</p>
        <h2>Resolve ambiguous fields</h2>
      </div>
      {reviewItems.map((item) => {
        if (item.match.status !== 'review') return null;
        const label = floatingFieldLabel(item.context);
        return (
          <div
            className="jobflow-panel__review"
            key={`${item.context.formFingerprint}:${item.context.fieldFingerprint}`}
          >
            <strong>{label}</strong>
            <div className="jobflow-panel__review-actions">
              {item.match.candidates.map((candidate) => {
                const candidateLabel = CANONICAL_FIELD_LABELS[candidate.field];
                return (
                  <button
                    className="jobflow-panel__action jobflow-panel__action--secondary"
                    type="button"
                    key={candidate.field}
                    aria-label={`Use ${candidateLabel} for ${label}`}
                    onClick={() => onRemember?.(item.context, candidate.field)}
                  >
                    {candidateLabel}
                  </button>
                );
              })}
              <button
                className="jobflow-panel__action jobflow-panel__action--secondary"
                type="button"
                aria-label={`Ignore ${label}`}
                onClick={() => onRemember?.(item.context, 'ignore')}
              >
                Ignore
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export function AssistantSensitiveView({
  sensitiveItems,
  sensitiveError,
  vaultStatus,
  passphrase,
  siteHost,
  onBack,
  onOpenOptions,
  onPassphraseChange,
  onUnlockSensitive,
  onFillSensitive,
}: {
  sensitiveItems: FillAnalysis[];
  sensitiveError: string | null;
  vaultStatus?: SensitiveVaultStatus;
  passphrase: string;
  siteHost: string;
  onBack: () => void;
  onOpenOptions?: () => void;
  onPassphraseChange: (value: string) => void;
  onUnlockSensitive?: (passphrase: string) => void;
  onFillSensitive?: () => void;
}) {
  return (
    <section
      className="jobflow-panel__detail"
      aria-label="Sensitive fields requiring approval"
    >
      <button className="jobflow-panel__back" type="button" onClick={onBack}>
        <ArrowLeft aria-hidden="true" size={15} />
        Back
      </button>
      <div>
        <p className="jobflow-panel__section-label">Sensitive</p>
        <h2>Sensitive fields detected</h2>
        <p className="jobflow-panel__helper">
          Review the detected fields first. Unlocking the vault does not fill
          anything until you approve this site.
        </p>
      </div>
      <ul className="jobflow-panel__sensitive-list">
        {sensitiveItems.map((item) => (
          <li
            key={`${item.context.formFingerprint}:${item.context.fieldFingerprint}`}
          >
            {floatingFieldLabel(item.context)}
          </li>
        ))}
      </ul>
      {sensitiveError !== null ? (
        <p className="jobflow-panel__sensitive-error" role="alert">
          <AlertTriangle aria-hidden="true" size={15} />
          {sensitiveError}
        </p>
      ) : null}
      {vaultStatus === 'not-configured' ? (
        <button
          className="jobflow-panel__action jobflow-panel__action--primary"
          type="button"
          onClick={onOpenOptions}
        >
          <LockKeyhole aria-hidden="true" size={16} />
          Set up vault
        </button>
      ) : vaultStatus === 'locked' ? (
        <div className="jobflow-panel__unlock">
          <label>
            Vault passphrase
            <input
              type="password"
              value={passphrase}
              onChange={(event) => onPassphraseChange(event.target.value)}
            />
          </label>
          <button
            className="jobflow-panel__action jobflow-panel__action--primary"
            type="button"
            onClick={() => onUnlockSensitive?.(passphrase)}
          >
            <LockKeyhole aria-hidden="true" size={16} />
            Unlock vault
          </button>
        </div>
      ) : vaultStatus === 'unlocked' ? (
        <button
          className="jobflow-panel__action jobflow-panel__action--primary"
          type="button"
          onClick={onFillSensitive}
        >
          <ShieldCheck aria-hidden="true" size={16} />
          Fill sensitive fields on {siteHost}
        </button>
      ) : null}
    </section>
  );
}
