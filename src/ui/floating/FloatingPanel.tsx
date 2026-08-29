import { useEffect, useMemo, useState } from 'react';
import { PanelRightClose } from 'lucide-react';

import type { PageDocumentFieldSummary } from '../../application/forms/page-messages';
import type { PageAnalysisSummary } from '../../application/forms/analyze-field-contexts';
import type { FillAnalysis } from '../../application/prepare-fill/prepare-fill-plan';
import type { CorrectionTarget } from '../../domain/corrections/correction-schema';
import type { FieldContext } from '../../domain/forms/field-context';
import {
  AssistantHomeView,
  AssistantReviewView,
  AssistantSensitiveView,
} from './FloatingViews';

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
            <AssistantHomeView
              summary={summary}
              attachableDocuments={attachableDocuments}
              documentStatus={documentStatus}
              onAttachDocument={attachDocument}
              onFill={onFill}
              onOpenReview={() => setView('review')}
              onOpenSensitive={() => setView('sensitive')}
              {...(onOpenOptions === undefined ? {} : { onOpenOptions })}
            />
          ) : null}

          {view === 'review' ? (
            <AssistantReviewView
              reviewItems={reviewItems}
              onBack={() => setView('home')}
              {...(onRemember === undefined ? {} : { onRemember })}
            />
          ) : null}

          {view === 'sensitive' ? (
            <AssistantSensitiveView
              sensitiveItems={sensitiveItems}
              sensitiveError={sensitiveError}
              passphrase={passphrase}
              siteHost={siteHost}
              onBack={() => setView('home')}
              onPassphraseChange={setPassphrase}
              {...(vaultStatus === undefined ? {} : { vaultStatus })}
              {...(onOpenOptions === undefined ? {} : { onOpenOptions })}
              {...(onUnlockSensitive === undefined
                ? {}
                : { onUnlockSensitive })}
              {...(onFillSensitive === undefined ? {} : { onFillSensitive })}
            />
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
