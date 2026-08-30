import {
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

export function parseStoredApplicationCollection(
  raw: unknown,
): StoredApplicationCollection {
  const schemaVersion = readSchemaVersion(raw);

  if (typeof schemaVersion === 'number' && schemaVersion !== 1) {
    throw new UnsupportedApplicationSchemaVersionError(schemaVersion);
  }

  return StoredApplicationCollectionSchema.parse(raw);
}
