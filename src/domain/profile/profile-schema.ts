import { z } from 'zod';

const EntityIdSchema = z.string().min(1);
const StringListSchema = z.array(z.string());

const NamedContactSchema = z
  .object({
    id: EntityIdSchema,
    label: z.string(),
    value: z.string(),
    primary: z.boolean(),
  })
  .strict();

const AddressSchema = z
  .object({
    line1: z.string(),
    line2: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string(),
  })
  .strict();

const WebsiteSchema = z
  .object({
    id: EntityIdSchema,
    label: z.string(),
    url: z.string(),
  })
  .strict();

const ExperienceSchema = z
  .object({
    id: EntityIdSchema,
    company: z.string(),
    title: z.string(),
    employmentType: z.string(),
    location: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    current: z.boolean(),
    description: z.string(),
    achievements: StringListSchema,
    skills: StringListSchema.optional(),
  })
  .strict();

const EducationSchema = z
  .object({
    id: EntityIdSchema,
    institution: z.string(),
    degree: z.string(),
    fieldOfStudy: z.string(),
    location: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    gpa: z.number().nullable(),
    maxGpa: z.number().nullable(),
    description: z.string(),
  })
  .strict();

const SkillSchema = z
  .object({
    id: EntityIdSchema,
    name: z.string(),
    level: z.string(),
    yearsExperience: z.number().nonnegative().nullable(),
  })
  .strict();

const LanguageSchema = z
  .object({
    id: EntityIdSchema,
    name: z.string(),
    proficiency: z.string(),
  })
  .strict();

const CertificationSchema = z
  .object({
    id: EntityIdSchema,
    name: z.string(),
    issuer: z.string(),
    issueDate: z.string(),
    expiryDate: z.string(),
    credentialId: z.string(),
    url: z.string(),
  })
  .strict();

const ProjectSchema = z
  .object({
    id: EntityIdSchema,
    name: z.string(),
    role: z.string(),
    description: z.string(),
    url: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    skills: StringListSchema,
  })
  .strict();

const AwardSchema = z
  .object({
    id: EntityIdSchema,
    title: z.string(),
    issuer: z.string(),
    date: z.string(),
    description: z.string(),
  })
  .strict();

const OrganizationSchema = z
  .object({
    id: EntityIdSchema,
    name: z.string(),
    role: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    description: z.string(),
  })
  .strict();

const PublicationSchema = z
  .object({
    id: EntityIdSchema,
    title: z.string(),
    publisher: z.string(),
    date: z.string(),
    url: z.string(),
    description: z.string(),
  })
  .strict();

export const DocumentMetadataSchema = z
  .object({
    id: EntityIdSchema,
    label: z.string(),
    fileName: z.string(),
    mimeType: z.string(),
    lastKnownModified: z.number().nonnegative().nullable(),
  })
  .strict();

const CustomAnswerSchema = z
  .object({
    id: EntityIdSchema,
    question: z.string(),
    answer: z.string(),
    canonicalIntent: z.string(),
    tags: StringListSchema,
  })
  .strict();

export const BaseProfileSchema = z
  .object({
    personal: z
      .object({
        legalName: z
          .object({
            first: z.string(),
            middle: z.string(),
            last: z.string(),
          })
          .strict(),
        preferredName: z.string(),
      })
      .strict(),
    contact: z
      .object({
        emails: z.array(NamedContactSchema),
        phones: z.array(NamedContactSchema),
        whatsapp: z.string(),
        address: AddressSchema,
      })
      .strict(),
    links: z
      .object({
        linkedin: z.string(),
        github: z.string(),
        portfolio: z.string(),
        websites: z.array(WebsiteSchema),
        otherProfiles: z.array(WebsiteSchema),
      })
      .strict(),
    professional: z
      .object({
        headline: z.string(),
        summary: z.string(),
        experiences: z.array(ExperienceSchema),
        education: z.array(EducationSchema),
        skills: z.array(SkillSchema),
        languages: z.array(LanguageSchema),
        certifications: z.array(CertificationSchema),
        projects: z.array(ProjectSchema),
        awards: z.array(AwardSchema),
        organizations: z.array(OrganizationSchema),
        volunteering: z.array(OrganizationSchema),
        publications: z.array(PublicationSchema),
      })
      .strict(),
    jobPreferences: z
      .object({
        desiredRoles: StringListSchema,
        employmentTypes: StringListSchema,
        workArrangements: StringListSchema,
        preferredLocations: StringListSchema,
        willingToRelocate: z.boolean().nullable(),
        willingToTravel: z.boolean().nullable(),
        availabilityDate: z.string(),
        noticePeriod: z.string(),
      })
      .strict(),
    documents: z
      .object({
        resumes: z.array(DocumentMetadataSchema),
        coverLetters: z.array(DocumentMetadataSchema),
        transcripts: z.array(DocumentMetadataSchema),
        certificates: z.array(DocumentMetadataSchema),
        photo: DocumentMetadataSchema.nullable(),
        other: z.array(DocumentMetadataSchema),
      })
      .strict(),
    customAnswers: z.array(CustomAnswerSchema),
  })
  .strict();

