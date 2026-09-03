import { createRoot, type Root } from 'react-dom/client';
import { browser } from 'wxt/browser';
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root';
import { defineContentScript } from 'wxt/utils/define-content-script';

import {
  analyzePageContext,
  type AnalyzedPageContext,
  toPageContextResponse,
} from '../src/application/forms/analyze-page-context';
import { createApplicationService } from '../src/application/applications/application-service';
import {
  isGetPageAnalysisMessage,
  isGetPageContextMessage,
  isSetPageVariantMessage,
} from '../src/application/forms/page-messages';
import { createSensitiveFillInstructions } from '../src/application/vault/sensitive-values';
import type { SensitiveFieldPath } from '../src/application/vault/vault-messages';
import {
  isToggleAssistantMessage,
  OPEN_WORKSPACE,
} from '../src/application/workspace/workspace-messages';
import type { CorrectionTarget } from '../src/domain/corrections/correction-schema';
import type { FieldContext } from '../src/domain/forms/field-context';
import { createFieldSetFingerprint } from '../src/domain/forms/field-set-fingerprint';
import { createEmptyStoredProfile } from '../src/domain/profile/create-empty-profile';
import { parseStoredProfile } from '../src/domain/profile/migrations';
import type { StoredProfileEnvelope } from '../src/domain/profile/profile-schema';
import { attachFileToField } from '../src/infrastructure/dom/attach-file-control';
import { applyFillInstructions } from '../src/infrastructure/dom/fill-controls';
import { extractFieldContexts } from '../src/infrastructure/dom/extract-field-contexts';
import { observeRelevantFormMutations } from '../src/infrastructure/dom/observe-form-mutations';
import { ensureStructuredRecordSlots } from '../src/infrastructure/dom/structured-record-sections';
import { ChromeDocumentClient } from '../src/infrastructure/messaging/chrome-document-client';
import { ChromeVaultClient } from '../src/infrastructure/messaging/chrome-vault-client';
import { ChromeCorrectionRepository } from '../src/infrastructure/storage/chrome-correction-repository';
import { ChromeApplicationRepository } from '../src/infrastructure/storage/chrome-application-repository';
import {
  ChromeProfileRepository,
  PROFILE_STORAGE_KEY,
} from '../src/infrastructure/storage/chrome-profile-repository';
import {
  FloatingPanel,
  type DocumentAttachStatus,
  type SensitiveVaultStatus,
} from '../src/components/floating/FloatingPanel';
import { FLOATING_STYLES } from '../src/components/floating/floating-styles';

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

