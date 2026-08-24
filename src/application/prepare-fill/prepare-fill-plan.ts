import type { FieldContext } from '../../domain/forms/field-context';
import type { CorrectionAwareMatchResult } from '../../domain/matching/match-field-with-corrections';
import type { CanonicalField } from '../../domain/matching/match-field';
import type { SensitiveCanonicalField } from '../../domain/matching/sensitive-fields';
import type { BaseProfile } from '../../domain/profile/profile-schema';

export type FillValue = string | boolean | string[];

export type FillInstruction = {
  fieldFingerprint: string;
  field: CanonicalField | SensitiveCanonicalField;
  value: FillValue;
  controlKind: FieldContext['controlKind'];
};

export type FillAnalysis = {
  context: FieldContext;
  match: CorrectionAwareMatchResult;
};

export type FillPlan = {
  ready: FillInstruction[];
  needsReview: FillAnalysis[];
  sensitive: FillAnalysis[];
  unknown: FillAnalysis[];
};

function primaryValue(
  items: Array<{ value: string; primary: boolean }>,
): string | null {
  return items.find((item) => item.primary)?.value ?? items[0]?.value ?? null;
}

function profileValue(
  profile: BaseProfile,
  field: CanonicalField,
): FillValue | null {
  switch (field) {
    case 'personal.legalName.first':
      return profile.personal.legalName.first;
    case 'personal.legalName.middle':
      return profile.personal.legalName.middle;
    case 'personal.legalName.last':
      return profile.personal.legalName.last;
    case 'personal.preferredName':
      return profile.personal.preferredName;
    case 'contact.email.primary':
      return primaryValue(profile.contact.emails);
    case 'contact.phone.primary':
      return primaryValue(profile.contact.phones);
    case 'contact.whatsapp':
      return profile.contact.whatsapp;
    case 'contact.address.city':
      return profile.contact.address.city;
    case 'contact.address.state':
      return profile.contact.address.state;
    case 'contact.address.country':
      return profile.contact.address.country;
    case 'contact.address.postalCode':
      return profile.contact.address.postalCode;
    case 'links.linkedin':
      return profile.links.linkedin;
    case 'links.github':
      return profile.links.github;
    case 'links.portfolio':
      return profile.links.portfolio;
    case 'professional.headline':
      return profile.professional.headline;
    case 'jobPreferences.willingToRelocate':
      return profile.jobPreferences.willingToRelocate;
    case 'jobPreferences.willingToTravel':
      return profile.jobPreferences.willingToTravel;
    case 'jobPreferences.availabilityDate':
      return profile.jobPreferences.availabilityDate;
  }
}

function hasFillValue(value: FillValue | null): value is FillValue {
  if (value === null) return false;
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') return value.trim().length > 0;
  return value.some((item) => item.trim().length > 0);
}

export function prepareFillPlan(
  analysis: FillAnalysis[],
  profile: BaseProfile,
): FillPlan {
  const plan: FillPlan = {
    ready: [],
    needsReview: [],
    sensitive: [],
    unknown: [],
  };

  for (const item of analysis) {
    if (item.match.status === 'review') {
      plan.needsReview.push(item);
      continue;
    }

    if (item.match.status === 'unknown') {
      plan.unknown.push(item);
      continue;
    }

    if (item.match.status === 'sensitive') {
      plan.sensitive.push(item);
      continue;
    }

    const value = profileValue(profile, item.match.field);
    if (!hasFillValue(value)) {
      plan.unknown.push(item);
      continue;
    }

    plan.ready.push({
      fieldFingerprint: item.context.fieldFingerprint,
      field: item.match.field,
      value,
      controlKind: item.context.controlKind,
    });
  }

  return plan;
}
