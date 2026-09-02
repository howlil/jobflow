import { beforeEach, describe, expect, it } from 'vitest';

import type { FillInstruction } from '../../application/prepare-fill/prepare-fill-plan';
import { applyFillInstructions } from './fill-controls';
import { extractFieldContexts } from './extract-field-contexts';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('verified fill outcomes', () => {
  it('resolves deterministic select and yes/no checkbox values', () => {
    document.body.innerHTML = `
      <form id="application">
        <label>Work arrangement
          <select name="arrangement">
            <option value="remote">Remote</option>
            <option value="hybrid-value">Hybrid</option>
          </select>
        </label>
        <label><input type="checkbox" name="relocate" /> Willing to relocate?</label>
      </form>
    `;
    const contexts = extractFieldContexts(
      document,
      'https://jobs.example.test',
    );
    const arrangement = contexts.find((item) => item.name === 'arrangement')!;
    const relocate = contexts.find((item) => item.name === 'relocate')!;

    const instructions: FillInstruction[] = [
      {
        fieldFingerprint: arrangement.fieldFingerprint,
        field: 'customAnswer:arrangement',
        value: 'Hybrid',
        controlKind: 'select',
      },
      {
        fieldFingerprint: relocate.fieldFingerprint,
        field: 'customAnswer:relocate',
        value: 'Yes',
        controlKind: 'checkbox',
      },
    ];

    expect(
      applyFillInstructions(
        document,
        'https://jobs.example.test',
        instructions,
      ),
    ).toEqual([
      { fieldFingerprint: arrangement.fieldFingerprint, status: 'filled' },
      { fieldFingerprint: relocate.fieldFingerprint, status: 'filled' },
    ]);
    expect(
      (document.querySelector('[name="arrangement"]') as HTMLSelectElement)
        .value,
    ).toBe('hybrid-value');
    expect(
      (document.querySelector('[name="relocate"]') as HTMLInputElement).checked,
    ).toBe(true);
  });

  it('reports unsupported choice values instead of claiming success', () => {
    document.body.innerHTML = `
      <form id="application">
        <label>Work arrangement
          <select name="arrangement">
            <option value="remote">Remote</option>
          </select>
        </label>
      </form>
    `;
    const [context] = extractFieldContexts(
      document,
      'https://jobs.example.test',
    );
    if (context === undefined) throw new Error('Expected select context');

    expect(
      applyFillInstructions(document, 'https://jobs.example.test', [
        {
          fieldFingerprint: context.fieldFingerprint,
          field: 'customAnswer:arrangement',
          value: 'Hybrid',
          controlKind: 'select',
        },
      ]),
    ).toEqual([
      { fieldFingerprint: context.fieldFingerprint, status: 'unsupported' },
    ]);
  });

  it('continues independent fills after a field disappears', () => {
    document.body.innerHTML = `
      <form id="application">
        <label>First name <input name="first_name" /></label>
        <label>Last name <input name="last_name" /></label>
      </form>
    `;
    const contexts = extractFieldContexts(
      document,
      'https://jobs.example.test',
    );
    const first = contexts.find((item) => item.name === 'first_name')!;
    const last = contexts.find((item) => item.name === 'last_name')!;
    document.querySelector('[name="first_name"]')?.remove();

    const results = applyFillInstructions(document, 'https://jobs.example.test', [
      {
        fieldFingerprint: first.fieldFingerprint,
        field: 'personal.legalName.first',
        value: 'Maya',
        controlKind: 'input',
      },
      {
        fieldFingerprint: last.fieldFingerprint,
        field: 'personal.legalName.last',
        value: 'Putri',
        controlKind: 'input',
      },
    ]);

    expect(results).toEqual([
      { fieldFingerprint: first.fieldFingerprint, status: 'not-found' },
      { fieldFingerprint: last.fieldFingerprint, status: 'filled' },
    ]);
    expect(
      (document.querySelector('[name="last_name"]') as HTMLInputElement).value,
    ).toBe('Putri');
  });
});
