import { useEffect, useState } from 'react';

import { createEmptySensitiveProfile } from '../../domain/profile/create-empty-sensitive-profile';
import type { SensitiveProfile } from '../../domain/profile/profile-schema';
import type { VaultResponse } from '../../application/vault/vault-messages';

export type VaultClient = {
  status(): Promise<VaultResponse>;
  setup(profile: SensitiveProfile, passphrase: string): Promise<VaultResponse>;
  unlock(passphrase: string): Promise<VaultResponse>;
  lock(): Promise<VaultResponse>;
  loadProfile(): Promise<VaultResponse>;
  saveProfile(profile: SensitiveProfile): Promise<VaultResponse>;
  reset(): Promise<VaultResponse>;
};

type VaultViewState = {
  configured: boolean;
  unlocked: boolean;
  expiresAt: number | null;
};

type SensitiveVaultSectionProps = {
  vaultClient: VaultClient;
};

function emptyState(): VaultViewState {
  return { configured: false, unlocked: false, expiresAt: null };
}

function statusFrom(response: VaultResponse): VaultViewState | null {
  return response.ok && 'status' in response ? response.status : null;
}

function profileFrom(response: VaultResponse): SensitiveProfile | null {
  return response.ok && 'profile' in response ? response.profile : null;
}

function expectedAmount(profile: SensitiveProfile): string {
  return profile.compensation.expected.amount?.toString() ?? '';
}

function numberOrNull(value: string): number | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : Number(trimmed);
}

