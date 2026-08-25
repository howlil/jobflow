import type { VariantRecommendation } from '../../domain/variants/recommend-variant';
import type { PageAnalysisSummary } from './analyze-field-contexts';

export const GET_PAGE_ANALYSIS = 'fillio:get-page-analysis' as const;
export const GET_PAGE_CONTEXT = 'fillio:get-page-context' as const;

export type GetPageAnalysisMessage = {
  type: typeof GET_PAGE_ANALYSIS;
};

export type GetPageContextMessage = {
  type: typeof GET_PAGE_CONTEXT;
};

export type GetPageAnalysisResponse = PageAnalysisSummary | null;

export type PageContextResponse = {
  analysis: PageAnalysisSummary | null;
  variantRecommendation: VariantRecommendation | null;
};

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

export function isGetPageContextMessage(
  value: unknown,
): value is GetPageContextMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === GET_PAGE_CONTEXT
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

function isVariantRecommendation(value: unknown): value is VariantRecommendation {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.variantId === null || typeof candidate.variantId === 'string') &&
    typeof candidate.score === 'number' &&
    Array.isArray(candidate.evidence) &&
    candidate.evidence.every((item) => typeof item === 'string')
  );
}

export function isPageContextResponse(value: unknown): value is PageContextResponse {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const analysis = candidate.analysis;
  const recommendation = candidate.variantRecommendation;
  return (
    (analysis === null || isPageAnalysisSummary(analysis)) &&
    (recommendation === null || isVariantRecommendation(recommendation))
  );
}
