import { describe, expect, it } from 'vitest';

import type { FieldContext } from '../forms/field-context';
import { classifyDocumentFieldIntent } from './classify-document-field';

function fileField(overrides: Partial<FieldContext> = {}): FieldContext {
  return {
    controlKind: 'file',
    inputType: 'file',
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

describe('classifyDocumentFieldIntent', () => {
  it.each([
    ['resume', fileField({ label: 'Upload resume / CV' })],
    [
      'cover_letter',
      fileField({ name: 'supporting-document', sectionText: 'Cover letter' }),
    ],
    ['portfolio', fileField({ ariaLabel: 'Attach portfolio' })],
    ['transcript', fileField({ label: 'Academic transcript' })],
    ['certificate', fileField({ label: 'Professional certificate' })],
  ] as const)('classifies %s from bounded field context', (intent, field) => {
    const result = classifyDocumentFieldIntent(field);

    expect(result.intent).toBe(intent);
    expect(result.evidence.length).toBeGreaterThan(0);
  });

  it('fails closed for a generic attachment', () => {
    expect(
      classifyDocumentFieldIntent(fileField({ label: 'Upload attachment' })),
    ).toEqual({ intent: 'unknown', evidence: [] });
  });

  it('does not classify non-file controls as documents', () => {
    expect(
      classifyDocumentFieldIntent(
        fileField({ controlKind: 'input', inputType: 'text', label: 'Resume' }),
      ),
    ).toEqual({ intent: 'unknown', evidence: [] });
  });
});
