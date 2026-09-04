import { describe, expect, it } from 'vitest';

import type { FieldContext } from './field-context';
import { classifyApplicationPage } from './page-classifier';

function field(
  label: string,
  origin: string,
  inputType = 'text',
): FieldContext {
  return {
    controlKind: inputType === 'file' ? 'file' : 'input',
    inputType,
    label,
    name: label.toLowerCase().replace(/\s+/g, '-'),
    id: '',
    placeholder: '',
    ariaLabel: '',
    options: [],
    sectionText: '',
    origin,
    formFingerprint: 'form-1',
    fieldFingerprint: `field-${label}`,
  };
}

describe('classifyApplicationPage', () => {
  it('activates on Workday candidate forms', () => {
    const origin = 'https://acme.wd5.myworkdayjobs.com';
    const result = classifyApplicationPage({
      fields: [
        field('First Name', origin),
        field('Last Name', origin),
        field('Email', origin),
        field('Phone', origin),
      ],
      pageSignals: ['Software Engineer'],
    });

    expect(result).toMatchObject({
      kind: 'workday',
      supported: true,
      confidence: 'high',
    });
  });

  it('activates on recruitment Google Forms', () => {
    const origin = 'https://docs.google.com';
    const result = classifyApplicationPage({
      fields: [
        field('Full name', origin),
        field('Email', origin),
        field('LinkedIn', origin),
        field('Resume / CV', origin, 'file'),
        field('Work experience', origin),
      ],
      pageSignals: ['Software Engineer Job Application'],
    });

    expect(result).toMatchObject({ kind: 'google-forms', supported: true });
  });

  it('does not activate on ordinary Google Forms surveys', () => {
    const origin = 'https://docs.google.com';
    const result = classifyApplicationPage({
      fields: [
        field('Name', origin),
        field('Email', origin),
        field('Feedback', origin),
      ],
      pageSignals: ['Product feedback survey'],
    });

    expect(result).toMatchObject({ kind: 'non-job-page', supported: false });
  });

  it('activates on generic employer application forms with strong job signals', () => {
    const origin = 'https://careers.example.com';
    const result = classifyApplicationPage({
      fields: [
        field('First name', origin),
        field('Email', origin),
        field('Resume', origin, 'file'),
      ],
      pageSignals: ['Apply for Backend Engineer'],
    });

    expect(result).toMatchObject({
      kind: 'generic-job-application',
      supported: true,
    });
  });

  it('stays inactive on arbitrary sites with generic inputs', () => {
    const origin = 'https://example.com';
    const result = classifyApplicationPage({
      fields: [
        field('Search', origin),
        field('Email', origin),
        field('Comment', origin),
      ],
      pageSignals: ['News and articles'],
    });

    expect(result).toMatchObject({ kind: 'non-job-page', supported: false });
  });
});
