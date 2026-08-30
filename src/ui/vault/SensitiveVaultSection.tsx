import { useEffect, useState } from 'react';
import { KeyRound, Lock, Save, ShieldCheck, Trash2 } from 'lucide-react';

import type { VaultResponse } from '../../application/vault/vault-messages';
import { createEmptySensitiveProfile } from '../../domain/profile/create-empty-sensitive-profile';
import type { SensitiveProfile } from '../../domain/profile/profile-schema';
import {
  ActionRow,
  Button,
  Chip,
  FieldGrid,
  Section,
  SectionHeader,
  StatusMessage,
  TextField,
} from '../design-system/primitives';

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
    <Section id="sensitive-vault">
      <SectionHeader
        title="Sensitive vault"
        description="Add salary, identity, and other private answers here only when a job form asks for them. Job Flow still asks before using them on a site."
        action={
          <Chip strong>
            <ShieldCheck aria-hidden="true" size={14} />
            {vaultStatus.configured ? 'Vault set up' : 'Vault not set up'}
          </Chip>
        }
      />

      {error !== null ? (
        <StatusMessage tone="danger" role="alert">
          {error}
        </StatusMessage>
      ) : null}
      {message !== null ? (
        <StatusMessage tone="success" role="status">
          {message}
        </StatusMessage>
      ) : null}

      {!vaultStatus.configured ? (
        <>
          <FieldGrid>
            <TextField
              type="password"
              label="New vault passphrase"
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
            />
            <TextField
              type="password"
              label="Confirm vault passphrase"
              value={confirmPassphrase}
              aria-invalid={passphraseMismatch}
              onChange={(event) => setConfirmPassphrase(event.target.value)}
            />
          </FieldGrid>
          <Button variant="primary" onClick={() => void setupVault()}>
            <KeyRound aria-hidden="true" size={16} />
            Set up vault
          </Button>
        </>
      ) : vaultStatus.unlocked ? (
        <>
          <SensitiveProfileFields profile={profile} onChange={changeProfile} />
          <ActionRow>
            <Button variant="primary" onClick={() => void saveVault()}>
              <Save aria-hidden="true" size={16} />
              Save sensitive data
            </Button>
            <Button onClick={() => void lockVault()}>
              <Lock aria-hidden="true" size={16} />
              Lock vault
            </Button>
            {confirmReset ? (
              <Button variant="danger" onClick={() => void resetVault()}>
                <Trash2 aria-hidden="true" size={16} />
                Delete encrypted vault
              </Button>
            ) : (
              <Button onClick={() => setConfirmReset(true)}>
                <Trash2 aria-hidden="true" size={16} />
                Reset vault
              </Button>
            )}
          </ActionRow>
        </>
      ) : (
        <>
          <TextField
            className="max-w-md"
            type="password"
            label="Vault passphrase"
            value={passphrase}
            onChange={(event) => setPassphrase(event.target.value)}
          />
          <Button variant="primary" onClick={() => void unlockVault()}>
            <KeyRound aria-hidden="true" size={16} />
            Unlock vault
          </Button>
        </>
      )}
    </Section>
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
    <FieldGrid>
      <TextField
        inputMode="numeric"
        pattern="\d{2}/\d{2}/\d{4}"
        placeholder="DD/MM/YYYY"
        label="Birth date"
        value={profile.personal.birthDate}
        onChange={(event) =>
          onChange((draft) => {
            draft.personal.birthDate = event.target.value;
          })
        }
      />
      <TextField
        label="Birth place"
        value={profile.personal.birthPlace}
        onChange={(event) =>
          onChange((draft) => {
            draft.personal.birthPlace = event.target.value;
          })
        }
      />
      <TextField
        label="Gender"
        value={profile.personal.gender}
        onChange={(event) =>
          onChange((draft) => {
            draft.personal.gender = event.target.value;
          })
        }
      />
      <TextField
        label="National ID"
        value={profile.identity.nationalId}
        onChange={(event) =>
          onChange((draft) => {
            draft.identity.nationalId = event.target.value;
          })
        }
      />
      <TextField
        label="Passport"
        value={profile.identity.passport}
        onChange={(event) =>
          onChange((draft) => {
            draft.identity.passport = event.target.value;
          })
        }
      />
      <TextField
        label="Tax ID"
        value={profile.identity.taxId}
        onChange={(event) =>
          onChange((draft) => {
            draft.identity.taxId = event.target.value;
          })
        }
      />
      <TextField
        inputMode="numeric"
        label="Expected salary"
        value={expectedAmount(profile)}
        onChange={(event) =>
          onChange((draft) => {
            draft.compensation.expected.amount = numberOrNull(
              event.target.value,
            );
          })
        }
      />
      <TextField
        label="Expected salary currency"
        value={profile.compensation.expected.currency}
        onChange={(event) =>
          onChange((draft) => {
            draft.compensation.expected.currency = event.target.value;
          })
        }
      />
    </FieldGrid>
  );
}
