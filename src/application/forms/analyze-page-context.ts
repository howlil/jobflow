import type { FieldCorrection } from '../../domain/corrections/correction-schema';
import {
  classifyDocumentFieldIntent,
  type DocumentFieldIntent,
} from '../../domain/documents/classify-document-field';
import { recommendDocumentsForVariant } from '../../domain/documents/recommend-document';
import type { FieldContext } from '../../domain/forms/field-context';
import { classifyApplicationPage } from '../../domain/forms/page-classifier';
import {
  reusableAnswerOptions,
  type ReusableAnswer,
  type ReusableAnswerOption,
} from '../../domain/matching/reusable-answers';
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
  documentFields: PageDocumentFieldSummary[];
  reusableAnswers: ReusableAnswerOption[];
};

type AnalyzePageContextInput = {
  fields: FieldContext[];
  envelope: StoredProfileEnvelope;
  corrections: FieldCorrection[];
  pageSignals: string[];
  variantOverrideId: string | null;
  rememberedAnswers?: ReusableAnswer[];
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
  rememberedAnswers = [],
}: AnalyzePageContextInput): AnalyzedPageContext {
  const pageClassification = classifyApplicationPage({ fields, pageSignals });
  const eligibleFields = pageClassification.supported ? fields : [];
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
  const effectiveAnswers = [...rememberedAnswers, ...profile.customAnswers];
  profile.customAnswers = effectiveAnswers;
  const documents = recommendDocumentsForVariant(
    envelope.baseProfile,
    selectedVariant,
  );
  const fileFields = eligibleFields.filter(
    (field) => field.controlKind === 'file',
  );
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
  const analysis = analyzeFieldContexts(eligibleFields, profile, corrections);

  return {
    analysis,
    variantRecommendation,
    activeVariantId,
    variantOptions,
    documentFields,
    reusableAnswers: reusableAnswerOptions(effectiveAnswers),
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
      documentFields: [],
    };
  }

  return {
    analysis: context.analysis.summary,
    variantRecommendation: context.variantRecommendation,
    activeVariantId: context.activeVariantId,
    variantOptions: context.variantOptions,
    documentFields: context.documentFields,
  };
}