export const ApplicationVariantSchema = z
  .object({
    id: EntityIdSchema,
    name: z.string(),
    targetRoles: StringListSchema,
    headlineOverride: z.string().optional(),
    summaryOverride: z.string().optional(),
    emphasizedSkillIds: StringListSchema.optional(),
    preferredResumeId: z.string().nullable().optional(),
    preferredCoverLetterId: z.string().nullable().optional(),
    preferredLocations: StringListSchema.optional(),
    employmentTypes: StringListSchema.optional(),
    workArrangements: StringListSchema.optional(),
    customAnswers: z.array(CustomAnswerSchema).optional(),
  })
  .strict();

export const StoredProfileEnvelopeSchema = z
  .object({
    schemaVersion: z.literal(1),
    baseProfile: BaseProfileSchema,
    variants: z.array(ApplicationVariantSchema),
    preferences: z
      .object({
        defaultVariantId: z.string().nullable(),
      })
      .strict(),
    metadata: z
      .object({
        createdAt: z.string(),
        updatedAt: z.string(),
      })
      .strict(),
  })
  .strict();

const GovernmentIdSchema = z
  .object({
    id: EntityIdSchema,
    type: z.string(),
    value: z.string(),
    country: z.string(),
  })
  .strict();

const CompensationValueSchema = z
  .object({
    amount: z.number().nonnegative().nullable(),
    currency: z.string(),
    payPeriod: z.string(),
  })
  .strict();

const ReferenceSchema = z
  .object({
    id: EntityIdSchema,
    name: z.string(),
    company: z.string(),
    title: z.string(),
    relationship: z.string(),
    email: z.string(),
    phone: z.string(),
  })
  .strict();

const FamilyMemberSchema = z
  .object({
    id: EntityIdSchema,
    name: z.string(),
    relationship: z.string(),
    occupation: z.string(),
    phone: z.string(),
  })
  .strict();

const EmergencyContactSchema = z
  .object({
    name: z.string(),
    relationship: z.string(),
    email: z.string(),
    phone: z.string(),
  })
  .strict();

const DrivingLicenceSchema = z
  .object({
    id: EntityIdSchema,
    type: z.string(),
    number: z.string(),
    country: z.string(),
    expiryDate: z.string(),
  })
  .strict();

const DemographicValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

export const SensitiveProfileSchema = z
  .object({
    personal: z
      .object({
        gender: z.string(),
        birthPlace: z.string(),
        birthDate: z.string(),
        nationality: z.string(),
        maritalStatus: z.string(),
      })
      .strict(),
    identity: z
      .object({
        nationalId: z.string(),
        passport: z.string(),
        taxId: z.string(),
        otherGovernmentIds: z.array(GovernmentIdSchema),
      })
      .strict(),
    compensation: z
      .object({
        current: CompensationValueSchema,
        expected: CompensationValueSchema,
        negotiable: z.boolean(),
      })
      .strict(),
    workEligibility: z
      .object({
        citizenships: StringListSchema,
        authorizations: StringListSchema,
        visaStatus: z.string(),
        sponsorshipRequired: z.boolean().nullable(),
      })
      .strict(),
    references: z.array(ReferenceSchema),
    family: z.array(FamilyMemberSchema),
    emergencyContact: EmergencyContactSchema.nullable(),
    drivingLicences: z.array(DrivingLicenceSchema),
    physical: z
      .object({
        heightCm: z.number().nonnegative().nullable(),
        weightKg: z.number().nonnegative().nullable(),
      })
      .strict(),
    demographics: z.record(z.string(), DemographicValueSchema),
    sensitiveDocuments: z.array(DocumentMetadataSchema),
  })
  .strict();

export type BaseProfile = z.infer<typeof BaseProfileSchema>;
export type ApplicationVariant = z.infer<typeof ApplicationVariantSchema>;
export type StoredProfileEnvelope = z.infer<typeof StoredProfileEnvelopeSchema>;
export type SensitiveProfile = z.infer<typeof SensitiveProfileSchema>;
export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;
