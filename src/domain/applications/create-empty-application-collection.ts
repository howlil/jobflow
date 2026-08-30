import type { StoredApplicationCollection } from './application-schema';

export function createEmptyApplicationCollection(
  now = new Date().toISOString(),
): StoredApplicationCollection {
  return {
    schemaVersion: 2,
    applications: [],
    metadata: {
      createdAt: now,
      updatedAt: now,
    },
  };
}
