import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FillInstruction } from '../../application/prepare-fill/prepare-fill-plan';
import { applyFillInstructions } from './fill-controls';
import { extractFieldContexts } from './extract-field-contexts';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('DOM form adapter', () => {
  it('extracts supported controls into serializable field contexts', () => {
    document.body.innerHTML = `
      <main>
        <h1>Backend Engineer Application</h1>
        <form id="application" action="/apply">
          <section>
            <h2>Personal details</h2>
            <label for="first">First name</label>
            <input id="first" name="candidate[first_name]" placeholder="Given name" />

            <label>Email <input id="email" type="email" name="email" /></label>
            <textarea id="headline" aria-label="Professional headline"></textarea>

            <label for="city">City</label>
            <select id="city" name="city">
              <option value="">Choose city</option>
              <option value="jkt">Jakarta</option>
              <option value="pdg">Padang</option>
            </select>

            <label><input id="relocate" type="checkbox" name="relocate" /> Willing to relocate?</label>

            <fieldset>
              <legend>Work arrangement</legend>
              <label><input type="radio" name="arrangement" value="remote" /> Remote</label>
              <label><input type="radio" name="arrangement" value="hybrid" /> Hybrid</label>
            </fieldset>

            <label for="start">Available from</label>
            <input id="start" type="date" name="available_from" />

            <label for="resume">Resume</label>
            <input id="resume" type="file" name="resume" />

            <input type="hidden" name="csrf" value="secret" />
            <input type="submit" value="Apply" />
            <button type="button">Cancel</button>
          </section>
        </form>
      </main>
    `;

    const contexts = extractFieldContexts(
      document,
      'https://jobs.example.test',
    );

    expect(contexts).toHaveLength(8);
    expect(
      contexts.every((context) => typeof context.fieldFingerprint === 'string'),
    ).toBe(true);
    expect(
      new Set(contexts.map((context) => context.formFingerprint)).size,
    ).toBe(1);

    const firstName = contexts.find(
      (context) => context.name === 'candidate[first_name]',
    );
    expect(firstName).toMatchObject({
      controlKind: 'input',
      inputType: 'text',
      label: 'First name',
      placeholder: 'Given name',
      sectionText: 'Personal details',
      origin: 'https://jobs.example.test',
    });

    expect(contexts.find((context) => context.name === 'email')?.label).toBe(
      'Email',
    );
    expect(
      contexts.find((context) => context.id === 'headline')?.ariaLabel,
    ).toBe('Professional headline');

    expect(
      contexts.find((context) => context.name === 'city')?.options,
    ).toEqual([
      { value: '', label: 'Choose city' },
      { value: 'jkt', label: 'Jakarta' },
      { value: 'pdg', label: 'Padang' },
    ]);

    expect(
      contexts.find((context) => context.name === 'arrangement'),
    ).toMatchObject({
      controlKind: 'radio',
      label: 'Work arrangement',
      options: [
        { value: 'remote', label: 'Remote' },
        { value: 'hybrid', label: 'Hybrid' },
      ],
    });

    expect(contexts.find((context) => context.name === 'resume')).toMatchObject(
      {
        controlKind: 'file',
        inputType: 'file',
        label: 'Resume',
      },
    );
  });

  it('produces distinct form fingerprints for distinct form structure', () => {
    document.body.innerHTML = `
      <form id="personal"><label>First name <input name="first_name" /></label></form>
      <form id="links"><label>GitHub <input name="github" /></label></form>
    `;

    const contexts = extractFieldContexts(
      document,
      'https://jobs.example.test',
    );

    expect(contexts).toHaveLength(2);
    expect(contexts[0]?.formFingerprint).not.toBe(contexts[1]?.formFingerprint);
  });

  it('fills text, textarea, select, checkbox, radio, and date controls and dispatches events', () => {
    document.body.innerHTML = `
      <form id="application">
        <label>First name <input name="first_name" /></label>
        <label>Headline <textarea name="headline"></textarea></label>
        <label>City
          <select name="city">
            <option value="jkt">Jakarta</option>
            <option value="pdg">Padang</option>
          </select>
        </label>
        <label><input type="checkbox" name="relocate" /> Willing to relocate?</label>
        <fieldset>
          <legend>Work arrangement</legend>
          <label><input type="radio" name="arrangement" value="remote" /> Remote</label>
          <label><input type="radio" name="arrangement" value="hybrid" /> Hybrid</label>
        </fieldset>
        <label>Available from <input type="date" name="available_from" /></label>
        <button id="submit" type="submit">Apply</button>
      </form>
    `;

    const contexts = extractFieldContexts(
      document,
      'https://jobs.example.test',
    );
    const byName = (name: string) => {
      const context = contexts.find((item) => item.name === name);
      if (context === undefined) throw new Error(`Missing context ${name}`);
      return context;
    };

    const eventLog: string[] = [];
    for (const control of document.querySelectorAll(
      'input, textarea, select',
    )) {
      control.addEventListener('input', () =>
        eventLog.push(`${control.getAttribute('name')}:input`),
      );
      control.addEventListener('change', () =>
        eventLog.push(`${control.getAttribute('name')}:change`),
      );
    }

    const submitSpy = vi.fn((event: Event) => event.preventDefault());
    document.querySelector('form')?.addEventListener('submit', submitSpy);

    const instructions: FillInstruction[] = [
      {
        fieldFingerprint: byName('first_name').fieldFingerprint,
        field: 'personal.legalName.first',
        value: 'Ulil',
        controlKind: 'input',
      },
      {
        fieldFingerprint: byName('headline').fieldFingerprint,
        field: 'professional.headline',
        value: 'Backend Engineer',
        controlKind: 'textarea',
      },
      {
        fieldFingerprint: byName('city').fieldFingerprint,
        field: 'contact.address.city',
        value: 'Padang',
        controlKind: 'select',
      },
      {
        fieldFingerprint: byName('relocate').fieldFingerprint,
        field: 'jobPreferences.willingToRelocate',
        value: true,
        controlKind: 'checkbox',
      },
      {
        fieldFingerprint: byName('arrangement').fieldFingerprint,
        field: 'professional.headline',
        value: 'hybrid',
        controlKind: 'radio',
      },
      {
        fieldFingerprint: byName('available_from').fieldFingerprint,
        field: 'jobPreferences.availabilityDate',
        value: '01/09/2026',
        controlKind: 'input',
      },
    ];

    const results = applyFillInstructions(
      document,
      'https://jobs.example.test',
      instructions,
    );

    expect(results.every((result) => result.status === 'filled')).toBe(true);
    expect(
      (document.querySelector('[name="first_name"]') as HTMLInputElement).value,
    ).toBe('Ulil');
    expect(
      (document.querySelector('[name="headline"]') as HTMLTextAreaElement)
        .value,
    ).toBe('Backend Engineer');
    expect(
      (document.querySelector('[name="city"]') as HTMLSelectElement).value,
    ).toBe('pdg');
    expect(
      (document.querySelector('[name="relocate"]') as HTMLInputElement).checked,
    ).toBe(true);
    expect(
      (
        document.querySelector(
          '[name="arrangement"][value="hybrid"]',
        ) as HTMLInputElement
      ).checked,
    ).toBe(true);
    expect(
      (document.querySelector('[name="available_from"]') as HTMLInputElement)
        .value,
    ).toBe('2026-09-01');
    expect(eventLog).toEqual(
      expect.arrayContaining([
        'first_name:input',
        'first_name:change',
        'headline:input',
        'city:change',
        'relocate:change',
        'arrangement:change',
        'available_from:input',
      ]),
    );
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('fails one instruction locally without aborting later fields', () => {
    document.body.innerHTML = `
      <form>
        <label>First name <input name="first_name" /></label>
      </form>
    `;
    const context = extractFieldContexts(
      document,
      'https://jobs.example.test',
    )[0];
    if (context === undefined) throw new Error('Missing first name context');

    const results = applyFillInstructions(
      document,
      'https://jobs.example.test',
      [
        {
          fieldFingerprint: 'fld_missing',
          field: 'links.github',
          value: 'https://github.com/howlil',
          controlKind: 'input',
        },
        {
          fieldFingerprint: context.fieldFingerprint,
          field: 'personal.legalName.first',
          value: 'Ulil',
          controlKind: 'input',
        },
      ],
    );

    expect(results).toEqual([
      { fieldFingerprint: 'fld_missing', status: 'not-found' },
      { fieldFingerprint: context.fieldFingerprint, status: 'filled' },
    ]);
    expect((document.querySelector('input') as HTMLInputElement).value).toBe(
      'Ulil',
    );
  });
});
