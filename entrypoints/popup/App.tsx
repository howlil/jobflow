import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';

import {
  GET_PAGE_CONTEXT,
  isPageContextResponse,
  SET_PAGE_VARIANT,
  type PageContextResponse,
} from '../../src/application/forms/page-messages';
import { ChromeProfileRepository } from '../../src/infrastructure/storage/chrome-profile-repository';
import { PopupPage } from '../../src/ui/popup/PopupPage';

const repository = new ChromeProfileRepository();

const EMPTY_PAGE_CONTEXT: PageContextResponse = {
  analysis: null,
  variantRecommendation: null,
  activeVariantId: null,
  variantOptions: [],
  fileInputCount: 0,
  recommendedResume: null,
  documentFields: [],
};

async function getActiveTabId(): Promise<number | null> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab?.id ?? null;
}

async function readPageContext(
  tabId: number,
): Promise<PageContextResponse | null> {
  const response: unknown = await browser.tabs.sendMessage(tabId, {
    type: GET_PAGE_CONTEXT,
  });
  return isPageContextResponse(response) ? response : null;
}

export default function App() {
  const [pageContext, setPageContext] =
    useState<PageContextResponse>(EMPTY_PAGE_CONTEXT);

  useEffect(() => {
    let active = true;

    void getActiveTabId()
      .then(async (tabId) => (tabId === null ? null : readPageContext(tabId)))
      .then((context) => {
        if (active && context !== null) setPageContext(context);
      })
      .catch(() => {
        if (active) setPageContext(EMPTY_PAGE_CONTEXT);
      });

    return () => {
      active = false;
    };
  }, []);

  async function selectPageVariant(variantId: string | null) {
    try {
      const tabId = await getActiveTabId();
      if (tabId === null) return;
      await browser.tabs.sendMessage(tabId, {
        type: SET_PAGE_VARIANT,
        variantId,
      });
      const context = await readPageContext(tabId);
      if (context !== null) setPageContext(context);
    } catch {
      // Keep the last truthful page context if the tab becomes unavailable.
    }
  }

  return (
    <PopupPage
      repository={repository}
      openOptions={() => browser.runtime.openOptionsPage()}
      pageSummary={pageContext.analysis}
      variantRecommendation={pageContext.variantRecommendation}
      activeVariantId={pageContext.activeVariantId}
      variantOptions={pageContext.variantOptions}
      fileInputCount={pageContext.fileInputCount}
      recommendedResume={pageContext.recommendedResume}
      documentFields={pageContext.documentFields}
      onSelectVariant={selectPageVariant}
    />
  );
}
