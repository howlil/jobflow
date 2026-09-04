import { describe, expect, it } from 'vitest';

import { extractFieldContexts } from './extract-field-contexts';

describe('portal-shaped application forms', () => {
  it('extracts Workday-style custom comboboxes with options', () => {
    document.body.innerHTML = `
      <form aria-label="Job Application">
        <label for="country">Country</label>
        <button id="country" role="combobox" aria-haspopup="listbox" aria-controls="country-options">Indonesia</button>
        <div id="country-options" role="listbox">
          <div role="option" data-value="ID">Indonesia</div>
          <div role="option" data-value="SG">Singapore</div>
        </div>
      </form>
    `;

    const fields = extractFieldContexts(
      document,
      'https://acme.wd5.myworkdayjobs.com',
    );

    expect(fields).toHaveLength(1);
    expect(fields[0]).toMatchObject({
      controlKind: 'select',
      label: 'Country',
      options: [
        { value: 'ID', label: 'Indonesia' },
        { value: 'SG', label: 'Singapore' },
      ],
    });
  });

  it('extracts Google Forms-style ARIA radio groups as one field', () => {
    document.body.innerHTML = `
      <form aria-label="Software Engineer Job Application">
        <div role="radiogroup" aria-label="Are you authorized to work in this country?">
          <div role="radio" aria-label="Yes" data-value="Yes" aria-checked="false"></div>
          <div role="radio" aria-label="No" data-value="No" aria-checked="false"></div>
        </div>
      </form>
    `;

    const fields = extractFieldContexts(document, 'https://docs.google.com');

    expect(fields).toHaveLength(1);
    expect(fields[0]).toMatchObject({
      controlKind: 'radio',
      label: 'Are you authorized to work in this country?',
      options: [
        { value: 'Yes', label: 'Yes' },
        { value: 'No', label: 'No' },
      ],
    });
  });
});