export default defineContentScript({
  matches: ['http://*/*', 'https://*/*'],
  allFrames: true,
  runAt: 'document_idle',
  world: 'ISOLATED',

  async main(ctx) {
    let currentContext: AnalyzedPageContext | null = null;
    let currentFieldSet = '';
    let currentVaultStatus: SensitiveVaultStatus = 'not-configured';
    let sensitiveError: string | null = null;
    let reactRoot: Root | null = null;
    let pageVariantOverrideId: string | null = null;
    let knownVariantIds = new Set<string>();
    let forceAnalyzePage: (() => void) | null = null;
    let requestAssistantOpen: (() => boolean) | null = null;
    let assistantOpenRequestId = 0;

    const messageListener = (message: unknown) => {
      if (isGetPageAnalysisMessage(message)) {
        return Promise.resolve(currentContext?.analysis.summary ?? null);
      }
      if (isGetPageContextMessage(message)) {
        return Promise.resolve(toPageContextResponse(currentContext));
      }
      if (isToggleAssistantMessage(message)) {
        return Promise.resolve({ available: requestAssistantOpen?.() ?? false });
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
      let envelope = stored ?? createEmptyStoredProfile();

      const applyProfileEnvelope = (nextEnvelope: StoredProfileEnvelope) => {
        envelope = nextEnvelope;
        knownVariantIds = new Set(
          envelope.variants.map((variant) => variant.id),
        );

        if (
          pageVariantOverrideId !== null &&
          !knownVariantIds.has(pageVariantOverrideId)
        ) {
          pageVariantOverrideId = null;
        }
      };

      applyProfileEnvelope(envelope);

      const correctionRepository = new ChromeCorrectionRepository();
      const applicationService = createApplicationService(
        new ChromeApplicationRepository(),
      );
      const vaultClient = new ChromeVaultClient();
      const documentClient = new ChromeDocumentClient();
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
          currentContext === null ||
          currentContext.analysis.summary.total === 0
        ) {
          reactRoot.render(null);
          return;
        }

        const variantName =
          currentContext.activeVariantId === null
            ? null
            : (currentContext.variantOptions.find(
                (variant) => variant.id === currentContext?.activeVariantId,
              )?.name ?? null);

        reactRoot.render(
          <FloatingPanel
            summary={currentContext.analysis.summary}
            reviewItems={currentContext.analysis.plan.needsReview}
            unknownItems={currentContext.analysis.plan.unknown}
            reusableAnswers={currentContext.reusableAnswers}
            sensitiveItems={currentContext.analysis.plan.sensitive}
            documentFields={currentContext.documentFields}
            vaultStatus={currentVaultStatus}
            sensitiveError={sensitiveError}
            siteHost={location.host}
            variantName={variantName}
            variantOptions={currentContext.variantOptions}
            activeVariantId={currentContext.activeVariantId}
            variantRecommendation={currentContext.variantRecommendation}
            openRequestId={assistantOpenRequestId}
            onSelectVariant={(variantId) => {
              if (variantId !== null && !knownVariantIds.has(variantId)) return;
              pageVariantOverrideId = variantId;
              analyzePage(true);
            }}
            applicationDraft={applicationService.createDraftFromPageCapture({
              url: location.href,
              signals: collectPageSignals(document),
            })}
            onFill={async () => {
              if (currentContext === null) return [];
              const structured = currentContext.analysis.summary.structured;
              if (structured !== undefined) {
                await ensureStructuredRecordSlots(document, location.origin, {
                  experience: structured.experience.profileRecords,
                  education: structured.education.profileRecords,
                });
                analyzePage(true);
              }
              if (currentContext === null) return [];
              return applyFillInstructions(
                document,
                location.origin,
                currentContext.analysis.plan.ready,
              );
            }}
            onOpenOptions={() => {
              void browser.runtime.sendMessage({ type: OPEN_WORKSPACE });
            }}
            onSaveApplication={async (draft) => {
              await applicationService.create(draft);
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
            onAttachDocument={async (
              fieldFingerprint,
              documentId,
            ): Promise<DocumentAttachStatus> => {
              const file = await documentClient.getFile(documentId);
              if (file === null) return 'missing';
              const result = attachFileToField(
                document,
                location.origin,
                fieldFingerprint,
                file,
              );
              if (result.status === 'attached') return 'attached';
              return result.status === 'not-found' ? 'missing' : 'unsupported';
            }}
          />,
        );
      };

      requestAssistantOpen = () => {
        if (
          currentContext === null ||
          currentContext.analysis.summary.total === 0
        ) {
          return false;
        }
        assistantOpenRequestId += 1;
        renderPanel();
        return true;
      };

      const analyzePage = (force = false) => {
        const fields = extractFieldContexts(document, location.origin);
        const nextFieldSet = createFieldSetFingerprint(fields);
        if (!force && nextFieldSet === currentFieldSet) return;

        currentFieldSet = nextFieldSet;
        currentContext = analyzePageContext({
          fields,
          envelope,
          corrections,
          pageSignals: collectPageSignals(document),
          variantOverrideId: pageVariantOverrideId,
        });
        renderPanel();
      };
      forceAnalyzePage = () => analyzePage(true);

      const profileChangeListener: Parameters<
        typeof browser.storage.onChanged.addListener
      >[0] = (changes, areaName) => {
        if (areaName !== 'local') return;
        const profileChange = changes[PROFILE_STORAGE_KEY];
        if (profileChange === undefined) return;

        try {
          const nextEnvelope =
            profileChange.newValue === undefined
              ? createEmptyStoredProfile()
              : parseStoredProfile(profileChange.newValue);
          applyProfileEnvelope(nextEnvelope);
          analyzePage(true);
        } catch {
          currentContext = null;
          renderPanel();
        }
      };
      browser.storage.onChanged.addListener(profileChangeListener);
      ctx.onInvalidated(() => {
        browser.storage.onChanged.removeListener(profileChangeListener);
      });

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
        if (currentContext === null) return;
        const fields: SensitiveFieldPath[] = [];
        for (const item of currentContext.analysis.plan.sensitive) {
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
            currentContext.analysis.plan.sensitive,
            response.values,
          ),
        );
      };

      analyzePage(true);

      const ui = await createShadowRootUi<Root>(ctx, {
        name: 'jobflow-form-assistant',
        position: 'inline',
        anchor: 'body',
        css: FLOATING_STYLES,
        isolateEvents: true,
        onMount(container, _shadow, shadowHost) {
          shadowHost.style.position = 'fixed';
          shadowHost.style.inset = '0';
          shadowHost.style.zIndex = '2147483647';
          shadowHost.style.pointerEvents = 'none';

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
      currentContext = null;
      forceAnalyzePage = null;
      requestAssistantOpen = null;
    }
  },
});
