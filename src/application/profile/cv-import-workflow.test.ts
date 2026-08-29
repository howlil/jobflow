import { describe, expect, it, vi } from 'vitest';

import type { DocumentBlobRepository } from '../documents/document-blob-repository';
import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import type { ProfileRepository } from './profile-repository';
import { createCvImportWorkflow } from './cv-import-workflow';

function createRepositories() {
  const profileRepository: ProfileRepository = {
    load: vi.fn().mockResolvedValue(null),
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

describe('createCvImportWorkflow', () => {
  it('reports whether resume bytes exist in document storage', async () => {
    const { profileRepository, documentRepository } = createRepositories();
    vi.mocked(documentRepository.has).mockResolvedValue(true);
    const workflow = createCvImportWorkflow({
      profileRepository,
      documentRepository,
      extractText: vi.fn(),
    });

    await expect(workflow.hasStoredResume('resume-1')).resolves.toBe(true);
    expect(documentRepository.has).toHaveBeenCalledWith('resume-1');
  });

  it('removes newly stored bytes when profile persistence fails', async () => {
    const { profileRepository, documentRepository } = createRepositories();
    vi.mocked(profileRepository.save).mockRejectedValue(
      new Error('profile storage unavailable'),
    );
    const workflow = createCvImportWorkflow({
      profileRepository,
      documentRepository,
      extractText: vi.fn(),
      createId: () => 'resume-1',
      now: () => '2026-08-29T00:00:00.000Z',
    });
    const profile = createEmptyStoredProfile('2026-08-25T00:00:00.000Z');
    const file = new File(['resume'], 'resume.txt', { type: 'text/plain' });

    await expect(workflow.saveCvToLibrary(profile, file)).rejects.toThrow(
      'profile storage unavailable',
    );

    expect(documentRepository.save).toHaveBeenCalledWith('resume-1', file);
    expect(documentRepository.remove).toHaveBeenCalledWith('resume-1');
  });

  it('clears a removed resume from variant preferences before persistence', async () => {
    const { profileRepository, documentRepository } = createRepositories();
    const workflow = createCvImportWorkflow({
      profileRepository,
      documentRepository,
      extractText: vi.fn(),
      now: () => '2026-08-29T00:00:00.000Z',
    });
    const profile = createEmptyStoredProfile('2026-08-25T00:00:00.000Z');
    const resume = {
      id: 'resume-1',
      label: 'Backend CV',
      fileName: 'backend.pdf',
      mimeType: 'application/pdf',
      lastKnownModified: 1780000000000,
    };
    profile.baseProfile.documents.resumes.push(resume);
    profile.variants.push({
      id: 'variant-1',
      name: 'Backend',
      targetRoles: ['Backend Engineer'],
      preferredResumeId: resume.id,
    });

    const next = await workflow.removeResume(profile, resume);

    expect(next.baseProfile.documents.resumes).toEqual([]);
    expect(next.variants[0]?.preferredResumeId).toBeNull();
    expect(profileRepository.save).toHaveBeenCalledWith(next);
    expect(documentRepository.remove).toHaveBeenCalledWith(resume.id);
  });
});
