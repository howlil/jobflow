import type { DocumentFieldIntent } from '../../domain/documents/classify-document-field';
import type { VariantRecommendation } from '../../domain/variants/recommend-variant';
import type { PageAnalysisSummary } from './analyze-field-contexts';

export const GET_PAGE_ANALYSIS = 'fillio:get-page-analysis' as const;
export const GET_PAGE_CONTEXT = 'fillio:get-page-context' as const;
export const SET_PAGE_VARIANT = 'fillio:set-page-variant' as const;

export type GetPageAnalysisMessage = {
  type: typeof GET_PAGE_ANALYSIS;
};

export type GetPageContextMessage = {
  type: typeof GET_PAGE_CONTEXT;
};

export type SetPageVariantMessage = {
  type: typeof SET_PAGE_VARIANT;
  variantId: string | null;
};

export type GetPageAnalysisResponse = PageAnalysisSummary | null;

export type PageVariantOption = {
  id: string;
  name: string;
};

export type RecommendedDocumentSummary = {
  id: string;
  label: string;
  fileName: string;
};

export type PageDocumentFieldSummary = {
  fieldFingerprint: string;
  fieldLabel: string;
  intent: DocumentFieldIntent;
  evidence: string[];
  recommendedDocument: RecommendedDocumentSummary | null;
};

export type PageContextResponse = {
  analysis: PageAnalysisSummary | null;
  variantRecommendation: VariantRecommendation | null;
  activeVariantId: string | null;
  variantOptions: PageVariantOption[];
  fileInputCount: number;
  recommendedResume: RecommendedDocumentSummary | null;
  documentFields: PageDocumentFieldSummary[];
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

export function isSetPageVariantMessage(
  value: unknown,
): value is SetPageVariantMessage {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.type === SET_PAGE_VARIANT &&
    (candidate.variantId === null || typeof candidate.variantId === 'string')
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

function isVariantRecommendation(
  value: unknown,
): value is VariantRecommendation {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.variantId === null || typeof candidate.variantId === 'string') &&
    typeof candidate.score === 'number' &&
    Array.isArray(candidate.evidence) &&
    candidate.evidence.every((item) => typeof item === 'string')
  );
}

function isPageVariantOption(value: unknown): value is PageVariantOption {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'string' && typeof candidate.name === 'string';
}

function isRecommendedDocumentSummary(
  value: unknown,
): value is RecommendedDocumentSummary {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.label === 'string' &&
    typeof candidate.fileName === 'string'
  );
}

function isDocumentFieldIntent(value: unknown): value is DocumentFieldIntent {
  return (
    value === 'resume' ||
    value === 'cover_letter' ||
    value === 'portfolio' ||
    value === 'transcript' ||
    value === 'certificate' ||
    value === 'unknown'
  );
}

function isPageDocumentFieldSummary(
  value: unknown,
): value is PageDocumentFieldSummary {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const recommendedDocument = candidate.recommendedDocument;
  return (
    typeof candidate.fieldFingerprint === 'string' &&
    typeof candidate.fieldLabel === 'string' &&
    isDocumentFieldIntent(candidate.intent) &&
    Array.isArray(candidate.evidence) &&
    candidate.evidence.every((item) => typeof item === 'string') &&
    (recommendedDocument === null ||
      isRecommendedDocumentSummary(recommendedDocument))
  );
}

export function isPageContextResponse(
  value: unknown,
): value is PageContextResponse {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const analysis = candidate.analysis;
  const recommendation = candidate.variantRecommendation;
  const resume = candidate.recommendedResume;
  return (
    (analysis === null || isPageAnalysisSummary(analysis)) &&
    (recommendation === null || isVariantRecommendation(recommendation)) &&
    (candidate.activeVariantId === null ||
      typeof candidate.activeVariantId === 'string') &&
    Array.isArray(candidate.variantOptions) &&
    candidate.variantOptions.every(isPageVariantOption) &&
    typeof candidate.fileInputCount === 'number' &&
    (resume === null || isRecommendedDocumentSummary(resume)) &&
    Array.isArray(candidate.documentFields) &&
    candidate.documentFields.every(isPageDocumentFieldSummary)
  );
}
