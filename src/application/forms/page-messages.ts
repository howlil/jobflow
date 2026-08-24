import type { PageAnalysisSummary } from './analyze-field-contexts';

export const GET_PAGE_ANALYSIS = 'fillio:get-page-analysis' as const;

export type GetPageAnalysisMessage = {
  type: typeof GET_PAGE_ANALYSIS;
};

export type GetPageAnalysisResponse = PageAnalysisSummary | null;

export function isGetPageAnalysisMessage(
  value: unknown,
): value is GetPageAnalysisMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === GET_PAGE_ANALYSIS
  );
}

export function isPageAnalysisSummary(
  value: unknown,
): value is PageAnalysisSummary {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.ready === 'number' &&
    typeof candidate.needsReview === 'number' &&
    typeof candidate.sensitive === 'number' &&
    typeof candidate.unknown === 'number' &&
    typeof candidate.total === 'number'
  );
}
