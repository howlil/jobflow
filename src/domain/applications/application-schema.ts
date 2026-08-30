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

export const ApplicationStageSchema = z.enum(APPLICATION_STAGES);

export const JobApplicationSchema = z
  .object({
    id: EntityIdSchema,
    company: z.string().trim().min(1),
    role: z.string().trim().min(1),
    jobUrl: z.string().trim().url().optional(),
    stage: ApplicationStageSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .strict();

export const StoredApplicationCollectionSchema = z
  .object({
    schemaVersion: z.literal(1),
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
export type JobApplication = z.infer<typeof JobApplicationSchema>;
export type StoredApplicationCollection = z.infer<
  typeof StoredApplicationCollectionSchema
>;
