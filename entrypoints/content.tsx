import { createRoot, type Root } from 'react-dom/client';
import { browser } from 'wxt/browser';
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root';
import { defineContentScript } from 'wxt/utils/define-content-script';

import {
  analyzeFieldContexts,
  type PageAnalysis,
  type PageAnalysisSummary,
} from '../src/application/forms/analyze-field-contexts';
import {
  isGetPageAnalysisMessage,
  isGetPageContextMessage,
  isSetPageVariantMessage,
  type PageDocumentFieldSummary,
  type PageVariantOption,
  type RecommendedDocumentSummary,
} from '../src/application/forms/page-messages';
import { createSensitiveFillInstructions } from '../src/application/vault/sensitive-values';
import type { SensitiveFieldPath } from '../src/application/vault/vault-messages';
import type { CorrectionTarget } from '../src/domain/corrections/correction-schema';
import {
  classifyDocumentFieldIntent,
  type DocumentFieldIntent,
} from '../src/domain/documents/classify-document-field';
import { recommendDocumentsForVariant } from '../src/domain/documents/recommend-document';
import type { FieldContext } from '../src/domain/forms/field-context';
import { createFieldSetFingerprint } from '../src/domain/forms/field-set-fingerprint';
import { createEmptyStoredProfile } from '../src/domain/profile/create-empty-profile';
import type {
  BaseProfile,
  DocumentMetadata,
} from '../src/domain/profile/profile-schema';
import {
  recommendApplicationVariant,
  type VariantRecommendation,
} from '../src/domain/variants/recommend-variant';
import { resolveApplicationProfile } from '../src/domain/variants/resolve-profile';
import { applyFillInstructions } from '../src/infrastructure/dom/fill-controls';
import { extractFieldContexts } from '../src/infrastructure/dom/extract-field-contexts';
import { observeRelevantFormMutations } from '../src/infrastructure/dom/observe-form-mutations';
import { ChromeVaultClient } from '../src/infrastructure/messaging/chrome-vault-client';
import { ChromeCorrectionRepository } from '../src/infrastructure/storage/chrome-correction-repository';
import { ChromeProfileRepository } from '../src/infrastructure/storage/chrome-profile-repository';
import {
  FloatingPanel,
  type SensitiveVaultStatus,
} from '../src/ui/floating/FloatingPanel';
import { FLOATING_STYLES } from '../src/ui/floating/floating-styles';

function collectPageSignals(document: Document): string[] {
  const metaDescription = document.querySelector<HTMLMetaElement>(
    'meta[name="description"]',
  )?.content;
  const headings = [
    ...document.querySelectorAll<HTMLElement>('h1, h2, [role="heading"]'),
  ]
    .slice(0, 12)
    .map((heading) => heading.textContent?.trim() ?? '')
    .filter((value) => value.length > 0);

  return [document.title, metaDescription ?? '', ...headings].filter(
    (value) => value.length > 0,
  );
}

function documentSummary(
  document: DocumentMetadata | null | undefined,
): RecommendedDocumentSummary | null {
  return document === null || document === undefined
    ? null
    : { label: document.label, fileName: document.fileName };
}

function documentForIntent(
  intent: DocumentFieldIntent,
  baseProfile: BaseProfile,
  recommended: ReturnType<typeof recommendDocumentsForVariant>,
): DocumentMetadata | null {
  if (intent === 'resume') return recommended.resume;
  if (intent === 'cover_letter') return recommended.coverLetter;
  if (intent === 'transcript')
    return baseProfile.documents.transcripts[0] ?? null;
  if (intent === 'certificate') {
    return baseProfile.documents.certificates[0] ?? null;
  }
  return null;
}

function documentFieldLabel(field: FieldContext, index: number): string {
  return (
    field.label ||
    field.ariaLabel ||
    field.name ||
    field.id ||
    `File field ${index + 1}`
  );
}

