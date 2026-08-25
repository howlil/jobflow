import type {
  ApplicationVariant,
  BaseProfile,
  DocumentMetadata,
} from '../profile/profile-schema';

export type RecommendedDocuments = {
  resume: DocumentMetadata | null;
  coverLetter: DocumentMetadata | null;
};

function findById(
  documents: DocumentMetadata[],
  id: string | null | undefined,
): DocumentMetadata | null {
  if (!id) return null;
  return documents.find((document) => document.id === id) ?? null;
}

export function recommendDocumentsForVariant(
  profile: BaseProfile,
  variant: ApplicationVariant | undefined,
): RecommendedDocuments {
  const preferredResume = findById(
    profile.documents.resumes,
    variant?.preferredResumeId,
  );
  const preferredCoverLetter = findById(
    profile.documents.coverLetters,
    variant?.preferredCoverLetterId,
  );

  return {
    resume: preferredResume ?? profile.documents.resumes[0] ?? null,
    coverLetter:
      preferredCoverLetter ?? profile.documents.coverLetters[0] ?? null,
  };
}
