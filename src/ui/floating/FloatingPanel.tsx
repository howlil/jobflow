import { useState } from 'react';

import type { PageAnalysisSummary } from '../../application/forms/analyze-field-contexts';
import type { FillAnalysis } from '../../application/prepare-fill/prepare-fill-plan';
import type { CorrectionTarget } from '../../domain/corrections/correction-schema';
import type { FieldContext } from '../../domain/forms/field-context';

export type SensitiveVaultStatus = 'not-configured' | 'locked' | 'unlocked';

type FloatingPanelProps = {
  summary: PageAnalysisSummary;
  reviewItems?: FillAnalysis[];
  sensitiveItems?: FillAnalysis[];
  vaultStatus?: SensitiveVaultStatus;
  sensitiveError?: string | null;
  siteHost?: string;
  onFill: () => void;
  onRemember?: (context: FieldContext, target: CorrectionTarget) => void;
  onOpenOptions?: () => void;
  onUnlockSensitive?: (passphrase: string) => void;
  onFillSensitive?: () => void;
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

export function FloatingPanel({
  summary,
  reviewItems = [],
  sensitiveItems = [],
  vaultStatus,
  sensitiveError = null,
  siteHost = 'this site',
  onFill,
  onRemember,
  onOpenOptions,
  onUnlockSensitive,
  onFillSensitive,
}: FloatingPanelProps) {
  const [passphrase, setPassphrase] = useState('');
  const fillLabel =
    summary.ready === 0
      ? 'No safe fields ready to fill yet'
      : `Fill ${summary.ready} ready ${summary.ready === 1 ? 'field' : 'fields'}`;

  return (
    <aside className="fillio-panel" aria-label="Fillio form assistant">
      <div className="fillio-panel__header">
        <strong>Fillio</strong>
      </div>
      <div className="fillio-panel__counts" aria-label="Form analysis summary">
        <span className="fillio-chip">
          <span>Ready</span>
          <strong>{summary.ready}</strong>
        </span>
        <span className="fillio-chip">
          <span>Review</span>
          <strong>{summary.needsReview}</strong>
        </span>
        <span className="fillio-chip">
          <span>Sensitive</span>
          <strong>{summary.sensitive}</strong>
        </span>
        <span className="fillio-chip">
          <span>Unknown</span>
          <strong>{summary.unknown}</strong>
        </span>
      </div>

      {reviewItems.length > 0 && onRemember !== undefined ? (
        <div
          className="fillio-panel__reviews"
          aria-label="Fields needing review"
        >
          {reviewItems.map((item) => {
            if (item.match.status !== 'review') return null;
            const label = fieldLabel(item.context);
            return (
              <div
                className="fillio-panel__review"
                key={`${item.context.formFingerprint}:${item.context.fieldFingerprint}`}
              >
                <strong>{label}</strong>
                <div className="fillio-panel__review-actions">
                  {item.match.candidates.map((candidate) => (
                    <button
                      className="fillio-panel__action--secondary"
                      type="button"
                      key={candidate.field}
                      aria-label={`Use ${candidate.field} for ${label}`}
                      onClick={() => onRemember(item.context, candidate.field)}
                    >
                      {candidate.field}
                    </button>
                  ))}
                  <button
                    className="fillio-panel__action--secondary"
                    type="button"
                    aria-label={`Ignore ${label}`}
                    onClick={() => onRemember(item.context, 'ignore')}
                  >
                    Ignore
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {sensitiveItems.length > 0 ? (
        <section
          className="fillio-panel__sensitive"
          aria-label="Sensitive fields requiring approval"
        >
          <h2 className="fillio-panel__section-heading">
            Sensitive fields detected
          </h2>
          <ul className="fillio-panel__sensitive-list">
            {sensitiveItems.map((item) => (
              <li
                key={`${item.context.formFingerprint}:${item.context.fieldFingerprint}`}
              >
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
            <button
              className="fillio-panel__action fillio-panel__action--primary"
              type="button"
              onClick={onOpenOptions}
            >
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

      <button
        className="fillio-panel__fill"
        type="button"
        disabled={summary.ready === 0}
        onClick={onFill}
      >
        {fillLabel}
      </button>
    </aside>
  );
}
