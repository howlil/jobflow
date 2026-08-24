import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createEmptySensitiveProfile } from '../../domain/profile/create-empty-sensitive-profile';
import type { VaultClient } from './SensitiveVaultSection';
import { SensitiveVaultSection } from './SensitiveVaultSection';

function createVaultClient(): VaultClient {
  const profile = createEmptySensitiveProfile();
  profile.personal.birthDate = '2001-02-03';
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

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Passphrases do not match.',
    );
    expect(client.setup).not.toHaveBeenCalled();
  });

  it('sets up a new vault and saves sensitive scalar values through the vault client', async () => {
    const client = createVaultClient();

    const { container } = render(
      <SensitiveVaultSection vaultClient={client} />,
    );

    fireEvent.change(await screen.findByLabelText('Birth date'), {
      target: { value: '1999-04-05' },
    });
    fireEvent.change(screen.getByLabelText('National ID'), {
      target: { value: '3174000000000002' },
    });
    fireEvent.change(screen.getByLabelText('New vault passphrase'), {
      target: { value: 'local-passphrase' },
    });
    fireEvent.change(screen.getByLabelText('Confirm vault passphrase'), {
      target: { value: 'local-passphrase' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Set up vault' }));

    await waitFor(() => expect(client.setup).toHaveBeenCalledTimes(1));
    const setupProfile = vi.mocked(client.setup).mock.calls[0]?.[0];
    expect(setupProfile?.personal.birthDate).toBe('1999-04-05');
    expect(setupProfile?.identity.nationalId).toBe('3174000000000002');
    expect(container.outerHTML).not.toContain('local-passphrase');
    expect((await screen.findByRole('status')).textContent).toBe(
      'Sensitive vault is unlocked.',
    );
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
