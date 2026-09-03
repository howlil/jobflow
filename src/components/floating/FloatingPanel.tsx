import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';

import type { ApplicationDraft } from '../../application/applications/application-service';
import type { PageAnalysisSummary } from '../../application/forms/analyze-field-contexts';
import type {
  PageDocumentFieldSummary,
  PageVariantOption,
} from '../../application/forms/page-messages';
import type {
  FillAnalysis,
  FillExecutionResult,
} from '../../application/prepare-fill/prepare-fill-plan';
import type { CorrectionTarget } from '../../domain/corrections/correction-schema';
import type { FieldContext } from '../../domain/forms/field-context';
import type { ReusableAnswerOption } from '../../domain/matching/reusable-answers';
import type { VariantRecommendation } from '../../domain/variants/recommend-variant';
import { ApplicationClosureView } from './ApplicationClosureView';
import { AssistantHomeView, AssistantSensitiveView } from './FloatingViews';
import { ReliabilityReviewView } from './ReliabilityReviewView';

export type SensitiveVaultStatus = 'not-configured' | 'locked' | 'unlocked';
export type DocumentAttachStatus = 'attached' | 'missing' | 'unsupported';

type AssistantTab = 'autofill' | 'pipeline' | 'sensitive';
type AutofillView = 'home' | 'review';

type FloatingPanelProps = {
  summary: PageAnalysisSummary;
  reviewItems?: FillAnalysis[];
  unknownItems?: FillAnalysis[];
  reusableAnswers?: ReusableAnswerOption[];
  sensitiveItems?: FillAnalysis[];
  documentFields?: PageDocumentFieldSummary[];
  vaultStatus?: SensitiveVaultStatus;
  sensitiveError?: string | null;
  siteHost?: string;
  variantName?: string | null;
  variantOptions?: PageVariantOption[];
  activeVariantId?: string | null;
  variantRecommendation?: VariantRecommendation | null;
  openRequestId?: number;
  applicationDraft?: ApplicationDraft | null;
  onFill: () =>
    | FillExecutionResult[]
    | void
    | Promise<FillExecutionResult[] | void>;
  onSelectVariant?: (variantId: string | null) => void;
  onSaveApplication?: (draft: ApplicationDraft) => Promise<void>;
  onRemember?: (context: FieldContext, target: CorrectionTarget) => void;
  onRememberCurrentAnswer?: (context: FieldContext) => Promise<boolean>;
  onOpenOptions?: () => void;
  onUnlockSensitive?: (passphrase: string) => void;
  onFillSensitive?: () => void;
  onAttachDocument?: (
    fieldFingerprint: string,
    documentId: string,
  ) => Promise<DocumentAttachStatus>;
};

