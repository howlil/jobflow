import { z } from 'zod';

const EntityIdSchema = z.string().min(1);

export const APPLICATION_STAGES = [
  'saved',
  'applied',
  'assessment',
  'interview',
  'offer',
  'accepted',
  'rejected',
  'withdrawn',
] as const;

export const APPLICATION_PRIORITIES = ['p0', 'p1', 'p2', 'p3'] as const;

export const ApplicationStageSchema = z.enum(APPLICATION_STAGES);
export const ApplicationPrioritySchema = z.enum(APPLICATION_PRIORITIES);

export const JobApplicationSchema = z
  .object({
    id: EntityIdSchema,
    company: z.string().trim().min(1),
    role: z.string().trim().min(1),
    jobUrl: z.string().trim().url().optional(),
    stage: ApplicationStageSchema,
    priority: ApplicationPrioritySchema.optional(),
    notes: z.string().trim().optional(),
    source: z.string().trim().optional(),
    contactName: z.string().trim().optional(),
    contactEmail: z.string().trim().email().optional(),
    nextAction: z.string().trim().optional(),
    nextActionAt: z.string().trim().optional(),
    deadline: z.string().trim().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .strict();

export const StoredApplicationCollectionSchema = z
  .object({
    schemaVersion: z.literal(2),
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
export type ApplicationPriority = z.infer<typeof ApplicationPrioritySchema>;
export type JobApplication = z.infer<typeof JobApplicationSchema>;
export type StoredApplicationCollection = z.infer<
  typeof StoredApplicationCollectionSchema
>;
