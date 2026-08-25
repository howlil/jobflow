import { useEffect, useMemo, useState } from 'react';

import type { PageDocumentFieldSummary } from '../../application/forms/page-messages';
import type { PageAnalysisSummary } from '../../application/forms/analyze-field-contexts';
import type { FillAnalysis } from '../../application/prepare-fill/prepare-fill-plan';
import type { CorrectionTarget } from '../../domain/corrections/correction-schema';
import type { FieldContext } from '../../domain/forms/field-context';

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

function fieldLabel(context: FieldContext): string {
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
    <aside className="fillio-assistant" aria-label="Fillio form assistant">
      {isOpen ? (
        <section className="fillio-panel" aria-label="Fillio assistant menu">
          <header className="fillio-panel__header">
            <div>
              <span className="fillio-panel__eyebrow">Fillio</span>
              <strong>{variantName || 'Application assistant'}</strong>
            </div>
            <button
              className="fillio-panel__icon-button"
              type="button"
              aria-label="Close Fillio"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </header>

          {view === 'home' ? (
            <>
              <div className="fillio-panel__summary" aria-label="Form analysis summary">
                <span><strong>{summary.ready}</strong> Ready</span>
                <span><strong>{summary.needsReview}</strong> Review</span>
                <span><strong>{summary.sensitive}</strong> Sensitive</span>
                <span><strong>{summary.unknown}</strong> Unknown</span>
              </div>

              <button
                className="fillio-panel__fill"
                type="button"
                disabled={summary.ready === 0}
                onClick={onFill}
              >
                {fillLabel}
              </button>

              {attachableDocuments.length > 0 ? (
                <section className="fillio-panel__documents" aria-label="Detected document fields">
                  <p className="fillio-panel__section-label">Documents</p>
                  {attachableDocuments.map((item) => (
                    <div className="fillio-panel__document" key={item.fieldFingerprint}>
                      <div className="fillio-panel__document-copy">
                        <strong>{intentLabel(item.intent)}</strong>
                        <span>{item.recommendedDocument?.fileName}</span>
                        {documentStatus[item.fieldFingerprint] ? (
                          <small role="status">{documentStatus[item.fieldFingerprint]}</small>
                        ) : null}
                      </div>
                      <button
                        className="fillio-panel__action--secondary"
                        type="button"
                        onClick={() => void attachDocument(item)}
                      >
                        Attach
                      </button>
                    </div>
                  ))}
                </section>
              ) : null}

              <div className="fillio-panel__menu">
                {summary.needsReview > 0 ? (
                  <button type="button" onClick={() => setView('review')}>
                    <span>Review fields</span>
                    <strong>{summary.needsReview} →</strong>
                  </button>
                ) : null}
                {summary.sensitive > 0 ? (
                  <button type="button" onClick={() => setView('sensitive')}>
                    <span>Sensitive data</span>
                    <strong>{summary.sensitive} →</strong>
                  </button>
                ) : null}
              </div>

              {onOpenOptions !== undefined ? (
                <button
                  className="fillio-panel__open-profile"
                  type="button"
                  onClick={onOpenOptions}
                >
                  Open career profile ↗
                </button>
              ) : null}
            </>
          ) : null}

          {view === 'review' ? (
            <section className="fillio-panel__detail" aria-label="Fields needing review">
              <button className="fillio-panel__back" type="button" onClick={() => setView('home')}>
                ← Back
              </button>
              <div>
                <p className="fillio-panel__section-label">Review</p>
                <h2>Resolve ambiguous fields</h2>
              </div>
              {reviewItems.map((item) => {
                if (item.match.status !== 'review') return null;
                const label = fieldLabel(item.context);
                return (
                  <div className="fillio-panel__review" key={`${item.context.formFingerprint}:${item.context.fieldFingerprint}`}>
                    <strong>{label}</strong>
                    <div className="fillio-panel__review-actions">
                      {item.match.candidates.map((candidate) => (
                        <button
                          className="fillio-panel__action--secondary"
                          type="button"
                          key={candidate.field}
                          aria-label={`Use ${candidate.field} for ${label}`}
                          onClick={() => onRemember?.(item.context, candidate.field)}
                        >
                          {candidate.field}
                        </button>
                      ))}
                      <button
                        className="fillio-panel__action--secondary"
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
            <section className="fillio-panel__detail" aria-label="Sensitive fields requiring approval">
              <button className="fillio-panel__back" type="button" onClick={() => setView('home')}>
                ← Back
              </button>
              <div>
                <p className="fillio-panel__section-label">Sensitive</p>
                <h2>Sensitive fields detected</h2>
              </div>
              <ul className="fillio-panel__sensitive-list">
                {sensitiveItems.map((item) => (
                  <li key={`${item.context.formFingerprint}:${item.context.fieldFingerprint}`}>
                    {fieldLabel(item.context)}
                  </li>
                ))}
              </ul>
              {sensitiveError !== null ? (
                <p className="fillio-panel__sensitive-error" role="alert">
                  {sensitiveError}
                </p>
              ) : null}
              {vaultStatus === 'not-configured' ? (
                <button className="fillio-panel__action fillio-panel__action--primary" type="button" onClick={onOpenOptions}>
                  Set up vault
                </button>
              ) : vaultStatus === 'locked' ? (
                <div className="fillio-panel__unlock">
                  <label>
                    Vault passphrase
                    <input
                      type="password"
                      value={passphrase}
                      onChange={(event) => setPassphrase(event.target.value)}
                    />
                  </label>
                  <button
                    className="fillio-panel__action fillio-panel__action--primary"
                    type="button"
                    onClick={() => onUnlockSensitive?.(passphrase)}
                  >
                    Unlock vault
                  </button>
                </div>
              ) : vaultStatus === 'unlocked' ? (
                <button
                  className="fillio-panel__action fillio-panel__action--primary"
                  type="button"
                  onClick={onFillSensitive}
                >
                  Fill sensitive fields on {siteHost}
                </button>
              ) : null}
            </section>
          ) : null}
        </section>
      ) : null}

      <button
        className="fillio-launcher"
        type="button"
        aria-label={isOpen ? 'Close Fillio' : 'Open Fillio'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="fillio-launcher__mark" aria-hidden="true">F</span>
        {attentionCount > 0 && !isOpen ? (
          <span className="fillio-launcher__badge" aria-label={`${attentionCount} items need attention`}>
            {attentionCount > 9 ? '9+' : attentionCount}
          </span>
        ) : null}
      </button>
    </aside>
  );
}
