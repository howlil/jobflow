import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { DocumentBlobRepository } from '../../application/documents/document-blob-repository';
import { createCvImportWorkflow } from '../../application/profile/cv-import-workflow';
import type { ProfileRepository } from '../../application/profile/profile-repository';
import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import { CvImportSection } from './CvImportSection';

const cvText = `
Maya Putri
Backend Software Engineer
maya@example.com

Skills
Go, PostgreSQL
`;

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

function createWorkflow(
  profileRepository: ProfileRepository,
  documentRepository: DocumentBlobRepository,
) {
  return createCvImportWorkflow({
    profileRepository,
    documentRepository,
    extractText: vi.fn().mockResolvedValue({ text: cvText }),
  });
}

describe('CvImportSection', () => {
  it('starts from an empty profile when storage has not been initialized', async () => {
    const { profileRepository, documentRepository } = createRepositories();
    vi.mocked(profileRepository.load).mockResolvedValue(null);

    render(
      <CvImportSection
        workflow={createWorkflow(profileRepository, documentRepository)}
      />,
    );

    fireEvent.change(screen.getByLabelText('Choose CV'), {
      target: {
        files: [new File([cvText], 'backend.txt', { type: 'text/plain' })],
      },
    });

    expect(await screen.findByText('Maya Putri')).toBeTruthy();
    expect(screen.queryByText('Your profile is not ready yet.')).toBeNull();
  });

  it('extracts locally but waits for explicit reviewed import', async () => {
    const { profileRepository, documentRepository } = createRepositories();
    render(
      <CvImportSection
        workflow={createWorkflow(profileRepository, documentRepository)}
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

    fireEvent.click(
      screen.getByRole('button', { name: 'Import selected data' }),
    );
    await waitFor(() =>
      expect(profileRepository.save).toHaveBeenCalledTimes(1),
    );

    const saved = vi.mocked(profileRepository.save).mock.calls[0]?.[0];
    expect(saved?.baseProfile.personal.legalName.first).toBe('Maya');
    expect(
      saved?.baseProfile.professional.skills.map((skill) => skill.name),
    ).toEqual(['Go', 'PostgreSQL']);
  });

  it('stores CV bytes only after Save CV locally', async () => {
    const { profileRepository, documentRepository } = createRepositories();
    render(
      <CvImportSection
        workflow={createWorkflow(profileRepository, documentRepository)}
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

    await waitFor(() =>
      expect(documentRepository.save).toHaveBeenCalledTimes(1),
    );
    expect(profileRepository.save).toHaveBeenCalledTimes(1);
  });

  it('imports reviewed CV data and stores the CV in one action', async () => {
    const { profileRepository, documentRepository } = createRepositories();
    render(
      <CvImportSection
        workflow={createWorkflow(profileRepository, documentRepository)}
      />,
    );

    await screen.findByText('No CV stored yet.');
    const file = new File([cvText], 'backend.txt', {
      type: 'text/plain',
      lastModified: 1780000000000,
    });
    fireEvent.change(screen.getByLabelText('Choose CV'), {
      target: { files: [file] },
    });
    await screen.findByText('Maya Putri');

    fireEvent.click(
      screen.getByRole('button', { name: 'Import data and save CV' }),
    );

    await waitFor(() =>
      expect(documentRepository.save).toHaveBeenCalledTimes(1),
    );
    await waitFor(() =>
      expect(profileRepository.save).toHaveBeenCalledTimes(1),
    );

    const saved = vi.mocked(profileRepository.save).mock.calls[0]?.[0];
    expect(saved?.baseProfile.personal.legalName.first).toBe('Maya');
    expect(saved?.baseProfile.contact.emails[0]?.value).toBe(
      'maya@example.com',
    );
    expect(
      saved?.baseProfile.professional.skills.map((skill) => skill.name),
    ).toEqual(['Go', 'PostgreSQL']);
    expect(saved?.baseProfile.documents.resumes[0]).toMatchObject({
      fileName: 'backend.txt',
      mimeType: 'text/plain',
      lastKnownModified: 1780000000000,
    });
  });
});
