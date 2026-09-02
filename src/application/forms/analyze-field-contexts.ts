import type { FieldCorrection } from '../../domain/corrections/correction-schema';
import type { FieldContext } from '../../domain/forms/field-context';
import { matchFieldWithCorrections } from '../../domain/matching/match-field-with-corrections';
import type { BaseProfile } from '../../domain/profile/profile-schema';
import {
  prepareFillPlan,
  type FillPlan,
} from '../prepare-fill/prepare-fill-plan';

export type PageAnalysisSummary = {
  ready: number;
  needsReview: number;
  sensitive: number;
  unknown: number;
  total: number;
};

export type PageAnalysis = {
  plan: FillPlan;
  summary: PageAnalysisSummary;
};

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

  return {
    plan,
    summary: {
      ready: plan.ready.length,
      needsReview: plan.needsReview.length,
      sensitive: plan.sensitive.length,
      unknown: plan.unknown.length,
      total: fields.length,
    },
  };
}