export function SensitiveVaultSection({
  vaultClient,
}: SensitiveVaultSectionProps) {
  const [vaultStatus, setVaultStatus] = useState<VaultViewState>(emptyState);
  const [profile, setProfile] = useState<SensitiveProfile>(
    createEmptySensitiveProfile(),
  );
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    let active = true;
    void vaultClient
      .status()
      .then(async (response) => {
        if (!active) return;
        const nextStatus = statusFrom(response);
        if (nextStatus === null) {
          setError('Could not load the vault status.');
          return;
        }
        setVaultStatus(nextStatus);
        if (nextStatus.unlocked) {
          await loadUnlockedProfile(active);
        }
      })
      .catch(() => {
        if (active) setError('Could not load the vault status.');
      });

    return () => {
      active = false;
    };
  }, [vaultClient]);

  async function loadUnlockedProfile(active = true) {
    const response = await vaultClient.loadProfile();
    if (!active) return;
    const loaded = profileFrom(response);
    if (loaded === null) {
      setError('Could not load sensitive data.');
      return;
    }
    setProfile(loaded);
  }

  function changeProfile(mutate: (draft: SensitiveProfile) => void) {
    setProfile((current) => {
      const next = structuredClone(current);
      mutate(next);
      return next;
    });
    setMessage(null);
  }

  async function setupVault() {
    if (passphrase !== confirmPassphrase) {
      setError('Passphrases do not match.');
      return;
    }

    setError(null);
    const response = await vaultClient.setup(profile, passphrase);
    const nextStatus = statusFrom(response);
    if (nextStatus === null) {
      setError('Could not set up the vault.');
      return;
    }
    setVaultStatus(nextStatus);
    setPassphrase('');
    setConfirmPassphrase('');
    setMessage('Sensitive vault is unlocked.');
  }

  async function unlockVault() {
    setError(null);
    const response = await vaultClient.unlock(passphrase);
    const nextStatus = statusFrom(response);
    if (nextStatus === null || !nextStatus.unlocked) {
      setError('Could not unlock the vault.');
      return;
    }
    setVaultStatus(nextStatus);
    setPassphrase('');
    await loadUnlockedProfile();
    setMessage('Sensitive vault is unlocked.');
  }

  async function saveVault() {
    setError(null);
    const response = await vaultClient.saveProfile(profile);
    const nextStatus = statusFrom(response);
    if (nextStatus === null) {
      setError('Could not save sensitive data.');
      return;
    }
    setVaultStatus(nextStatus);
    setMessage('Sensitive data saved.');
  }

  async function lockVault() {
    const response = await vaultClient.lock();
    const nextStatus = statusFrom(response);
    if (nextStatus !== null) setVaultStatus(nextStatus);
    setProfile(createEmptySensitiveProfile());
    setPassphrase('');
    setConfirmPassphrase('');
    setConfirmReset(false);
    setMessage(null);
  }

  async function resetVault() {
    const response = await vaultClient.reset();
    const nextStatus = statusFrom(response);
    if (nextStatus !== null) setVaultStatus(nextStatus);
    setProfile(createEmptySensitiveProfile());
    setConfirmReset(false);
    setMessage(null);
  }

  const passphraseMismatch = error === 'Passphrases do not match.';

  return (
    <section className="profile-section vault-section">
      <div className="section-heading fillio-section-heading">
        <div>
          <h2>Sensitive vault</h2>
          <p className="muted">
            Sensitive details are stored encrypted on this device and require
            explicit approval before Fillio can use them on a site.
          </p>
        </div>
        <strong className="fillio-chip fillio-chip-strong">
          {vaultStatus.configured ? 'Vault set up' : 'Vault not set up'}
        </strong>
      </div>

      {error !== null ? (
        <p className="fillio-status fillio-status-danger" role="alert">
          {error}
        </p>
      ) : null}
      {message !== null ? (
        <p className="fillio-status fillio-status-success" role="status">
          {message}
        </p>
      ) : null}

      {!vaultStatus.configured ? (
        <>
          <div className="form-grid">
            <label>
              New vault passphrase
              <input
                type="password"
                value={passphrase}
                onChange={(event) => setPassphrase(event.target.value)}
              />
            </label>
            <label>
              Confirm vault passphrase
              <input
                type="password"
                value={confirmPassphrase}
                aria-invalid={passphraseMismatch}
                onChange={(event) => setConfirmPassphrase(event.target.value)}
              />
            </label>
          </div>
          <button
            className="fillio-button fillio-button-primary"
            type="button"
            onClick={() => void setupVault()}
          >
            Set up vault
          </button>
        </>
      ) : vaultStatus.unlocked ? (
        <>
          <SensitiveProfileFields profile={profile} onChange={changeProfile} />
          <div className="button-row vault-actions">
            <button
              className="fillio-button fillio-button-primary"
              type="button"
              onClick={() => void saveVault()}
            >
              Save sensitive data
            </button>
            <button
              className="fillio-button fillio-button-secondary"
              type="button"
              onClick={() => void lockVault()}
            >
              Lock vault
            </button>
            {confirmReset ? (
              <button
                className="fillio-button fillio-button-danger"
                type="button"
                onClick={() => void resetVault()}
              >
                Delete encrypted vault
              </button>
            ) : (
              <button
                className="fillio-button"
                type="button"
                onClick={() => setConfirmReset(true)}
              >
                Reset vault
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <label className="default-variant vault-unlock-field">
            Vault passphrase
            <input
              type="password"
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
            />
          </label>
          <button
            className="fillio-button fillio-button-primary"
            type="button"
            onClick={() => void unlockVault()}
          >
            Unlock vault
          </button>
        </>
      )}
    </section>
  );
}

function SensitiveProfileFields({
  profile,
  onChange,
}: {
  profile: SensitiveProfile;
  onChange: (mutate: (draft: SensitiveProfile) => void) => void;
}) {
  return (
    <div className="form-grid">
      <label>
        Birth date
        <input
          type="date"
          value={profile.personal.birthDate}
          onChange={(event) =>
            onChange((draft) => {
              draft.personal.birthDate = event.target.value;
            })
          }
        />
      </label>
      <label>
        Birth place
        <input
          value={profile.personal.birthPlace}
          onChange={(event) =>
            onChange((draft) => {
              draft.personal.birthPlace = event.target.value;
            })
          }
        />
      </label>
      <label>
        Gender
        <input
          value={profile.personal.gender}
          onChange={(event) =>
            onChange((draft) => {
              draft.personal.gender = event.target.value;
            })
          }
        />
      </label>
      <label>
        National ID
        <input
          value={profile.identity.nationalId}
          onChange={(event) =>
            onChange((draft) => {
              draft.identity.nationalId = event.target.value;
            })
          }
        />
      </label>
      <label>
        Passport
        <input
          value={profile.identity.passport}
          onChange={(event) =>
            onChange((draft) => {
              draft.identity.passport = event.target.value;
            })
          }
        />
      </label>
      <label>
        Tax ID
        <input
          value={profile.identity.taxId}
          onChange={(event) =>
            onChange((draft) => {
              draft.identity.taxId = event.target.value;
            })
          }
        />
      </label>
      <label>
        Expected salary
        <input
          inputMode="numeric"
          value={expectedAmount(profile)}
          onChange={(event) =>
            onChange((draft) => {
              draft.compensation.expected.amount = numberOrNull(
                event.target.value,
              );
            })
          }
        />
      </label>
      <label>
        Expected salary currency
        <input
          value={profile.compensation.expected.currency}
          onChange={(event) =>
            onChange((draft) => {
              draft.compensation.expected.currency = event.target.value;
            })
          }
        />
      </label>
    </div>
  );
}
