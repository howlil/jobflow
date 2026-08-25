import type { ApplicationVariant } from '../profile/profile-schema';

export type VariantRecommendation = {
  variantId: string | null;
  score: number;
  evidence: string[];
};

function normalize(value: string): string[] {
  return value
    .toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9+#.]+/g, ' ')
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

export function recommendApplicationVariant(
  variants: ApplicationVariant[],
  pageSignals: string[],
  defaultVariantId: string | null,
): VariantRecommendation {
  if (variants.length === 0) {
    return { variantId: null, score: 0, evidence: [] };
  }

  const signalTokens = new Set(pageSignals.flatMap(normalize));
  const scored = variants.map((variant) => {
    const keywords = variantKeywords(variant);
    const evidence = keywords.filter((keyword) => signalTokens.has(keyword));
    const score = keywords.length === 0 ? 0 : evidence.length / keywords.length;
    return { variantId: variant.id, score, evidence };
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
