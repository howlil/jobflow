import { z } from 'zod';

import {
  ApplicationStageSchema,
  StoredApplicationCollectionSchema,
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

const StoredApplicationCollectionV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    applications: z.array(
      z
        .object({
          id: z.string().min(1),
          company: z.string().trim().min(1),
          role: z.string().trim().min(1),
          jobUrl: z.string().trim().url().optional(),
          stage: ApplicationStageSchema,
          createdAt: z.string(),
          updatedAt: z.string(),
        })
        .strict(),
    ),
    metadata: z
      .object({
        createdAt: z.string(),
        updatedAt: z.string(),
      })
      .strict(),
  })
  .strict();

function migrateV1(raw: unknown): StoredApplicationCollection {
  const collection = StoredApplicationCollectionV1Schema.parse(raw);
  return StoredApplicationCollectionSchema.parse({
    ...collection,
    schemaVersion: 2,
    applications: collection.applications.map((application) => ({
      ...application,
    })),
  });
}

export function parseStoredApplicationCollection(
  raw: unknown,
): StoredApplicationCollection {
  const schemaVersion = readSchemaVersion(raw);

  if (schemaVersion === 1) {
    return migrateV1(raw);
  }

  if (typeof schemaVersion === 'number' && schemaVersion !== 2) {
    throw new UnsupportedApplicationSchemaVersionError(schemaVersion);
  }

  return StoredApplicationCollectionSchema.parse(raw);
}
