import { beforeEach, describe, expect, it } from 'vitest';

import { analyzeFieldContexts } from '../../application/forms/analyze-field-contexts';
import type { FillInstruction } from '../../application/prepare-fill/prepare-fill-plan';
import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import { applyFillInstructions } from './fill-controls';
import { extractFieldContexts } from './extract-field-contexts';
import { ensureStructuredRecordSlots } from './structured-record-sections';

beforeEach(() => {
  document.body.innerHTML = '';
});

function profileWithStructuredRecords() {
  const envelope = createEmptyStoredProfile('2026-09-03T00:00:00.000Z');
  envelope.baseProfile.professional.experiences = [
    {
      id: 'exp-1',
      company: 'Gojek',
      title: 'Backend Engineer',
      employmentType: 'Full-time',
      location: 'Jakarta',
      startDate: '01/01/2024',
      endDate: '',
      current: true,
      description: 'Built backend services.',
      achievements: [],
      skills: ['Go'],
    },
    {
      id: 'exp-2',
      company: 'Traveloka',
      title: 'Software Engineer',
      employmentType: 'Full-time',
      location: 'Jakarta',
      startDate: '01/01/2022',
      endDate: '31/12/2023',
      current: false,
      description: 'Built booking systems.',
      achievements: [],
      skills: ['TypeScript'],
    },
  ];
  envelope.baseProfile.professional.education = [
    {
      id: 'edu-1',
      institution: 'Universitas Indonesia',
      degree: 'Bachelor',
      fieldOfStudy: 'Computer Science',
      location: 'Depok',
      startDate: '01/08/2018',
      endDate: '01/07/2022',
      gpa: 3.8,
      maxGpa: 4,
      description: '',
    },
  ];
  return envelope.baseProfile;
}

