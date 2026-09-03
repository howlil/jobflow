import type {
  EducationRecordField,
  ExperienceRecordField,
  FieldContext,
  StructuredRecordContext,
} from '../../domain/forms/field-context';
import type { CanonicalField } from '../../domain/matching/canonical-fields';
import type { CorrectionAwareMatchResult } from '../../domain/matching/match-field-with-corrections';
import type { SensitiveCanonicalField } from '../../domain/matching/sensitive-fields';
import type { BaseProfile } from '../../domain/profile/profile-schema';

export type FillValue = string | boolean | string[];
export type StructuredFillInstructionField =
  | `professional.experiences.${number}.${ExperienceRecordField}`
  | `professional.education.${number}.${EducationRecordField}`;
export type FillInstructionField =
  | CanonicalField
  | SensitiveCanonicalField
  | StructuredFillInstructionField
  | `customAnswer:${string}`;

export type FillInstruction = {
  fieldFingerprint: string;
  field: FillInstructionField;
  value: FillValue;
  controlKind: FieldContext['controlKind'];
};

export type FillExecutionStatus = 'filled' | 'not-found' | 'unsupported';

export type FillExecutionResult = {
  fieldFingerprint: string;
  status: FillExecutionStatus;
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
    case 'contact.address.line1':
      return profile.contact.address.line1;
    case 'contact.address.line2':
      return profile.contact.address.line2;
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
    case 'professional.summary':
      return profile.professional.summary;
    case 'jobPreferences.willingToRelocate':
      return profile.jobPreferences.willingToRelocate;
    case 'jobPreferences.willingToTravel':
      return profile.jobPreferences.willingToTravel;
    case 'jobPreferences.availabilityDate':
      return profile.jobPreferences.availabilityDate;
    case 'jobPreferences.noticePeriod':
      return profile.jobPreferences.noticePeriod;
  }
}

function structuredProfileValue(
  profile: BaseProfile,
  context: StructuredRecordContext,
): FillValue | null {
  if (context.kind === 'experience') {
    const record = profile.professional.experiences[context.recordIndex];
    if (record === undefined) return null;
    switch (context.field) {
      case 'company':
        return record.company;
      case 'title':
        return record.title;
      case 'employmentType':
        return record.employmentType;
      case 'location':
        return record.location;
      case 'startDate':
        return record.startDate;
      case 'endDate':
        return record.endDate;
      case 'current':
        return record.current;
      case 'description':
        return record.description;
    }
  } else {
    const record = profile.professional.education[context.recordIndex];
    if (record === undefined) return null;
    switch (context.field) {
      case 'institution':
        return record.institution;
      case 'degree':
        return record.degree;
      case 'fieldOfStudy':
        return record.fieldOfStudy;
      case 'location':
        return record.location;
      case 'startDate':
        return record.startDate;
      case 'endDate':
        return record.endDate;
      case 'gpa':
        return record.gpa === null ? null : String(record.gpa);
      case 'maxGpa':
        return record.maxGpa === null ? null : String(record.maxGpa);
      case 'description':
        return record.description;
    }
  }

  return null;
}

function structuredInstructionField(
  context: StructuredRecordContext,
): StructuredFillInstructionField {
  return context.kind === 'experience'
    ? `professional.experiences.${context.recordIndex}.${context.field}`
    : `professional.education.${context.recordIndex}.${context.field}`;
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
    if (item.context.structuredRecord !== undefined) {
      const value = structuredProfileValue(profile, item.context.structuredRecord);
      if (!hasFillValue(value)) {
        plan.unknown.push(item);
        continue;
      }
      plan.ready.push({
        fieldFingerprint: item.context.fieldFingerprint,
        field: structuredInstructionField(item.context.structuredRecord),
        value,
        controlKind: item.context.controlKind,
      });
      continue;
    }

    if (
      item.match.status === 'review' ||
      item.match.status === 'review-answer'
    ) {
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

    if (item.match.status === 'ready-answer') {
      const answerId = item.match.answerId;
      const answer = profile.customAnswers.find(
        (candidate) => candidate.id === answerId,
      );
      if (answer === undefined || answer.answer.trim().length === 0) {
        plan.unknown.push(item);
        continue;
      }
      plan.ready.push({
        fieldFingerprint: item.context.fieldFingerprint,
        field: `customAnswer:${answer.id}`,
        value: answer.answer,
        controlKind: item.context.controlKind,
      });
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