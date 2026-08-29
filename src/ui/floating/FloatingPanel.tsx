import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  HelpCircle,
  LockKeyhole,
  PanelRightClose,
  ShieldCheck,
} from 'lucide-react';

import type { PageDocumentFieldSummary } from '../../application/forms/page-messages';
import type { PageAnalysisSummary } from '../../application/forms/analyze-field-contexts';
import type { FillAnalysis } from '../../application/prepare-fill/prepare-fill-plan';
import type { CorrectionTarget } from '../../domain/corrections/correction-schema';
import type { FieldContext } from '../../domain/forms/field-context';
import type { CanonicalField } from '../../domain/matching/canonical-fields';

export type SensitiveVaultStatus = 'not-configured' | 'locked' | 'unlocked';
export type DocumentAttachStatus = 'attached' | 'missing' | 'unsupported';

type AssistantView = 'home' | 'review' | 'sensitive';

type FloatingPanelProps = {
  summary: PageAnalysisSummary;
  reviewItems?: FillAnalysis[];
  sensitiveItems?: FillAnalysis[];
  documentFields?: PageDocumentFieldSummary[];
  vaultStatus?: SensitiveVaultStatus;
  sensitiveError?: string | null;
  siteHost?: string;
  variantName?: string | null;
  onFill: () => void;
  onRemember?: (context: FieldContext, target: CorrectionTarget) => void;
  onOpenOptions?: () => void;
  onUnlockSensitive?: (passphrase: string) => void;
  onFillSensitive?: () => void;
  onAttachDocument?: (
    fieldFingerprint: string,
    documentId: string,
  ) => Promise<DocumentAttachStatus>;
};

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

function fieldLabel(context: FieldContext): string {
  return (
    context.label ||
    context.ariaLabel ||
    context.placeholder ||
    context.name ||
    'Unlabeled field'
  );
}

function canonicalFieldLabel(field: CanonicalField): string {
  return CANONICAL_FIELD_LABELS[field];
}

function intentLabel(intent: PageDocumentFieldSummary['intent']): string {
  if (intent === 'cover_letter') return 'Cover letter';
  if (intent === 'resume') return 'Resume';
  if (intent === 'transcript') return 'Transcript';
  if (intent === 'certificate') return 'Certificate';
  if (intent === 'portfolio') return 'Portfolio';
  return 'File upload';
}

