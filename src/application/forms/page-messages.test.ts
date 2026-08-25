import { describe, expect, it } from 'vitest';

import { isPageContextResponse } from './page-messages';

const baseContext = {
  analysis: null,
  variantRecommendation: null,
  activeVariantId: null,
  variantOptions: [],
  fileInputCount: 1,
  recommendedResume: null,
};

describe('isPageContextResponse', () => {
  it('accepts deterministic document field summaries', () => {
    expect(
      isPageContextResponse({
        ...baseContext,
        documentFields: [
          {
            fieldFingerprint: 'field-resume',
            fieldLabel: 'Resume / CV',
            intent: 'resume',
            evidence: ['label:resume'],
            recommendedDocument: {
              id: 'resume-backend',
              label: 'Backend resume',
              fileName: 'backend.pdf',
            },
          },
          {
            fieldFingerprint: 'field-attachment',
            fieldLabel: 'Attachment',
            intent: 'unknown',
            evidence: [],
            recommendedDocument: null,
          },
        ],
      }),
    ).toBe(true);
  });

  it('rejects invented document intents at the message boundary', () => {
    expect(
      isPageContextResponse({
        ...baseContext,
        documentFields: [
          {
            fieldFingerprint: 'field-attachment',
            fieldLabel: 'Attachment',
            intent: 'guess',
            evidence: [],
            recommendedDocument: null,
          },
        ],
      }),
    ).toBe(false);
  });

  it('rejects document summaries that cannot be attached deterministically', () => {
    expect(
      isPageContextResponse({
        ...baseContext,
        documentFields: [
          {
            fieldLabel: 'Resume',
            intent: 'resume',
            evidence: ['label:resume'],
            recommendedDocument: {
              label: 'Resume',
              fileName: 'resume.pdf',
            },
          },
        ],
      }),
    ).toBe(false);
  });
});
