import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DocumentBlobRepository } from '../../application/documents/document-blob-repository';
import type { ProfileRepository } from '../../application/profile/profile-repository';
import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import { extractCvText } from '../../infrastructure/documents/extract-cv-text';
import { CvImportSection } from './CvImportSection';

vi.mock('../../infrastructure/documents/extract-cv-text', () => ({
  isSupportedCvFile: () => true,
  extractCvText: vi.fn(),
}));

function createRepositories() {
  const profile = createEmptyStoredProfile('2026-08-25T00:00:00.000Z');
  const profileRepository: ProfileRepository = {
    load: vi.fn().mockResolvedValue(profile),
    save: vi.fn().mockResolvedValue(undefined),
  };
  const documentRepository: DocumentBlobRepository = {
    save: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(null),
    remove: vi.fn().mockResolvedValue(undefined),
    has: vi.fn().mockResolvedValue(false),
  };
  return { profileRepository, documentRepository };
}

const cvText = `
Maya Putri
Backend Software Engineer
maya@example.com

Skills
Go, PostgreSQL
`;

describe('CvImportSection', () => {
  beforeEach(() => {
    vi.mocked(extractCvText).mockResolvedValue({ text: cvText, format: 'text' });
  });

  it('extracts locally but waits for explicit reviewed import', async () => {
    const { profileRepository, documentRepository } = createRepositories();
    render(
      <CvImportSection
        profileRepository={profileRepository}
        documentRepository={documentRepository}
      />,
    );

    await screen.findByText('No CV stored yet.');
    const file = new File([cvText], 'backend.txt', { type: 'text/plain' });
    fireEvent.change(screen.getByLabelText('Choose CV'), {
      target: { files: [file] },
    });

    expect(await screen.findByText('Maya Putri')).toBeTruthy();
    expect(screen.getByText('Backend Software Engineer')).toBeTruthy();
    expect(profileRepository.save).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Import selected data' }));
    await waitFor(() => expect(profileRepository.save).toHaveBeenCalledTimes(1));

    const saved = vi.mocked(profileRepository.save).mock.calls[0]?.[0];
    expect(saved?.baseProfile.personal.legalName.first).toBe('Maya');
    expect(saved?.baseProfile.professional.skills.map((skill) => skill.name)).toEqual([
      'Go',
      'PostgreSQL',
    ]);
  });

  it('stores CV bytes only after Save CV locally', async () => {
    const { profileRepository, documentRepository } = createRepositories();
    render(
      <CvImportSection
        profileRepository={profileRepository}
        documentRepository={documentRepository}
      />,
    );

    await screen.findByText('No CV stored yet.');
    const file = new File([cvText], 'backend.txt', { type: 'text/plain' });
    fireEvent.change(screen.getByLabelText('Choose CV'), {
      target: { files: [file] },
    });
    await screen.findByText('Maya Putri');

    expect(documentRepository.save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Save CV locally' }));

    await waitFor(() => expect(documentRepository.save).toHaveBeenCalledTimes(1));
    expect(profileRepository.save).toHaveBeenCalledTimes(1);
  });
});
