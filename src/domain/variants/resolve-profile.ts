import type {
  ApplicationVariant,
  BaseProfile,
} from '../profile/profile-schema';
import { normalizeFieldText } from '../matching/normalize-field-text';

function reusableAnswerKey(
  answer: BaseProfile['customAnswers'][number],
): string {
  const intent = answer.canonicalIntent.trim().toLocaleLowerCase();
  if (intent.length > 0) return `intent:${intent}`;
  return `question:${normalizeFieldText(answer.question)}`;
}

function resolveCustomAnswers(
  base: BaseProfile['customAnswers'],
  overrides: NonNullable<ApplicationVariant['customAnswers']>,
): BaseProfile['customAnswers'] {
  const resolved = base.map((answer) => structuredClone(answer));

  for (const override of overrides) {
    const key = reusableAnswerKey(override);
    const index = resolved.findIndex(
      (candidate) => reusableAnswerKey(candidate) === key,
    );
    if (index >= 0) {
      resolved[index] = structuredClone(override);
    } else {
      resolved.push(structuredClone(override));
    }
  }

  return resolved;
}

export function resolveApplicationProfile(
  baseProfile: BaseProfile,
  variant?: ApplicationVariant,
): BaseProfile {
  const resolved = structuredClone(baseProfile);

  if (variant === undefined) {
    return resolved;
  }

  if (variant.headlineOverride !== undefined) {
    resolved.professional.headline = variant.headlineOverride;
  }

  if (variant.summaryOverride !== undefined) {
    resolved.professional.summary = variant.summaryOverride;
  }

  if (variant.targetRoles.length > 0) {
    resolved.jobPreferences.desiredRoles = [...variant.targetRoles];
  }

  if (variant.preferredLocations !== undefined) {
    resolved.jobPreferences.preferredLocations = [
      ...variant.preferredLocations,
    ];
  }

  if (variant.workArrangements !== undefined) {
    resolved.jobPreferences.workArrangements = [...variant.workArrangements];
  }

  if (variant.customAnswers !== undefined) {
    resolved.customAnswers = resolveCustomAnswers(
      resolved.customAnswers,
      variant.customAnswers,
    );
  }

  return resolved;
}
