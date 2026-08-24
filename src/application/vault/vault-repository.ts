import type { StoredVaultEnvelope } from '../../domain/vault/vault-envelope';

export interface VaultRepository {
  load(): Promise<StoredVaultEnvelope | null>;
  save(envelope: StoredVaultEnvelope): Promise<void>;
  delete(): Promise<void>;
}
