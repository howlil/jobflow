import type { DocumentBlobRepository } from '../documents/document-blob-repository';
import {
  applyCvImport,
  createCvImportPreview,
  parseCvText,
  type CvImportDraft,
  type CvImportKey,
  type CvImportPreviewItem,
} from '../../domain/profile/cv-import';
import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import type {
  DocumentMetadata,
  StoredProfileEnvelope,
} from '../../domain/profile/profile-schema';
import type { ProfileRepository } from './profile-repository';

export type CvTextExtractor = (file: File) => Promise<{ text: string }>;

export type CvImportPreparation = {
  profile: StoredProfileEnvelope;
  draft: CvImportDraft;
  preview: CvImportPreviewItem[];
};

export type CvImportWorkflow = {
  loadProfile(): Promise<StoredProfileEnvelope>;
  prepare(
    file: File,
    currentProfile?: StoredProfileEnvelope | null,
  ): Promise<CvImportPreparation>;
  applySelected(
    profile: StoredProfileEnvelope,
    draft: CvImportDraft,
    selected: ReadonlySet<CvImportKey>,
  ): Promise<StoredProfileEnvelope>;
  importSelectedAndSaveCv(
    profile: StoredProfileEnvelope,
    draft: CvImportDraft,
    selected: ReadonlySet<CvImportKey>,
    file: File,
  ): Promise<StoredProfileEnvelope>;
  saveCvToLibrary(
    profile: StoredProfileEnvelope,
    file: File,
  ): Promise<StoredProfileEnvelope>;
  removeResume(
    profile: StoredProfileEnvelope,
    document: DocumentMetadata,
  ): Promise<StoredProfileEnvelope>;
};

type CvImportWorkflowDependencies = {
  profileRepository: ProfileRepository;
  documentRepository: DocumentBlobRepository;
  extractText: CvTextExtractor;
  createId?: () => string;
  now?: () => string;
};

function metadataForFile(file: File, id: string): DocumentMetadata {
  return {
    id,
    label: file.name.replace(/\.[^.]+$/, '') || 'Resume',
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    lastKnownModified: file.lastModified,
  };
}

export function createCvImportWorkflow({
  profileRepository,
  documentRepository,
  extractText,
  createId = () => globalThis.crypto.randomUUID(),
  now = () => new Date().toISOString(),
}: CvImportWorkflowDependencies): CvImportWorkflow {
  async function loadProfile(): Promise<StoredProfileEnvelope> {
    return (await profileRepository.load()) ?? createEmptyStoredProfile();
  }

  async function prepare(
    file: File,
    currentProfile?: StoredProfileEnvelope | null,
  ): Promise<CvImportPreparation> {
    const profile = currentProfile ?? (await loadProfile());
    const extraction = await extractText(file);
    const draft = parseCvText(extraction.text);
    const preview = createCvImportPreview(profile, draft);
    return { profile, draft, preview };
  }

  async function applySelected(
    profile: StoredProfileEnvelope,
    draft: CvImportDraft,
    selected: ReadonlySet<CvImportKey>,
  ): Promise<StoredProfileEnvelope> {
    const next = applyCvImport(profile, draft, selected, createId);
    await profileRepository.save(next);
    return next;
  }

  async function importSelectedAndSaveCv(
    profile: StoredProfileEnvelope,
    draft: CvImportDraft,
    selected: ReadonlySet<CvImportKey>,
    file: File,
  ): Promise<StoredProfileEnvelope> {
    const id = createId();
    const metadata = metadataForFile(file, id);

    try {
      await documentRepository.save(id, file);
      const next = applyCvImport(profile, draft, selected, createId);
      next.baseProfile.documents.resumes.push(metadata);
      next.metadata.updatedAt = now();
      await profileRepository.save(next);
      return next;
    } catch (error) {
      await documentRepository.remove(id).catch(() => undefined);
      throw error;
    }
  }

  async function saveCvToLibrary(
    profile: StoredProfileEnvelope,
    file: File,
  ): Promise<StoredProfileEnvelope> {
    const id = createId();
    const metadata = metadataForFile(file, id);

    try {
      await documentRepository.save(id, file);
      const next = structuredClone(profile);
      next.baseProfile.documents.resumes.push(metadata);
      next.metadata.updatedAt = now();
      await profileRepository.save(next);
      return next;
    } catch (error) {
      await documentRepository.remove(id).catch(() => undefined);
      throw error;
    }
  }

  async function removeResume(
    profile: StoredProfileEnvelope,
    document: DocumentMetadata,
  ): Promise<StoredProfileEnvelope> {
    const next = structuredClone(profile);
    next.baseProfile.documents.resumes = next.baseProfile.documents.resumes.filter(
      (item) => item.id !== document.id,
    );
    next.variants = next.variants.map((variant) =>
      variant.preferredResumeId === document.id
        ? { ...variant, preferredResumeId: null }
        : variant,
    );
    next.metadata.updatedAt = now();

    await profileRepository.save(next);
    await documentRepository.remove(document.id).catch(() => undefined);
    return next;
  }

  return {
    loadProfile,
    prepare,
    applySelected,
    importSelectedAndSaveCv,
    saveCvToLibrary,
    removeResume,
  };
}
