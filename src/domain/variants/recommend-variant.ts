import type {
  ApplicationVariant,
  BaseProfile,
} from '../profile/profile-schema';
import { extractJobContext, normalizeJobText } from './job-context';

export type VariantRecommendation = {
  variantId: string | null;
  score: number;
  evidence: string[];
};

function normalize(value: string): string[] {
  return normalizeJobText(value)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function variantKeywords(variant: ApplicationVariant): string[] {
  return unique(
    [variant.name, ...variant.targetRoles]
      .flatMap(normalize)
      .filter((token) => token.length > 0),
  );
}

function profileSkillNameById(baseProfile: BaseProfile | undefined) {
  return new Map(
    (baseProfile?.professional.skills ?? []).map((skill) => [
      skill.id,
      skill.name,
    ]),
  );
}

export function recommendApplicationVariant(
  variants: ApplicationVariant[],
  pageSignals: string[],
  defaultVariantId: string | null,
  baseProfile?: BaseProfile,
): VariantRecommendation {
  if (variants.length === 0) {
    return { variantId: null, score: 0, evidence: [] };
  }

  const skillNameById = profileSkillNameById(baseProfile);
  const candidateSkills = [...skillNameById.values()];
  const pageContext = extractJobContext(pageSignals, candidateSkills);
  const signalTokens = new Set(pageContext.tokens);
  const pageSkills = new Set(pageContext.skills);
  const pageDomains = new Set(pageContext.domains);

  const scored = variants.map((variant) => {
    const evidence: string[] = [];
    let score = 0;

    for (const keyword of variantKeywords(variant)) {
      if (!signalTokens.has(keyword)) continue;
      score += 5;
      evidence.push(keyword);
    }

    for (const skillId of variant.emphasizedSkillIds ?? []) {
      const skillName = skillNameById.get(skillId);
      if (skillName === undefined) continue;
      const normalizedSkill = normalizeJobText(skillName);
      if (normalizedSkill !== '' && pageSkills.has(normalizedSkill)) {
        score += 4;
        evidence.push(`skill:${normalizedSkill}`);
      }
    }

    const variantContext = extractJobContext([
      variant.name,
      ...variant.targetRoles,
    ]);
    if (
      variantContext.seniority !== null &&
      variantContext.seniority === pageContext.seniority
    ) {
      score += 3;
      evidence.push(`seniority:${variantContext.seniority}`);
    }

    for (const domain of variantContext.domains) {
      if (!pageDomains.has(domain)) continue;
      score += 2;
      evidence.push(`domain:${domain}`);
    }

    return {
      variantId: variant.id,
      score,
      evidence: unique(evidence),
    };
  });

  scored.sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    if (left.variantId === defaultVariantId) return -1;
    if (right.variantId === defaultVariantId) return 1;
    return left.variantId.localeCompare(right.variantId);
  });

  const best = scored[0];
  if (best === undefined || best.score === 0) {
    return {
      variantId: variants.some((variant) => variant.id === defaultVariantId)
        ? defaultVariantId
        : (variants[0]?.id ?? null),
      score: 0,
      evidence: [],
    };
  }

  return best;
}
