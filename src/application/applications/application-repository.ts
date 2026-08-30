import type { StoredApplicationCollection } from '../../domain/applications/application-schema';

export type ApplicationRepository = {
  load(): Promise<StoredApplicationCollection | null>;
  save(collection: StoredApplicationCollection): Promise<void>;
};
