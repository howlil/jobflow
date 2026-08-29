import { describe, expect, it } from 'vitest';

import type { FieldContext } from '../../domain/forms/field-context';
import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import {
  analyzePageContext,
  toPageContextResponse,
} from './analyze-page-context';

function field(
  controlKind: FieldContext['controlKind'],
  label: string,
  fingerprint: string,
): FieldContext {
  return {
    controlKind,
    inputType: controlKind === 'file' ? 'file' : 'text',
    label,
    name: '',
    id: '',
    placeholder: '',
    ariaLabel: '',
    options: [],
    sectionText: '',
    origin: 'https://jobs.example.com',
    formFingerprint: 'form-1',
    fieldFingerprint: fingerprint,
  };
}

describe('analyzePageContext', () => {
  it('resolves one coherent page context from fields, profile, and variant override', () => {
    const envelope = createEmptyStoredProfile('2026-08-29T00:00:00.000Z');
    envelope.baseProfile.personal.legalName.first = 'Maya';
    envelope.baseProfile.documents.resumes.push({
      id: 'resume-1',
      label: 'Backend CV',
      fileName: 'backend.pdf',
      mimeType: 'application/pdf',
      lastKnownModified: 1780000000000,
    });
    envelope.variants.push({
      id: 'backend',
      name: 'Backend',
      targetRoles: ['Backend Engineer'],
      preferredResumeId: 'resume-1',
    });

    const context = analyzePageContext({
      fields: [
        field('input', 'First name', 'first-name'),
        field('file', 'Upload resume', 'resume-upload'),
      ],
      envelope,
      corrections: [],
      pageSignals: ['Backend Engineer'],
      variantOverrideId: 'backend',
    });

    expect(context.activeVariantId).toBe('backend');
    expect(context.variantOptions).toEqual([
      { id: 'backend', name: 'Backend' },
    ]);
    expect(context.analysis.summary.total).toBe(2);
    expect(context.documentFields).toHaveLength(1);
    expect(context.documentFields[0]).toMatchObject({
      fieldFingerprint: 'resume-upload',
      fieldLabel: 'Upload resume',
      intent: 'resume',
      recommendedDocument: { id: 'resume-1' },
    });

    expect(toPageContextResponse(context)).toMatchObject({
      analysis: context.analysis.summary,
      activeVariantId: 'backend',
      documentFields: [
        {
          fieldFingerprint: 'resume-upload',
          recommendedDocument: { id: 'resume-1' },
        },
      ],
    });
  });

  it('returns the stable empty response before analysis is available', () => {
    expect(toPageContextResponse(null)).toEqual({
      analysis: null,
      variantRecommendation: null,
      activeVariantId: null,
      variantOptions: [],
      documentFields: [],
    });
  });
});
