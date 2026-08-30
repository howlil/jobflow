import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createEmptySensitiveProfile } from '../../domain/profile/create-empty-sensitive-profile';
import type { VaultClient } from './SensitiveVaultSection';
import { SensitiveVaultSection } from './SensitiveVaultSection';

function createVaultClient(): VaultClient {
  const profile = createEmptySensitiveProfile();
  profile.personal.birthDate = '03/02/2001';
  profile.identity.nationalId = '3174000000000001';
  profile.compensation.expected.amount = 15_000_000;
  profile.compensation.expected.currency = 'IDR';
  profile.compensation.expected.payPeriod = 'monthly';

  return {
    status: vi.fn().mockResolvedValue({
      ok: true,
      status: { configured: false, unlocked: false, expiresAt: null },
    }),
    setup: vi.fn().mockResolvedValue({
      ok: true,
      status: { configured: true, unlocked: true, expiresAt: 1786639500000 },
    }),
    unlock: vi.fn().mockResolvedValue({
      ok: true,
      status: { configured: true, unlocked: true, expiresAt: 1786639500000 },
    }),
    lock: vi.fn().mockResolvedValue({
      ok: true,
      status: { configured: true, unlocked: false, expiresAt: null },
    }),
    loadProfile: vi.fn().mockResolvedValue({ ok: true, profile }),
    saveProfile: vi.fn().mockResolvedValue({
      ok: true,
      status: { configured: true, unlocked: true, expiresAt: 1786639500000 },
    }),
    reset: vi.fn().mockResolvedValue({
      ok: true,
      status: { configured: false, unlocked: false, expiresAt: null },
    }),
  };
}

describe('SensitiveVaultSection', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2026-08-13T16:45:00.000Z'));
  });

  it('shows only vault setup controls before the vault is configured', async () => {
    render(<SensitiveVaultSection vaultClient={createVaultClient()} />);

    expect(await screen.findByText('Sensitive vault')).toBeTruthy();
    fireEvent.click(
      screen.getByRole('button', { name: 'About Sensitive vault' }),
    );
    expect(
      screen.getByText(/add salary, identity, and other private answers/i),
    ).toBeTruthy();
    expect(screen.getByLabelText(/new vault passphrase/i)).toBeTruthy();
    expect(screen.getByLabelText(/confirm vault passphrase/i)).toBeTruthy();
    expect(screen.queryByLabelText(/national id/i)).toBeNull();
    expect(screen.queryByLabelText(/expected salary/i)).toBeNull();
  });

  it('requires matching passphrases before opt-in setup', async () => {
    const client = createVaultClient();

    render(<SensitiveVaultSection vaultClient={client} />);

    fireEvent.change(await screen.findByLabelText('New vault passphrase'), {
      target: { value: 'first-passphrase' },
    });
    fireEvent.change(screen.getByLabelText('Confirm vault passphrase'), {
      target: { value: 'second-passphrase' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Set up vault' }));

    const error = await screen.findByRole('alert');
    expect(error.textContent).toBe('Passphrases do not match.');
    expect(
      screen
        .getByLabelText('Confirm vault passphrase')
        .getAttribute('aria-invalid'),
    ).toBe('true');
    expect(client.setup).not.toHaveBeenCalled();
  });

  it('sets up a new vault and saves sensitive scalar values through the vault client', async () => {
    const client = createVaultClient();

    const { container } = render(
      <SensitiveVaultSection vaultClient={client} />,
    );

    fireEvent.change(await screen.findByLabelText('New vault passphrase'), {
      target: { value: 'local-passphrase' },
    });
    fireEvent.change(screen.getByLabelText('Confirm vault passphrase'), {
      target: { value: 'local-passphrase' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Set up vault' }));

    await waitFor(() => expect(client.setup).toHaveBeenCalledTimes(1));
    const setupProfile = vi.mocked(client.setup).mock.calls[0]?.[0];
    expect(setupProfile).toEqual(createEmptySensitiveProfile());
    expect(container.outerHTML).not.toContain('local-passphrase');
    expect(await screen.findByLabelText('Birth date')).toBeTruthy();
    expect((await screen.findByRole('status')).textContent).toBe(
      'Sensitive vault is unlocked.',
    );
  });

  it('shows only an unlock action while a configured vault is locked', async () => {
    const client = createVaultClient();
    vi.mocked(client.status).mockResolvedValueOnce({
      ok: true,
      status: { configured: true, unlocked: false, expiresAt: null },
    });

    render(<SensitiveVaultSection vaultClient={client} />);

    expect(await screen.findByLabelText(/vault passphrase/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /unlock vault/i })).toBeTruthy();
    expect(screen.queryByLabelText(/national id/i)).toBeNull();
  });

  it('shows the sensitive editor only after a configured vault is unlocked', async () => {
    const client = createVaultClient();
    vi.mocked(client.status).mockResolvedValueOnce({
      ok: true,
      status: { configured: true, unlocked: true, expiresAt: 1786639500000 },
    });

    render(<SensitiveVaultSection vaultClient={client} />);

    expect(await screen.findByLabelText(/national id/i)).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /save sensitive data/i }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: /lock vault/i })).toBeTruthy();
  });

  it('unlocks an existing vault, saves edits, and locks explicitly', async () => {
    const client = createVaultClient();
    vi.mocked(client.status).mockResolvedValueOnce({
      ok: true,
      status: { configured: true, unlocked: false, expiresAt: null },
    });

    render(<SensitiveVaultSection vaultClient={client} />);

    fireEvent.change(await screen.findByLabelText('Vault passphrase'), {
      target: { value: 'local-passphrase' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Unlock vault' }));

    await waitFor(() => expect(client.loadProfile).toHaveBeenCalledTimes(1));
    expect(
      (await screen.findByLabelText<HTMLInputElement>('Birth date')).value,
    ).toBe('2001-02-03');

    fireEvent.change(screen.getByLabelText('Expected salary'), {
      target: { value: '20000000' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Save sensitive data' }),
    );

    await waitFor(() => expect(client.saveProfile).toHaveBeenCalledTimes(1));
    const savedProfile = vi.mocked(client.saveProfile).mock.calls[0]?.[0];
    expect(savedProfile?.compensation.expected.amount).toBe(20_000_000);

    fireEvent.click(screen.getByRole('button', { name: 'Lock vault' }));

    await waitFor(() => expect(client.lock).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText('Vault passphrase')).toBeTruthy();
  });

  it('shows a generic unlock failure and keeps the vault locked', async () => {
    const client = createVaultClient();
    vi.mocked(client.status).mockResolvedValueOnce({
      ok: true,
      status: { configured: true, unlocked: false, expiresAt: null },
    });
    vi.mocked(client.unlock).mockResolvedValueOnce({
      ok: false,
      error: 'invalid-passphrase',
    });

    render(<SensitiveVaultSection vaultClient={client} />);

    fireEvent.change(await screen.findByLabelText('Vault passphrase'), {
      target: { value: 'wrong-passphrase' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Unlock vault' }));

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Could not unlock the vault.',
    );
    expect(client.loadProfile).not.toHaveBeenCalled();
  });

  it('requires a second explicit click before destructive reset', async () => {
    const client = createVaultClient();
    vi.mocked(client.status).mockResolvedValueOnce({
      ok: true,
      status: { configured: true, unlocked: true, expiresAt: 1786639500000 },
    });

    render(<SensitiveVaultSection vaultClient={client} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Reset vault' }));
    expect(client.reset).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole('button', { name: 'Delete encrypted vault' }),
    );

    await waitFor(() => expect(client.reset).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('Vault not set up')).toBeTruthy();
  });
});