export default defineContentScript({
  matches: ['http://*/*', 'https://*/*'],
  runAt: 'document_idle',
  world: 'ISOLATED',

  async main(ctx) {
    let currentSummary: PageAnalysisSummary | null = null;
    let currentAnalysis: PageAnalysis | null = null;
    let currentVariantRecommendation: VariantRecommendation | null = null;
    let currentActiveVariantId: string | null = null;
    let currentVariantOptions: PageVariantOption[] = [];
    let currentFileInputCount = 0;
    let currentRecommendedResume: RecommendedDocumentSummary | null = null;
    let currentDocumentFields: PageDocumentFieldSummary[] = [];
    let currentFieldSet = '';
    let currentVaultStatus: SensitiveVaultStatus = 'not-configured';
    let sensitiveError: string | null = null;
    let reactRoot: Root | null = null;
    let pageVariantOverrideId: string | null = null;
    let knownVariantIds = new Set<string>();
    let forceAnalyzePage: (() => void) | null = null;

    const messageListener = (message: unknown) => {
      if (isGetPageAnalysisMessage(message)) {
        return Promise.resolve(currentSummary);
      }
      if (isGetPageContextMessage(message)) {
        return Promise.resolve({
          analysis: currentSummary,
          variantRecommendation: currentVariantRecommendation,
          activeVariantId: currentActiveVariantId,
          variantOptions: currentVariantOptions,
          fileInputCount: currentFileInputCount,
          recommendedResume: currentRecommendedResume,
          documentFields: currentDocumentFields,
        });
      }
      if (isSetPageVariantMessage(message)) {
        if (
          message.variantId !== null &&
          !knownVariantIds.has(message.variantId)
        ) {
          return Promise.resolve({ ok: false });
        }
        pageVariantOverrideId = message.variantId;
        forceAnalyzePage?.();
        return Promise.resolve({ ok: true });
      }
      return undefined;
    };
    browser.runtime.onMessage.addListener(messageListener);
    ctx.onInvalidated(() => {
      browser.runtime.onMessage.removeListener(messageListener);
    });

    try {
      const stored = await new ChromeProfileRepository().load();
      const envelope = stored ?? createEmptyStoredProfile();
      knownVariantIds = new Set(envelope.variants.map((variant) => variant.id));
      currentVariantOptions = envelope.variants.map((variant) => ({
        id: variant.id,
        name: variant.name || 'Untitled variant',
      }));

      const correctionRepository = new ChromeCorrectionRepository();
      const vaultClient = new ChromeVaultClient();
      let corrections = await correctionRepository.listForOrigin(
        location.origin,
      );
      await refreshVaultStatus();

      async function refreshVaultStatus() {
        const response = await vaultClient.status();
        currentVaultStatus =
          response.ok && 'status' in response
            ? response.status.configured
              ? response.status.unlocked
                ? 'unlocked'
                : 'locked'
              : 'not-configured'
            : 'locked';
      }

      const renderPanel = () => {
        if (reactRoot === null) return;
        if (
          currentAnalysis === null ||
          currentAnalysis.summary.ready +
            currentAnalysis.summary.needsReview +
            currentAnalysis.summary.sensitive ===
            0
        ) {
          reactRoot.render(null);
          return;
        }

        reactRoot.render(
          <FloatingPanel
            summary={currentAnalysis.summary}
            reviewItems={currentAnalysis.plan.needsReview}
            sensitiveItems={currentAnalysis.plan.sensitive}
            vaultStatus={currentVaultStatus}
            sensitiveError={sensitiveError}
            siteHost={location.host}
            onFill={() => {
              if (currentAnalysis === null) return;
              applyFillInstructions(
                document,
                location.origin,
                currentAnalysis.plan.ready,
              );
            }}
            onOpenOptions={() => {
              void browser.runtime.openOptionsPage();
            }}
            onUnlockSensitive={(passphrase) => {
              void unlockSensitive(passphrase);
            }}
            onFillSensitive={() => {
              void fillSensitive();
            }}
            onRemember={(context, target) => {
              void rememberCorrection(context, target);
            }}
          />,
        );
      };

      const analyzePage = (force = false) => {
        const fields = extractFieldContexts(document, location.origin);
        const nextFieldSet = createFieldSetFingerprint(fields);
        if (!force && nextFieldSet === currentFieldSet) return;

        currentFieldSet = nextFieldSet;
        currentVariantRecommendation = recommendApplicationVariant(
          envelope.variants,
          collectPageSignals(document),
          envelope.preferences.defaultVariantId,
          envelope.baseProfile,
        );
        currentActiveVariantId =
          pageVariantOverrideId ?? currentVariantRecommendation.variantId;
        const selectedVariant =
          currentActiveVariantId === null
            ? undefined
            : envelope.variants.find(
                (variant) => variant.id === currentActiveVariantId,
              );
        const profile = resolveApplicationProfile(
          envelope.baseProfile,
          selectedVariant,
        );
        const documents = recommendDocumentsForVariant(
          envelope.baseProfile,
          selectedVariant,
        );

        const fileFields = fields.filter(
          (field) => field.controlKind === 'file',
        );
        currentFileInputCount = fileFields.length;
        currentRecommendedResume =
          currentFileInputCount > 0 ? documentSummary(documents.resume) : null;
        currentDocumentFields = fileFields.map((field, index) => {
          const classification = classifyDocumentFieldIntent(field);
          return {
            fieldLabel: documentFieldLabel(field, index),
            intent: classification.intent,
            evidence: classification.evidence,
            recommendedDocument: documentSummary(
              documentForIntent(
                classification.intent,
                envelope.baseProfile,
                documents,
              ),
            ),
          };
        });
        currentAnalysis = analyzeFieldContexts(fields, profile, corrections);
        currentSummary = currentAnalysis.summary;
        renderPanel();
      };
      forceAnalyzePage = () => analyzePage(true);

      const rememberCorrection = async (
        context: FieldContext,
        target: CorrectionTarget,
      ) => {
        await correctionRepository.upsert({
          origin: context.origin,
          formFingerprint: context.formFingerprint,
          fieldFingerprint: context.fieldFingerprint,
          target,
          updatedAt: new Date().toISOString(),
        });
        corrections = await correctionRepository.listForOrigin(location.origin);
        analyzePage(true);
      };

      const unlockSensitive = async (passphrase: string) => {
        const response = await vaultClient.unlock(passphrase);
        if (response.ok && 'status' in response && response.status.unlocked) {
          currentVaultStatus = 'unlocked';
          sensitiveError = null;
          renderPanel();
          return;
        }
        sensitiveError = 'Could not unlock the vault.';
        renderPanel();
      };

      const fillSensitive = async () => {
        if (currentAnalysis === null) return;
        const fields: SensitiveFieldPath[] = [];
        for (const item of currentAnalysis.plan.sensitive) {
          if (item.match.status === 'sensitive') {
            fields.push(item.match.field);
          }
        }
        const response = await vaultClient.readFields(fields);
        if (!response.ok || !('values' in response)) return;

        applyFillInstructions(
          document,
          location.origin,
          createSensitiveFillInstructions(
            currentAnalysis.plan.sensitive,
            response.values,
          ),
        );
      };

      analyzePage(true);

      const ui = await createShadowRootUi<Root>(ctx, {
        name: 'fillio-form-assistant',
        position: 'inline',
        anchor: 'body',
        css: FLOATING_STYLES,
        isolateEvents: true,
        onMount(container, _shadow, shadowHost) {
          shadowHost.style.position = 'fixed';
          shadowHost.style.right = '20px';
          shadowHost.style.bottom = '20px';
          shadowHost.style.zIndex = '2147483647';

          const mountPoint = document.createElement('div');
          container.append(mountPoint);
          const root = createRoot(mountPoint);
          reactRoot = root;
          renderPanel();
          return root;
        },
        onRemove(root) {
          reactRoot = null;
          root?.unmount();
        },
      });

      ui.mount();

      const watcher = observeRelevantFormMutations(document.body, () => {
        analyzePage();
      });
      ctx.onInvalidated(() => {
        watcher.disconnect();
      });
    } catch {
      currentSummary = null;
      currentAnalysis = null;
      currentVariantRecommendation = null;
      currentActiveVariantId = null;
      currentVariantOptions = [];
      currentFileInputCount = 0;
      currentRecommendedResume = null;
      currentDocumentFields = [];
      forceAnalyzePage = null;
    }
  },
});
