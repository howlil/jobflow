import type { FieldCorrection } from '../../domain/corrections/correction-schema';
import type { FieldContext } from '../../domain/forms/field-context';
import { matchFieldWithCorrections } from '../../domain/matching/match-field-with-corrections';
import type { BaseProfile } from '../../domain/profile/profile-schema';
import {
  prepareFillPlan,
  type FillPlan,
} from '../prepare-fill/prepare-fill-plan';

export type StructuredRecordCoverage = {
  profileRecords: number;
  detectedRecords: number;
  readyRecords: number;
  readyFields: number;
  unresolvedFields: number;
};

export type PageAnalysisSummary = {
  ready: number;
  needsReview: number;
  sensitive: number;
  unknown: number;
  total: number;
  structured?: {
    experience: StructuredRecordCoverage;
    education: StructuredRecordCoverage;
  };
};

export type PageAnalysis = {
  plan: FillPlan;
  summary: PageAnalysisSummary;
};

function structuredCoverage(
  kind: 'experience' | 'education',
  profileRecords: number,
  fields: FieldContext[],
  plan: FillPlan,
): StructuredRecordCoverage {
  const structuredFields = fields.filter(
    (field) => field.structuredRecord?.kind === kind,
  );
  const detectedRecords = new Set(
    structuredFields.map((field) => field.structuredRecord?.recordIndex),
  ).size;
  const readyFingerprints = new Set(
    plan.ready.map((instruction) => instruction.fieldFingerprint),
  );
  const readyFields = structuredFields.filter((field) =>
    readyFingerprints.has(field.fieldFingerprint),
  );
  const readyRecords = new Set(
    readyFields.map((field) => field.structuredRecord?.recordIndex),
  ).size;

  return {
    profileRecords,
    detectedRecords,
    readyRecords,
    readyFields: readyFields.length,
    unresolvedFields: structuredFields.length - readyFields.length,
  };
}

export function analyzeFieldContexts(
  fields: FieldContext[],
  profile: BaseProfile,
  corrections: FieldCorrection[] = [],
): PageAnalysis {
  const analysis = fields.map((context) => ({
    context,
    match: matchFieldWithCorrections(
      context,
      corrections,
      profile.customAnswers,
    ),
  }));
  const plan = prepareFillPlan(analysis, profile);
  const experience = structuredCoverage(
    'experience',
    profile.professional.experiences.length,
    fields,
    plan,
  );
  const education = structuredCoverage(
    'education',
    profile.professional.education.length,
    fields,
    plan,
  );
  const hasStructuredCoverage =
    experience.profileRecords > 0 ||
    experience.detectedRecords > 0 ||
    education.profileRecords > 0 ||
    education.detectedRecords > 0;

  return {
    plan,
    summary: {
      ready: plan.ready.length,
      needsReview: plan.needsReview.length,
      sensitive: plan.sensitive.length,
      unknown: plan.unknown.length,
      total: fields.length,
      ...(hasStructuredCoverage
        ? {
            structured: {
              experience,
              education,
            },
          }
        : {}),
    },
  };
}