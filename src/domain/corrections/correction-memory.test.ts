import { describe, expect, it } from 'vitest';

import type { FieldContext } from '../forms/field-context';
import { matchFieldWithCorrections } from '../matching/match-field-with-corrections';
import {
  createEmptyStoredCorrections,
  parseStoredCorrections,
  type FieldCorrection,
} from './correction-schema';

function field(overrides: Partial<FieldContext>): FieldContext {
  return {
    controlKind: 'input',
    inputType: 'text',
    label: '',
    name: '',
    id: '',
    placeholder: '',
    ariaLabel: '',
    options: [],
    sectionText: '',
    origin: 'https://jobs.example.test',
    formFingerprint: 'form-a',
    fieldFingerprint: 'field-a',
    ...overrides,
  };
}

function correction(overrides: Partial<FieldCorrection> = {}): FieldCorrection {
  return {
    origin: 'https://jobs.example.test',
    formFingerprint: 'form-a',
    fieldFingerprint: 'field-a',
    target: 'personal.legalName.first',
    updatedAt: '2026-08-13T12:00:00.000Z',
    ...overrides,
  };
}

describe('correction memory', () => {
  it('overrides deterministic matching only for the exact site/form/field', () => {
    const context = field({ label: 'Email' });
    const remembered = correction({ target: 'contact.phone.primary' });

    expect(matchFieldWithCorrections(context, [remembered])).toEqual({
      status: 'ready',
      field: 'contact.phone.primary',
      reason: 'user-correction',
      sensitivity: 'normal',
    });

    expect(
      matchFieldWithCorrections(
        { ...context, origin: 'https://other.example.test' },
        [remembered],
      ),
    ).toMatchObject({ status: 'ready', field: 'contact.email.primary' });

    expect(
      matchFieldWithCorrections({ ...context, formFingerprint: 'form-b' }, [
        remembered,
      ]),
    ).toMatchObject({ status: 'ready', field: 'contact.email.primary' });

    expect(
      matchFieldWithCorrections({ ...context, fieldFingerprint: 'field-b' }, [
        remembered,
      ]),
    ).toMatchObject({ status: 'ready', field: 'contact.email.primary' });
  });

  it('turns an exact remembered ignore decision into Unknown', () => {
    expect(
      matchFieldWithCorrections(field({ label: 'Name' }), [
        correction({ target: 'ignore' }),
      ]),
    ).toEqual({ status: 'unknown', reason: 'user-ignored' });
  });

  it('never lets a correction override sensitive or file fail-closed guards', () => {
    expect(
      matchFieldWithCorrections(field({ label: 'Date of birth' }), [
        correction(),
      ]),
    ).toEqual({
      status: 'sensitive',
      field: 'personal.birthDate',
      reason: 'exact-sensitive-alias',
      sensitivity: 'sensitive',
    });

    expect(
      matchFieldWithCorrections(
        field({ controlKind: 'file', inputType: 'file', label: 'CV' }),
        [correction()],
      ),
    ).toEqual({ status: 'unknown', reason: 'file-input' });
  });

  it('creates and parses a versioned mapping-only correction envelope', () => {
    const envelope = createEmptyStoredCorrections();
    envelope.entries.push(correction());

    expect(parseStoredCorrections(envelope)).toEqual(envelope);
  });

  it('rejects future schema versions and unsupported correction targets', () => {
    expect(() =>
      parseStoredCorrections({ schemaVersion: 2, entries: [] }),
    ).toThrow();

    expect(() =>
      parseStoredCorrections({
        schemaVersion: 1,
        entries: [correction({ target: 'ignore' })].map((entry) => ({
          ...entry,
          target: 'sensitive.dateOfBirth',
        })),
      }),
    ).toThrow();
  });
});