function CompletionCoverage({ summary }: { summary: PageAnalysisSummary }) {
  const structured = summary.structured;
  if (structured === undefined) return null;

  const rows = [
    ['Experience', structured.experience] as const,
    ['Education', structured.education] as const,
  ].filter(
    ([, coverage]) =>
      coverage.profileRecords > 0 || coverage.detectedRecords > 0,
  );
  if (rows.length === 0) return null;

  return (
    <section
      className="jobflow-panel__section"
      aria-label="Structured application coverage"
    >
      <div className="jobflow-panel__section-heading">
        <span>Application coverage</span>
      </div>
      <div className="jobflow-panel__menu">
        {rows.map(([label, coverage]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>
              {coverage.detectedRecords} / {coverage.profileRecords} records
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function LocalCompletionDiagnostics({
  summary,
  filled,
  failed,
  remembered,
  attached,
}: {
  summary: PageAnalysisSummary;
  filled: number;
  failed: number;
  remembered: number;
  attached: number;
}) {
  const unresolved = summary.needsReview + summary.unknown + summary.sensitive;
  return (
    <section
      className="jobflow-panel__section"
      aria-label="Local completion diagnostics"
    >
      <div className="jobflow-panel__section-heading">
        <span>Local completion</span>
      </div>
      <div className="jobflow-panel__menu">
        <div>
          <span>Filled this session</span>
          <strong>{filled}</strong>
        </div>
        <div>
          <span>Remembered answers</span>
          <strong>{remembered}</strong>
        </div>
        <div>
          <span>Documents attached</span>
          <strong>{attached}</strong>
        </div>
        <div>
          <span>Needs attention</span>
          <strong>{unresolved}</strong>
        </div>
        {failed > 0 ? (
          <div>
            <span>Manual fallback</span>
            <strong>{failed}</strong>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ApplicationProfileSection({
  variantOptions,
  activeVariantId,
  variantRecommendation,
  onSelectVariant,
}: {
  variantOptions: PageVariantOption[];
  activeVariantId: string | null;
  variantRecommendation: VariantRecommendation | null;
  onSelectVariant?: (variantId: string | null) => void;
}) {
  if (variantOptions.length === 0 || onSelectVariant === undefined) return null;
  const recommended = variantRecommendation?.variantId ?? null;
  const recommendationLabel =
    recommended === null
      ? 'Automatic recommendation uses your base career profile.'
      : `Automatic recommendation: ${variantOptions.find((item) => item.id === recommended)?.name ?? 'application profile'}.`;

  return (
    <section
      className="jobflow-panel__section"
      aria-label="Application profile"
    >
      <div className="jobflow-panel__section-heading">
        <span>Application profile</span>
      </div>
      <div className="jobflow-panel__form">
        <label>
          Use for this page
          <select
            value={activeVariantId ?? ''}
            onChange={(event) => onSelectVariant(event.target.value || null)}
          >
            <option value="">Automatic</option>
            {variantOptions.map((variant) => (
              <option value={variant.id} key={variant.id}>
                {variant.name}
              </option>
            ))}
          </select>
        </label>
        <small>{recommendationLabel}</small>
      </div>
    </section>
  );
}

export function FloatingPanel({
  summary,
  reviewItems = [],
  unknownItems = [],
  reusableAnswers = [],
  sensitiveItems = [],
  documentFields = [],
  vaultStatus,
  sensitiveError = null,
  siteHost = 'this site',
  variantName = null,
  variantOptions = [],
  activeVariantId = null,
  variantRecommendation = null,
  openRequestId = 0,
  applicationDraft = null,
  onFill,
  onSelectVariant,
  onSaveApplication,
  onRemember,
  onRememberCurrentAnswer,
  onOpenOptions,
  onUnlockSensitive,
  onFillSensitive,
  onAttachDocument,
}: FloatingPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AssistantTab>('autofill');
  const [autofillView, setAutofillView] = useState<AutofillView>('home');
  const [passphrase, setPassphrase] = useState('');
  const [documentStatus, setDocumentStatus] = useState<Record<string, string>>(
    {},
  );
  const [applicationStatus, setApplicationStatus] = useState<string | null>(
    null,
  );
  const [fillStatus, setFillStatus] = useState<string | null>(null);
  const [filledCount, setFilledCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [rememberedCount, setRememberedCount] = useState(0);
  const [attachedCount, setAttachedCount] = useState(0);
  const teachableUnknownItems = useMemo(
    () =>
      unknownItems.filter(
        (item) =>
          item.context.controlKind !== 'file' &&
          item.context.inputType !== 'file',
      ),
    [unknownItems],
  );
  const attentionCount =
    summary.needsReview + summary.sensitive + summary.unknown;
  const autofillAttentionCount = summary.needsReview + summary.unknown;
  const attachableDocuments = useMemo(
    () => documentFields.filter((item) => item.recommendedDocument !== null),
    [documentFields],
  );

  useEffect(() => {
    if (openRequestId > 0) setIsOpen(true);
  }, [openRequestId]);

  useEffect(() => {
    if (isOpen) return;
    setActiveTab('autofill');
    setAutofillView('home');
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
          ? 'Stored file is unavailable. Open Documents to replace it.'
          : 'This site blocked direct attachment. Use the site file picker.';
    if (result === 'attached') setAttachedCount((count) => count + 1);
    setDocumentStatus((current) => ({ ...current, [key]: message }));
  }

  function updateFillStatus(results: FillExecutionResult[]) {
    const filled = results.filter(
      (result) => result.status === 'filled',
    ).length;
    const failed = results.length - filled;
    setFilledCount((count) => count + filled);
    setFailedCount((count) => count + failed);
    const unresolved =
      summary.needsReview + summary.sensitive + summary.unknown;
    setFillStatus(
      failed === 0 && unresolved === 0
        ? `${filled} ${filled === 1 ? 'field' : 'fields'} filled. Reusable data complete — review before submitting.`
        : failed === 0
          ? `${filled} ${filled === 1 ? 'field' : 'fields'} filled. ${unresolved} ${unresolved === 1 ? 'item remains' : 'items remain'} for review or manual input.`
          : `${filled} of ${results.length} fields filled. ${failed} ${failed === 1 ? 'needs' : 'need'} manual input.`,
    );
  }

  function fillReadyFields() {
    const result = onFill();
    if (result instanceof Promise) {
      void result.then((results) => {
        if (results !== undefined) updateFillStatus(results);
      });
      return;
    }
    if (result !== undefined) updateFillStatus(result);
  }

  async function rememberCurrentAnswer(
    context: FieldContext,
  ): Promise<boolean> {
    if (onRememberCurrentAnswer === undefined) return false;
    const remembered = await onRememberCurrentAnswer(context);
    if (remembered) setRememberedCount((count) => count + 1);
    return remembered;
  }

  return (
    <aside
      className={`jobflow-assistant${isOpen ? ' jobflow-assistant--open' : ''}`}
      aria-label="Job Flow form assistant"
    >
      {isOpen ? (
        <section
          className="jobflow-panel"
          aria-label="Job Flow assistant popup"
        >
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
              <X aria-hidden="true" size={18} />
            </button>
          </header>

          <div
            className="jobflow-panel__tabs"
            role="tablist"
            aria-label="Job Flow tools"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'autofill'}
              className={activeTab === 'autofill' ? 'is-active' : undefined}
              onClick={() => {
                setActiveTab('autofill');
                setAutofillView('home');
              }}
            >
              Autofill
              {autofillAttentionCount > 0 ? (
                <span>{autofillAttentionCount}</span>
              ) : null}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'pipeline'}
              className={activeTab === 'pipeline' ? 'is-active' : undefined}
              onClick={() => setActiveTab('pipeline')}
            >
              Pipeline
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'sensitive'}
              className={activeTab === 'sensitive' ? 'is-active' : undefined}
              onClick={() => setActiveTab('sensitive')}
            >
              Sensitive
              {summary.sensitive > 0 ? <span>{summary.sensitive}</span> : null}
            </button>
          </div>

          <div className="jobflow-panel__content">
            {activeTab === 'autofill' && autofillView === 'home' ? (
              <>
                <ApplicationProfileSection
                  variantOptions={variantOptions}
                  activeVariantId={activeVariantId}
                  variantRecommendation={variantRecommendation}
                  {...(onSelectVariant === undefined
                    ? {}
                    : { onSelectVariant })}
                />
                <CompletionCoverage summary={summary} />
                <AssistantHomeView
                  summary={summary}
                  attachableDocuments={attachableDocuments}
                  documentStatus={documentStatus}
                  fillStatus={fillStatus}
                  teachableUnknownCount={teachableUnknownItems.length}
                  onAttachDocument={attachDocument}
                  onFill={fillReadyFields}
                  onOpenReview={() => setAutofillView('review')}
                  onOpenSensitive={() => setActiveTab('sensitive')}
                  {...(onOpenOptions === undefined ? {} : { onOpenOptions })}
                />
                <LocalCompletionDiagnostics
                  summary={summary}
                  filled={filledCount}
                  failed={failedCount}
                  remembered={rememberedCount}
                  attached={attachedCount}
                />
              </>
            ) : null}

            {activeTab === 'autofill' && autofillView === 'review' ? (
              <ReliabilityReviewView
                reviewItems={reviewItems}
                unknownItems={teachableUnknownItems}
                reusableAnswers={reusableAnswers}
                onBack={() => setAutofillView('home')}
                {...(onRemember === undefined ? {} : { onRemember })}
                {...(onRememberCurrentAnswer === undefined
                  ? {}
                  : { onRememberCurrentAnswer: rememberCurrentAnswer })}
              />
            ) : null}

            {activeTab === 'pipeline' ? (
              applicationDraft !== null && onSaveApplication !== undefined ? (
                <ApplicationClosureView
                  initialDraft={applicationDraft}
                  status={applicationStatus}
                  onSave={async (draft) => {
                    setApplicationStatus('Saving…');
                    try {
                      await onSaveApplication(draft);
                      setApplicationStatus(
                        draft.stage === 'applied'
                          ? 'Marked as applied in Pipeline.'
                          : 'Saved to Pipeline.',
                      );
                    } catch {
                      setApplicationStatus(
                        'Company, role, and a valid URL are required.',
                      );
                    }
                  }}
                />
              ) : (
                <div className="jobflow-panel__empty">
                  <strong>No job details detected yet.</strong>
                  <span>
                    Open this tab on a supported job application page.
                  </span>
                </div>
              )
            ) : null}

            {activeTab === 'sensitive' ? (
              <AssistantSensitiveView
                sensitiveItems={sensitiveItems}
                sensitiveError={sensitiveError}
                passphrase={passphrase}
                siteHost={siteHost}
                onBack={() => setActiveTab('autofill')}
                onPassphraseChange={setPassphrase}
                {...(vaultStatus === undefined ? {} : { vaultStatus })}
                {...(onOpenOptions === undefined ? {} : { onOpenOptions })}
                {...(onUnlockSensitive === undefined
                  ? {}
                  : { onUnlockSensitive })}
                {...(onFillSensitive === undefined ? {} : { onFillSensitive })}
              />
            ) : null}
          </div>
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
