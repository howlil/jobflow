import type { FieldCorrection } from '../../domain/corrections/correction-schema';
import {
  classifyDocumentFieldIntent,
  type DocumentFieldIntent,
} from '../../domain/documents/classify-document-field';
import { recommendDocumentsForVariant } from '../../domain/documents/recommend-document';
import type { FieldContext } from '../../domain/forms/field-context';
import type {
  BaseProfile,
  DocumentMetadata,
  StoredProfileEnvelope,
} from '../../domain/profile/profile-schema';
import {
  recommendApplicationVariant,
  type VariantRecommendation,
} from '../../domain/variants/recommend-variant';
import { resolveApplicationProfile } from '../../domain/variants/resolve-profile';
import {
  analyzeFieldContexts,
  type PageAnalysis,
} from './analyze-field-contexts';
import type {
  PageContextResponse,
  PageDocumentFieldSummary,
  PageVariantOption,
  RecommendedDocumentSummary,
} from './page-messages';

export type AnalyzedPageContext = {
  analysis: PageAnalysis;
  variantRecommendation: VariantRecommendation;
  activeVariantId: string | null;
  variantOptions: PageVariantOption[];
  fileInputCount: number;
  recommendedResume: RecommendedDocumentSummary | null;
  documentFields: PageDocumentFieldSummary[];
};

type AnalyzePageContextInput = {
  fields: FieldContext[];
  envelope: StoredProfileEnvelope;
  corrections: FieldCorrection[];
  pageSignals: string[];
  variantOverrideId: string | null;
};

function documentSummary(
  document: DocumentMetadata | null | undefined,
): RecommendedDocumentSummary | null {
  return document === null || document === undefined
    ? null
    : { id: document.id, label: document.label, fileName: document.fileName };
}

function documentForIntent(
  intent: DocumentFieldIntent,
  baseProfile: BaseProfile,
  recommended: ReturnType<typeof recommendDocumentsForVariant>,
): DocumentMetadata | null {
  if (intent === 'resume') return recommended.resume;
  if (intent === 'cover_letter') return recommended.coverLetter;
  if (intent === 'transcript') {
    return baseProfile.documents.transcripts[0] ?? null;
  }
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

export function analyzePageContext({
  fields,
  envelope,
  corrections,
  pageSignals,
  variantOverrideId,
}: AnalyzePageContextInput): AnalyzedPageContext {
  const variantOptions = envelope.variants.map((variant) => ({
    id: variant.id,
    name: variant.name || 'Untitled variant',
  }));
  const overrideExists =
    variantOverrideId !== null &&
    envelope.variants.some((variant) => variant.id === variantOverrideId);
  const variantRecommendation = recommendApplicationVariant(
    envelope.variants,
    pageSignals,
    envelope.preferences.defaultVariantId,
    envelope.baseProfile,
  );
  const activeVariantId = overrideExists
    ? variantOverrideId
    : variantRecommendation.variantId;
  const selectedVariant =
    activeVariantId === null
      ? undefined
      : envelope.variants.find((variant) => variant.id === activeVariantId);
  const profile = resolveApplicationProfile(
    envelope.baseProfile,
    selectedVariant,
  );
  const documents = recommendDocumentsForVariant(
    envelope.baseProfile,
    selectedVariant,
  );
  const fileFields = fields.filter((field) => field.controlKind === 'file');
  const documentFields = fileFields.map((field, index) => {
    const classification = classifyDocumentFieldIntent(field);
    return {
      fieldFingerprint: field.fieldFingerprint,
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
  const analysis = analyzeFieldContexts(fields, profile, corrections);

  return {
    analysis,
    variantRecommendation,
    activeVariantId,
    variantOptions,
    fileInputCount: fileFields.length,
    recommendedResume:
      fileFields.length > 0 ? documentSummary(documents.resume) : null,
    documentFields,
  };
}

export function toPageContextResponse(
  context: AnalyzedPageContext | null,
): PageContextResponse {
  if (context === null) {
    return {
      analysis: null,
      variantRecommendation: null,
      activeVariantId: null,
      variantOptions: [],
      fileInputCount: 0,
      recommendedResume: null,
      documentFields: [],
    };
  }

  return {
    analysis: context.analysis.summary,
    variantRecommendation: context.variantRecommendation,
    activeVariantId: context.activeVariantId,
    variantOptions: context.variantOptions,
    fileInputCount: context.fileInputCount,
    recommendedResume: context.recommendedResume,
    documentFields: context.documentFields,
  };
}