describe('complex application completion', () => {
  it('maps repeated experience and education controls to ordered profile records', () => {
    document.body.innerHTML = `
      <form id="application">
        <section aria-label="Work experience">
          <fieldset>
            <legend>Experience 1</legend>
            <label>Company <input name="experience[0][company]" /></label>
            <label>Job title <input name="experience[0][title]" /></label>
            <label>Start date <input name="experience[0][start_date]" /></label>
          </fieldset>
          <fieldset>
            <legend>Experience 2</legend>
            <label>Company <input name="experience[1][company]" /></label>
            <label>Job title <input name="experience[1][title]" /></label>
            <label>Start date <input name="experience[1][start_date]" /></label>
          </fieldset>
        </section>
        <section aria-label="Education">
          <fieldset>
            <legend>Education 1</legend>
            <label>University <input name="education[0][school]" /></label>
            <label>Degree <input name="education[0][degree]" /></label>
            <label>Field of study <input name="education[0][major]" /></label>
          </fieldset>
        </section>
      </form>
    `;

    const profile = profileWithStructuredRecords();
    const fields = extractFieldContexts(document, 'https://jobs.example.test');
    const analysis = analyzeFieldContexts(fields, profile);

    expect(analysis.summary.structured?.experience).toMatchObject({
      profileRecords: 2,
      detectedRecords: 2,
      readyRecords: 2,
      unresolvedFields: 0,
    });
    expect(analysis.summary.structured?.education).toMatchObject({
      profileRecords: 1,
      detectedRecords: 1,
      readyRecords: 1,
      unresolvedFields: 0,
    });

    const results = applyFillInstructions(
      document,
      'https://jobs.example.test',
      analysis.plan.ready,
    );
    expect(results.every((result) => result.status === 'filled')).toBe(true);
    expect(
      (document.querySelector('[name="experience[0][company]"]') as HTMLInputElement)
        .value,
    ).toBe('Gojek');
    expect(
      (document.querySelector('[name="experience[1][company]"]') as HTMLInputElement)
        .value,
    ).toBe('Traveloka');
    expect(
      (document.querySelector('[name="education[0][school]"]') as HTMLInputElement)
        .value,
    ).toBe('Universitas Indonesia');
  });

  it('fills semantic ARIA combobox, checkbox, and radio controls only when deterministic', () => {
    document.body.innerHTML = `
      <form id="application">
        <div role="combobox" aria-label="City" aria-controls="city-options" aria-expanded="true"></div>
        <div role="listbox" id="city-options">
          <div role="option" data-value="Jakarta" aria-selected="false">Jakarta</div>
          <div role="option" data-value="Padang" aria-selected="false">Padang</div>
        </div>
        <div role="checkbox" aria-label="Willing to relocate" aria-checked="false"></div>
        <div role="radiogroup" aria-label="Work arrangement">
          <div role="radio" data-value="remote" aria-label="Remote" aria-checked="false"></div>
          <div role="radio" data-value="hybrid" aria-label="Hybrid" aria-checked="false"></div>
        </div>
      </form>
    `;

    const padang = document.querySelector<HTMLElement>('[data-value="Padang"]');
    padang?.addEventListener('click', () => padang.setAttribute('aria-selected', 'true'));
    const relocate = document.querySelector<HTMLElement>('[role="checkbox"]');
    relocate?.addEventListener('click', () => relocate.setAttribute('aria-checked', 'true'));
    const hybrid = document.querySelector<HTMLElement>('[data-value="hybrid"]');
    hybrid?.addEventListener('click', () => hybrid.setAttribute('aria-checked', 'true'));

    const fields = extractFieldContexts(document, 'https://jobs.example.test');
    const city = fields.find((field) => field.ariaLabel === 'City');
    const checkbox = fields.find((field) => field.ariaLabel === 'Willing to relocate');
    const radio = fields.find((field) => field.label === 'Work arrangement');
    if (city === undefined || checkbox === undefined || radio === undefined) {
      throw new Error('Expected semantic controls');
    }

    const instructions: FillInstruction[] = [
      {
        fieldFingerprint: city.fieldFingerprint,
        field: 'contact.address.city',
        value: 'Padang',
        controlKind: 'select',
      },
      {
        fieldFingerprint: checkbox.fieldFingerprint,
        field: 'jobPreferences.willingToRelocate',
        value: true,
        controlKind: 'checkbox',
      },
      {
        fieldFingerprint: radio.fieldFingerprint,
        field: 'professional.headline',
        value: 'hybrid',
        controlKind: 'radio',
      },
    ];

    expect(
      applyFillInstructions(document, 'https://jobs.example.test', instructions),
    ).toEqual([
      { fieldFingerprint: city.fieldFingerprint, status: 'filled' },
      { fieldFingerprint: checkbox.fieldFingerprint, status: 'filled' },
      { fieldFingerprint: radio.fieldFingerprint, status: 'filled' },
    ]);
  });

  it('expands only clearly labelled repeated sections after an explicit fill action', async () => {
    document.body.innerHTML = `
      <form id="application">
        <section aria-label="Work experience" id="experience-section">
          <fieldset>
            <legend>Experience 1</legend>
            <label>Company <input name="experience[0][company]" /></label>
            <label>Job title <input name="experience[0][title]" /></label>
          </fieldset>
          <button type="button" id="add-experience">Add another experience</button>
        </section>
        <section aria-label="Other information">
          <button type="button" id="ambiguous-add">Add another</button>
        </section>
      </form>
    `;

    let ambiguousClicks = 0;
    document.getElementById('ambiguous-add')?.addEventListener('click', () => {
      ambiguousClicks += 1;
    });
    document.getElementById('add-experience')?.addEventListener('click', () => {
      const fieldset = document.createElement('fieldset');
      fieldset.innerHTML = `
        <legend>Experience 2</legend>
        <label>Company <input name="experience[1][company]" /></label>
        <label>Job title <input name="experience[1][title]" /></label>
      `;
      document.getElementById('experience-section')?.insertBefore(
        fieldset,
        document.getElementById('add-experience'),
      );
    });

    await expect(
      ensureStructuredRecordSlots(document, 'https://jobs.example.test', {
        experience: 2,
        education: 0,
      }),
    ).resolves.toEqual({ experience: 2, education: 0 });
    expect(ambiguousClicks).toBe(0);
  });
});