import { z } from 'zod';

import {
  StoredApplicationCollectionSchema,
  type ApplicationStage,
  type ApplicationSubstage,
  type StoredApplicationCollection,
} from './application-schema';

export class UnsupportedApplicationSchemaVersionError extends Error {
  constructor(readonly schemaVersion: number) {
    super(`Unsupported application schema version: ${schemaVersion}`);
    this.name = 'UnsupportedApplicationSchemaVersionError';
  }
}

function readSchemaVersion(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) {
    return undefined;
  }

  return Reflect.get(raw, 'schemaVersion');
}

const LegacyApplicationStageSchema = z.enum([
  'saved',
  'applied',
  'assessment',
  'interview',
  'offer',
  'accepted',
  'rejected',
  'withdrawn',
]);

type LegacyApplicationStage = z.infer<typeof LegacyApplicationStageSchema>;

const LegacyApplicationBaseSchema = z
  .object({
    id: z.string().min(1),
    company: z.string().trim().min(1),
    role: z.string().trim().min(1),
    jobUrl: z.string().trim().url().optional(),
    stage: LegacyApplicationStageSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .strict();

const StoredApplicationCollectionV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    applications: z.array(LegacyApplicationBaseSchema),
    metadata: z
      .object({
        createdAt: z.string(),
        updatedAt: z.string(),
      })
      .strict(),
  })
  .strict();

const StoredApplicationCollectionV2Schema = z
  .object({
    schemaVersion: z.literal(2),
    applications: z.array(
      LegacyApplicationBaseSchema.extend({
        priority: z.enum(['p0', 'p1', 'p2', 'p3']).optional(),
        notes: z.string().trim().optional(),
        source: z.string().trim().optional(),
        contactName: z.string().trim().optional(),
        contactEmail: z.string().trim().email().optional(),
        nextAction: z.string().trim().optional(),
        nextActionAt: z.string().trim().optional(),
        deadline: z.string().trim().optional(),
      }).strict(),
    ),
    metadata: z
      .object({
        createdAt: z.string(),
        updatedAt: z.string(),
      })
      .strict(),
  })
  .strict();

function lifecycleFromLegacyStage(stage: LegacyApplicationStage): {
  stage: ApplicationStage;
  substage?: ApplicationSubstage;
} {
  switch (stage) {
    case 'saved':
      return { stage: 'saved' };
    case 'applied':
      return { stage: 'applied', substage: 'submitted' };
    case 'assessment':
      return { stage: 'applied', substage: 'assessment' };
    case 'interview':
      return { stage: 'interview' };
    case 'offer':
      return { stage: 'offer', substage: 'offer_received' };
    case 'accepted':
      return { stage: 'closed', substage: 'accepted' };
    case 'rejected':
      return { stage: 'closed', substage: 'rejected' };
    case 'withdrawn':
      return { stage: 'closed', substage: 'withdrawn' };
  }
}

function migrateLegacyApplications(
  applications: Array<
    z.infer<typeof LegacyApplicationBaseSchema> & Record<string, unknown>
  >,
) {
  return applications.map((application) => {
    const lifecycle = lifecycleFromLegacyStage(application.stage);
    return {
      ...application,
      stage: lifecycle.stage,
      ...(lifecycle.substage === undefined
        ? {}
        : { substage: lifecycle.substage }),
      stageHistory: [
        {
          stage: lifecycle.stage,
          ...(lifecycle.substage === undefined
            ? {}
            : { substage: lifecycle.substage }),
          enteredAt: application.updatedAt,
        },
      ],
    };
  });
}

function migrateV1(raw: unknown): StoredApplicationCollection {
  const collection = StoredApplicationCollectionV1Schema.parse(raw);
  return StoredApplicationCollectionSchema.parse({
    ...collection,
    schemaVersion: 3,
    applications: migrateLegacyApplications(collection.applications),
  });
}

function migrateV2(raw: unknown): StoredApplicationCollection {
  const collection = StoredApplicationCollectionV2Schema.parse(raw);
  return StoredApplicationCollectionSchema.parse({
    ...collection,
    schemaVersion: 3,
    applications: migrateLegacyApplications(collection.applications),
  });
}

export function parseStoredApplicationCollection(
  raw: unknown,
): StoredApplicationCollection {
  const schemaVersion = readSchemaVersion(raw);

  if (schemaVersion === 1) {
    return migrateV1(raw);
  }

  if (schemaVersion === 2) {
    return migrateV2(raw);
  }

  if (typeof schemaVersion === 'number' && schemaVersion !== 3) {
    throw new UnsupportedApplicationSchemaVersionError(schemaVersion);
  }

  return StoredApplicationCollectionSchema.parse(raw);
}
