import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';

import type { PageAnalysisSummary } from '../../src/application/forms/analyze-field-contexts';
import {
  GET_PAGE_CONTEXT,
  isPageContextResponse,
} from '../../src/application/forms/page-messages';
import type { VariantRecommendation } from '../../src/domain/variants/recommend-variant';
import { ChromeProfileRepository } from '../../src/infrastructure/storage/chrome-profile-repository';
import { PopupPage } from '../../src/ui/popup/PopupPage';

const repository = new ChromeProfileRepository();

type PageContext = {
  analysis: PageAnalysisSummary | null;
  variantRecommendation: VariantRecommendation | null;
};

export default function App() {
  const [pageContext, setPageContext] = useState<PageContext>({
    analysis: null,
    variantRecommendation: null,
  });

  useEffect(() => {
    let active = true;

    void browser.tabs
      .query({ active: true, currentWindow: true })
      .then(async ([tab]) => {
        if (tab?.id === undefined) return null;
        const response: unknown = await browser.tabs.sendMessage(tab.id, {
          type: GET_PAGE_CONTEXT,
        });
        return isPageContextResponse(response) ? response : null;
      })
      .then((context) => {
        if (active && context !== null) setPageContext(context);
      })
      .catch(() => {
        if (active) {
          setPageContext({ analysis: null, variantRecommendation: null });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <PopupPage
      repository={repository}
      openOptions={() => browser.runtime.openOptionsPage()}
      pageSummary={pageContext.analysis}
      variantRecommendation={pageContext.variantRecommendation}
    />
  );
}
