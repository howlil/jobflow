import { z } from 'zod';

const EntityIdSchema = z.string().min(1);

export const APPLICATION_STAGES = [
  'saved',
  'applying',
  'applied',
  'interview',
  'offer',
  'closed',
] as const;

export const APPLICATION_SUBSTAGES = [
  'preparing_application',
  'ready_to_apply',
  'submitted',
  'recruiter_review',
  'hiring_manager_review',
  'assessment',
  'recruiter_screen',
  'technical_interview',
  'system_design',
  'behavioral_interview',
  'final_interview',
  'offer_received',
  'offer_negotiation',
  'accepted',
  'rejected',
  'withdrawn',
] as const;

export const APPLICATION_SUBSTAGES_BY_STAGE = {
  saved: [],
  applying: ['preparing_application', 'ready_to_apply'],
  applied: [
    'submitted',
    'recruiter_review',
    'hiring_manager_review',
    'assessment',
  ],
  interview: [
    'recruiter_screen',
    'technical_interview',
    'system_design',
    'behavioral_interview',
    'final_interview',
  ],
  offer: ['offer_received', 'offer_negotiation'],
  closed: ['accepted', 'rejected', 'withdrawn'],
} as const satisfies Record<
  (typeof APPLICATION_STAGES)[number],
  readonly (typeof APPLICATION_SUBSTAGES)[number][]
>;

export const APPLICATION_PRIORITIES = ['p0', 'p1', 'p2', 'p3'] as const;

export const ApplicationStageSchema = z.enum(APPLICATION_STAGES);
export const ApplicationSubstageSchema = z.enum(APPLICATION_SUBSTAGES);
export const ApplicationPrioritySchema = z.enum(APPLICATION_PRIORITIES);

export const ApplicationStageHistoryEntrySchema = z
  .object({
    stage: ApplicationStageSchema,
    substage: ApplicationSubstageSchema.optional(),
    enteredAt: z.string(),
  })
  .strict();

export const JobApplicationSchema = z
  .object({
    id: EntityIdSchema,
    company: z.string().trim().min(1),
    role: z.string().trim().min(1),
    jobUrl: z.string().trim().url().optional(),
    stage: ApplicationStageSchema,
    substage: ApplicationSubstageSchema.optional(),
    stageHistory: z.array(ApplicationStageHistoryEntrySchema),
    priority: ApplicationPrioritySchema.optional(),
    notes: z.string().trim().optional(),
    source: z.string().trim().optional(),
    contactName: z.string().trim().optional(),
    contactEmail: z.string().trim().email().optional(),
    nextAction: z.string().trim().optional(),
    nextActionAt: z.string().trim().optional(),
    deadline: z.string().trim().optional(),
    appliedAt: z.string().trim().optional(),
    interviewAt: z.string().trim().optional(),
    offerAt: z.string().trim().optional(),
    closedAt: z.string().trim().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .strict();

export const StoredApplicationCollectionSchema = z
  .object({
    schemaVersion: z.literal(3),
    applications: z.array(JobApplicationSchema),
    metadata: z
      .object({
        createdAt: z.string(),
        updatedAt: z.string(),
      })
      .strict(),
  })
  .strict();

export type ApplicationStage = z.infer<typeof ApplicationStageSchema>;
export type ApplicationSubstage = z.infer<typeof ApplicationSubstageSchema>;
export type ApplicationPriority = z.infer<typeof ApplicationPrioritySchema>;
export type ApplicationStageHistoryEntry = z.infer<
  typeof ApplicationStageHistoryEntrySchema
>;
export type JobApplication = z.infer<typeof JobApplicationSchema>;
export type StoredApplicationCollection = z.infer<
  typeof StoredApplicationCollectionSchema
>;

export function applicationSubstageMatchesStage(
  stage: ApplicationStage,
  substage: ApplicationSubstage | undefined,
): boolean {
  if (substage === undefined) return stage !== 'closed';
  return APPLICATION_SUBSTAGES_BY_STAGE[stage].some(
    (candidate) => candidate === substage,
  );
}