export function FloatingPanel({
  summary,
  reviewItems = [],
  sensitiveItems = [],
  documentFields = [],
  vaultStatus,
  sensitiveError = null,
  siteHost = 'this site',
  variantName = null,
  onFill,
  onRemember,
  onOpenOptions,
  onUnlockSensitive,
  onFillSensitive,
  onAttachDocument,
}: FloatingPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<AssistantView>('home');
  const [passphrase, setPassphrase] = useState('');
  const [documentStatus, setDocumentStatus] = useState<Record<string, string>>(
    {},
  );
  const attentionCount = summary.needsReview + summary.sensitive;
  const attachableDocuments = useMemo(
    () => documentFields.filter((item) => item.recommendedDocument !== null),
    [documentFields],
  );
  const fillLabel =
    summary.ready === 0
      ? 'No safe fields ready to fill yet'
      : `Fill ${summary.ready} ready ${summary.ready === 1 ? 'field' : 'fields'}`;

  useEffect(() => {
    if (!isOpen) setView('home');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  async function attachDocument(item: PageDocumentFieldSummary) {
    if (item.recommendedDocument === null || onAttachDocument === undefined) {
      return;
    }
    const key = item.fieldFingerprint;
    setDocumentStatus((current) => ({ ...current, [key]: 'Attaching…' }));
    const result = await onAttachDocument(key, item.recommendedDocument.id);
    const message =
      result === 'attached'
        ? 'Attached'
        : result === 'missing'
          ? 'Stored file is unavailable. Open profile to replace it.'
          : 'This site blocked direct attachment. Use the site file picker.';
    setDocumentStatus((current) => ({ ...current, [key]: message }));
  }

  return (
    <aside
      className={`jobflow-assistant${isOpen ? ' jobflow-assistant--open' : ''}`}
      aria-label="Job Flow form assistant"
    >
      {isOpen ? (
        <section className="jobflow-panel" aria-label="Job Flow assistant menu">
          <header className="jobflow-panel__header">
            <div>
              <span className="jobflow-panel__eyebrow">Job Flow</span>
              <strong>{variantName || 'Application assistant'}</strong>
              <span className="jobflow-panel__host">{siteHost}</span>
            </div>
            <button
              className="jobflow-panel__icon-button"
              type="button"
              aria-label="Close Job Flow"
              onClick={() => setIsOpen(false)}
            >
              <PanelRightClose aria-hidden="true" size={18} />
            </button>
          </header>

          {view === 'home' ? (
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
                        className="jobflow-panel__action--secondary"
                        type="button"
                        onClick={() => void attachDocument(item)}
                      >
                        Attach
                      </button>
                    </div>
                  ))}
                </section>
              ) : null}

              {summary.needsReview > 0 || summary.sensitive > 0 ? (
                <section className="jobflow-panel__section">
                  <div className="jobflow-panel__section-heading">
                    <span>Needs attention</span>
                  </div>
                  <div className="jobflow-panel__menu">
                    {summary.needsReview > 0 ? (
                      <button type="button" onClick={() => setView('review')}>
                        <span>
                          <HelpCircle aria-hidden="true" size={15} />
                          Review ambiguous fields
                        </span>
                        <strong>{summary.needsReview}</strong>
                      </button>
                    ) : null}
                    {summary.sensitive > 0 ? (
                      <button
                        type="button"
                        onClick={() => setView('sensitive')}
                      >
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
          ) : null}

          {view === 'review' ? (
            <section
              className="jobflow-panel__detail"
              aria-label="Fields needing review"
            >
              <button
                className="jobflow-panel__back"
                type="button"
                onClick={() => setView('home')}
              >
                <ArrowLeft aria-hidden="true" size={15} />
                Back
              </button>
              <div>
                <p className="jobflow-panel__section-label">Review</p>
                <h2>Resolve ambiguous fields</h2>
              </div>
              {reviewItems.map((item) => {
                if (item.match.status !== 'review') return null;
                const label = fieldLabel(item.context);
                return (
                  <div
                    className="jobflow-panel__review"
                    key={`${item.context.formFingerprint}:${item.context.fieldFingerprint}`}
                  >
                    <strong>{label}</strong>
                    <div className="jobflow-panel__review-actions">
                      {item.match.candidates.map((candidate) => {
                        const candidateLabel = canonicalFieldLabel(
                          candidate.field,
                        );
                        return (
                          <button
                            className="jobflow-panel__action--secondary"
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
                      <button
                        className="jobflow-panel__action--secondary"
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
          ) : null}

          {view === 'sensitive' ? (
            <section
              className="jobflow-panel__detail"
              aria-label="Sensitive fields requiring approval"
            >
              <button
                className="jobflow-panel__back"
                type="button"
                onClick={() => setView('home')}
              >
                <ArrowLeft aria-hidden="true" size={15} />
                Back
              </button>
              <div>
                <p className="jobflow-panel__section-label">Sensitive</p>
                <h2>Sensitive fields detected</h2>
                <p className="jobflow-panel__helper">
                  Review the detected fields first. Unlocking the vault does not
                  fill anything until you approve this site.
                </p>
              </div>
              <ul className="jobflow-panel__sensitive-list">
                {sensitiveItems.map((item) => (
                  <li
                    key={`${item.context.formFingerprint}:${item.context.fieldFingerprint}`}
                  >
                    {fieldLabel(item.context)}
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
                      onChange={(event) => setPassphrase(event.target.value)}
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
          ) : null}
        </section>
      ) : null}

      <button
        className="jobflow-launcher"
        type="button"
        aria-label={isOpen ? 'Close Job Flow' : 'Open Job Flow'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="jobflow-launcher__mark" aria-hidden="true">
          J
        </span>
        {attentionCount > 0 && !isOpen ? (
          <span
            className="jobflow-launcher__badge"
            aria-label={`${attentionCount} items need attention`}
          >
            {attentionCount > 9 ? '9+' : attentionCount}
          </span>
        ) : null}
      </button>
    </aside>
  );
}
