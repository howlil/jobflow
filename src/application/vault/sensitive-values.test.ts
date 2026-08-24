import { describe, expect, it } from 'vitest';

import type { FieldContext } from '../../domain/forms/field-context';
import type { FillAnalysis } from '../prepare-fill/prepare-fill-plan';
import { createSensitiveFillInstructions } from './sensitive-values';

function context(
  fieldFingerprint: string,
  label: string,
  controlKind: FieldContext['controlKind'] = 'input',
): FieldContext {
  return {
    controlKind,
    inputType: 'text',
    label,
    name: '',
    id: '',
    placeholder: '',
    ariaLabel: '',
    options: [],
    sectionText: '',
    origin: 'https://jobs.example.test',
    formFingerprint: 'form',
    fieldFingerprint,
  };
}

function sensitive(
  fieldFingerprint: string,
  field: 'identity.nationalId' | 'personal.birthDate',
): FillAnalysis {
  return {
    context: context(fieldFingerprint, field),
    match: {
      status: 'sensitive',
      field,
      reason: 'exact-sensitive-alias',
      sensitivity: 'sensitive',
    },
  };
}

describe('createSensitiveFillInstructions', () => {
  it('creates fill instructions only for requested sensitive values returned by the vault', () => {
    const instructions = createSensitiveFillInstructions(
      [
        sensitive('nik', 'identity.nationalId'),
        sensitive('birth-date', 'personal.birthDate'),
      ],
      {
        'identity.nationalId': '3174000000000001',
        'personal.birthDate': '',
      },
    );

    expect(instructions).toEqual([
      {
        fieldFingerprint: 'nik',
        field: 'identity.nationalId',
        value: '3174000000000001',
        controlKind: 'input',
      },
    ]);
  });
});
