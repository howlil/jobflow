import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { FillAnalysis } from '../../application/prepare-fill/prepare-fill-plan';
import type { FieldContext } from '../../domain/forms/field-context';
import { FloatingPanel } from './FloatingPanel';

function sensitiveItem(): FillAnalysis {
  const context: FieldContext = {
    controlKind: 'input',
    inputType: 'text',
    label: 'NIK',
    name: 'nik',
    id: '',
    placeholder: '',
    ariaLabel: '',
    options: [],
    sectionText: '',
    origin: 'https://jobs.example.test',
    formFingerprint: 'form',
    fieldFingerprint: 'nik',
  };
  return {
    context,
    match: {
      status: 'sensitive',
      field: 'identity.nationalId',
      reason: 'exact-sensitive-alias',
      sensitivity: 'sensitive',
    },
  };
}

describe('FloatingPanel sensitive disclosure', () => {
  it('offers settings when sensitive fields are present but no vault exists', () => {
    const openOptions = vi.fn();

    render(
      <FloatingPanel
        summary={{
          ready: 0,
          needsReview: 0,
          sensitive: 1,
          unknown: 0,
          total: 1,
        }}
        sensitiveItems={[sensitiveItem()]}
        vaultStatus="not-configured"
        siteHost="jobs.example.test"
        onFill={vi.fn()}
        onOpenOptions={openOptions}
      />,
    );

    expect(screen.getByText('NIK')).toBeTruthy();
    fireEvent.click(
      screen.getByRole('button', { name: 'Open vault settings' }),
    );
    expect(openOptions).toHaveBeenCalledTimes(1);
  });

  it('unlocks without filling sensitive fields', () => {
    const unlock = vi.fn();
    const fillSensitive = vi.fn();

    render(
      <FloatingPanel
        summary={{
          ready: 0,
          needsReview: 0,
          sensitive: 1,
          unknown: 0,
          total: 1,
        }}
        sensitiveItems={[sensitiveItem()]}
        vaultStatus="locked"
        siteHost="jobs.example.test"
        onFill={vi.fn()}
        onUnlockSensitive={unlock}
        onFillSensitive={fillSensitive}
      />,
    );

    fireEvent.change(screen.getByLabelText('Vault passphrase'), {
      target: { value: 'local-passphrase' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Unlock vault' }));

    expect(unlock).toHaveBeenCalledWith('local-passphrase');
    expect(fillSensitive).not.toHaveBeenCalled();
  });

  it('shows an unlock error without exposing sensitive values', () => {
    render(
      <FloatingPanel
        summary={{
          ready: 0,
          needsReview: 0,
          sensitive: 1,
          unknown: 0,
          total: 1,
        }}
        sensitiveItems={[sensitiveItem()]}
        vaultStatus="locked"
        sensitiveError="Could not unlock the vault."
        siteHost="jobs.example.test"
        onFill={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert').textContent).toBe(
      'Could not unlock the vault.',
    );
  });

  it('requires a separate site-specific approval before sensitive fill', () => {
    const fillSensitive = vi.fn();

    render(
      <FloatingPanel
        summary={{
          ready: 0,
          needsReview: 0,
          sensitive: 1,
          unknown: 0,
          total: 1,
        }}
        sensitiveItems={[sensitiveItem()]}
        vaultStatus="unlocked"
        siteHost="jobs.example.test"
        onFill={vi.fn()}
        onFillSensitive={fillSensitive}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Fill sensitive fields on jobs.example.test',
      }),
    );

    expect(fillSensitive).toHaveBeenCalledTimes(1);
  });
});
