import { describe, expect, it } from 'vitest';

import { createEmptyStoredProfile } from '../profile/create-empty-profile';
import { recommendDocumentsForVariant } from './recommend-document';

describe('recommendDocumentsForVariant', () => {
  it('uses the variant preferred resume and cover letter when present', () => {
    const stored = createEmptyStoredProfile();
    stored.baseProfile.documents.resumes = [
      {
        id: 'general-resume',
        label: 'General resume',
        fileName: 'general.pdf',
        mimeType: 'application/pdf',
        lastKnownModified: null,
      },
      {
        id: 'backend-resume',
        label: 'Backend resume',
        fileName: 'backend.pdf',
        mimeType: 'application/pdf',
        lastKnownModified: null,
      },
    ];
    stored.baseProfile.documents.coverLetters = [
      {
        id: 'backend-cover',
        label: 'Backend cover letter',
        fileName: 'backend-cover.pdf',
        mimeType: 'application/pdf',
        lastKnownModified: null,
      },
    ];

    const result = recommendDocumentsForVariant(stored.baseProfile, {
      id: 'backend',
      name: 'Backend Engineer',
      targetRoles: ['Backend Engineer'],
      preferredResumeId: 'backend-resume',
      preferredCoverLetterId: 'backend-cover',
    });

    expect(result.resume?.id).toBe('backend-resume');
    expect(result.coverLetter?.id).toBe('backend-cover');
  });

  it('falls back to the first configured document when preference is missing', () => {
    const stored = createEmptyStoredProfile();
    stored.baseProfile.documents.resumes = [
      {
        id: 'general-resume',
        label: 'General resume',
        fileName: 'general.pdf',
        mimeType: 'application/pdf',
        lastKnownModified: null,
      },
    ];

    expect(
      recommendDocumentsForVariant(stored.baseProfile, undefined).resume?.id,
    ).toBe('general-resume');
  });
});
