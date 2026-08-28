import type { SensitiveProfile } from '../../domain/profile/profile-schema';
import type { StoredVaultEnvelope } from '../../domain/vault/vault-envelope';
import type { VaultRepository } from './vault-repository';
import {
  type SensitiveFieldPath,
  type SensitiveFieldValue,
  type VaultMessage,
  type VaultResponse,
  parseVaultMessage,
} from './vault-messages';
import { VaultLockedError, type VaultSession } from './vault-session';

type VaultCrypto = {
  createEncryptedVault(
    profile: SensitiveProfile,
    passphrase: string,
  ): Promise<{ envelope: StoredVaultEnvelope; key: CryptoKey }>;
  unlockVaultKey(
    envelope: StoredVaultEnvelope,
    passphrase: string,
  ): Promise<CryptoKey>;
  decryptSensitiveProfile(
    envelope: StoredVaultEnvelope,
    key: CryptoKey,
  ): Promise<SensitiveProfile>;
  reencryptSensitiveProfile(
    profile: SensitiveProfile,
    envelope: StoredVaultEnvelope,
    key: CryptoKey,
  ): Promise<StoredVaultEnvelope>;
};

export type VaultBrokerDependencies = {
  repository: VaultRepository;
  session: VaultSession<CryptoKey>;
  crypto: VaultCrypto;
};

export function createVaultBroker({
  repository,
  session,
  crypto,
}: VaultBrokerDependencies) {
  async function status(configured?: boolean): Promise<VaultResponse> {
    const isConfigured = configured ?? (await repository.load()) !== null;
    return {
      ok: true,
      status: {
        configured: isConfigured,
        ...session.status(),
      },
    };
  }

  function requireSessionKey(): CryptoKey | VaultResponse {
    try {
      return session.requireKey();
    } catch (error) {
      if (error instanceof VaultLockedError) {
        return { ok: false, error: 'locked' };
      }
      throw error;
    }
  }

  async function loadConfiguredEnvelope(): Promise<
    StoredVaultEnvelope | VaultResponse
  > {
    const envelope = await repository.load();
    return envelope ?? { ok: false, error: 'not-configured' };
  }

  async function handleParsed(message: VaultMessage): Promise<VaultResponse> {
    if (message.type === 'jobflow:vault/status') {
      return status();
    }

    if (message.type === 'jobflow:vault/setup') {
      const { envelope, key } = await crypto.createEncryptedVault(
        message.profile,
        message.passphrase,
      );
      await repository.save(envelope);
      session.unlock(key);
      return status(true);
    }

    if (message.type === 'jobflow:vault/unlock') {
      const envelope = await loadConfiguredEnvelope();
      if ('ok' in envelope) return envelope;

      try {
        session.unlock(
          await crypto.unlockVaultKey(envelope, message.passphrase),
        );
      } catch (error) {
        if (isVaultUnlockError(error)) {
          session.lock();
          return { ok: false, error: 'invalid-passphrase' };
        }
        throw error;
      }
      return status(true);
    }

    if (message.type === 'jobflow:vault/lock') {
      session.lock();
      return status();
    }

    if (message.type === 'jobflow:vault/reset') {
      await repository.delete();
      session.lock();
      return status(false);
    }

    const envelope = await loadConfiguredEnvelope();
    if ('ok' in envelope) return envelope;

    const key = requireSessionKey();
    if ('ok' in key) return key;

    if (message.type === 'jobflow:vault/load-profile') {
      return {
        ok: true,
        profile: await crypto.decryptSensitiveProfile(envelope, key),
      };
    }

    if (message.type === 'jobflow:vault/save-profile') {
      await repository.save(
        await crypto.reencryptSensitiveProfile(message.profile, envelope, key),
      );
      return status(true);
    }

    const profile = await crypto.decryptSensitiveProfile(envelope, key);
    return {
      ok: true,
      values: readSensitiveValues(profile, message.fields),
    };
  }

  return {
    async handle(rawMessage: unknown): Promise<VaultResponse> {
      const message = parseVaultMessage(rawMessage);
      if ('ok' in message) return message;

      try {
        return await handleParsed(message);
      } catch (error) {
        if (error instanceof VaultLockedError) {
          return { ok: false, error: 'locked' };
        }
        if (isVaultUnlockError(error)) {
          return { ok: false, error: 'invalid-passphrase' };
        }
        return { ok: false, error: 'vault-error' };
      }
    },
  };
}

function isVaultUnlockError(error: unknown): boolean {
  return error instanceof Error && error.name === 'VaultUnlockError';
}

function readSensitiveValues(
  profile: SensitiveProfile,
  fields: SensitiveFieldPath[],
): Partial<Record<SensitiveFieldPath, SensitiveFieldValue>> {
  const values: Partial<Record<SensitiveFieldPath, SensitiveFieldValue>> = {};
  for (const field of fields) {
    values[field] = readSensitiveValue(profile, field);
  }
  return values;
}

function readSensitiveValue(
  profile: SensitiveProfile,
  field: SensitiveFieldPath,
): SensitiveFieldValue {
  switch (field) {
    case 'personal.gender':
      return profile.personal.gender;
    case 'personal.birthPlace':
      return profile.personal.birthPlace;
    case 'personal.birthDate':
      return profile.personal.birthDate;
    case 'personal.nationality':
      return profile.personal.nationality;
    case 'personal.maritalStatus':
      return profile.personal.maritalStatus;
    case 'identity.nationalId':
      return profile.identity.nationalId;
    case 'identity.passport':
      return profile.identity.passport;
    case 'identity.taxId':
      return profile.identity.taxId;
    case 'compensation.current.amount':
      return profile.compensation.current.amount;
    case 'compensation.current.currency':
      return profile.compensation.current.currency;
    case 'compensation.current.payPeriod':
      return profile.compensation.current.payPeriod;
    case 'compensation.expected.amount':
      return profile.compensation.expected.amount;
    case 'compensation.expected.currency':
      return profile.compensation.expected.currency;
    case 'compensation.expected.payPeriod':
      return profile.compensation.expected.payPeriod;
    case 'compensation.negotiable':
      return profile.compensation.negotiable;
    case 'workEligibility.visaStatus':
      return profile.workEligibility.visaStatus;
    case 'workEligibility.sponsorshipRequired':
      return profile.workEligibility.sponsorshipRequired;
  }
}
