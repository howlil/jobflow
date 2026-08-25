import { useEffect, useMemo, useRef, useState } from 'react';

import type { DocumentBlobRepository } from '../../application/documents/document-blob-repository';
import type { ProfileRepository } from '../../application/profile/profile-repository';
import {
  applyCvImport,
  createCvImportPreview,
  parseCvText,
  type CvImportDraft,
  type CvImportKey,
  type CvImportPreviewItem,
} from '../../domain/profile/cv-import';
import type {
  DocumentMetadata,
  StoredProfileEnvelope,
} from '../../domain/profile/profile-schema';
import {
  extractCvText,
  isSupportedCvFile,
} from '../../infrastructure/documents/extract-cv-text';

const ACCEPTED_FILES = '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';

function fileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function initialSelection(preview: CvImportPreviewItem[]): Set<CvImportKey> {
  return new Set(
    preview
      .filter((item) => item.status === 'new')
      .map((item) => item.key),
  );
}

type CvImportSectionProps = {
  profileRepository: ProfileRepository;
  documentRepository: DocumentBlobRepository;
  onProfileChanged?: () => void;
};

export function CvImportSection({
  profileRepository,
  documentRepository,
  onProfileChanged,
}: CvImportSectionProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<StoredProfileEnvelope | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<CvImportDraft | null>(null);
  const [preview, setPreview] = useState<CvImportPreviewItem[]>([]);
  const [selected, setSelected] = useState<Set<CvImportKey>>(new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void profileRepository.load().then((stored) => {
      if (active) setProfile(stored);
    });
    return () => {
      active = false;
    };
  }, [profileRepository]);

  const resumes = profile?.baseProfile.documents.resumes ?? [];
  const selectedCount = selected.size;
  const conflicts = useMemo(
    () => preview.filter((item) => item.status === 'conflict').length,
    [preview],
  );

  async function chooseFile(nextFile: File) {
    setError(null);
    setMessage(null);
    setDraft(null);
    setPreview([]);
    setSelected(new Set());
    setFile(nextFile);

    if (!isSupportedCvFile(nextFile)) {
      setError('Use a PDF, DOCX, or TXT CV.');
      return;
    }
    if (profile === null) {
      setError('Your profile is not ready yet.');
      return;
    }

    setBusy(true);
    try {
      const extraction = await extractCvText(nextFile);
      const nextDraft = parseCvText(extraction.text);
      const nextPreview = createCvImportPreview(profile, nextDraft);
      setDraft(nextDraft);
      setPreview(nextPreview);
      setSelected(initialSelection(nextPreview));
      setMessage(
        nextPreview.length > 0
          ? `Found ${nextPreview.length} profile candidates. Review them before importing.`
          : 'No supported profile fields were found. You can still save this CV to your document library.',
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not extract this CV locally.',
      );
    } finally {
      setBusy(false);
    }
  }

  function toggle(key: CvImportKey) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function applySelected() {
    if (profile === null || draft === null || selected.size === 0) return;
    setBusy(true);
    setError(null);
    try {
      const next = applyCvImport(
        profile,
        draft,
        selected,
        () => globalThis.crypto.randomUUID(),
      );
      await profileRepository.save(next);
      setProfile(next);
      setMessage(`Imported ${selected.size} reviewed profile groups.`);
      onProfileChanged?.();
    } catch {
      setError('Could not apply the selected CV data. Your existing profile was left unchanged.');
    } finally {
      setBusy(false);
    }
  }

  async function saveCvToLibrary() {
    if (profile === null || file === null) return;
    setBusy(true);
    setError(null);
    const id = globalThis.crypto.randomUUID();
    const metadata: DocumentMetadata = {
      id,
      label: file.name.replace(/\.[^.]+$/, '') || 'Resume',
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      lastKnownModified: file.lastModified,
    };

    try {
      await documentRepository.save(id, file);
      const next = structuredClone(profile);
      next.baseProfile.documents.resumes.push(metadata);
      next.metadata.updatedAt = new Date().toISOString();
      await profileRepository.save(next);
      setProfile(next);
      setMessage(`${file.name} is stored locally and can be attached from Fillio.`);
      onProfileChanged?.();
    } catch {
      await documentRepository.remove(id).catch(() => undefined);
      setError('Could not save this CV to local document storage.');
    } finally {
      setBusy(false);
    }
  }

  async function removeResume(document: DocumentMetadata) {
    if (profile === null) return;
    setBusy(true);
    setError(null);
    try {
      const next = structuredClone(profile);
      next.baseProfile.documents.resumes = next.baseProfile.documents.resumes.filter(
        (item) => item.id !== document.id,
      );
      next.variants = next.variants.map((variant) =>
        variant.preferredResumeId === document.id
          ? { ...variant, preferredResumeId: null }
          : variant,
      );
      next.metadata.updatedAt = new Date().toISOString();
      await profileRepository.save(next);
      await documentRepository.remove(document.id).catch(() => undefined);
      setProfile(next);
      setMessage(`Removed ${document.fileName}.`);
      onProfileChanged?.();
    } catch {
      setError('Could not remove this CV.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="workspace-tool-section" id="cv-import" aria-labelledby="cv-import-title">
      <div className="workspace-tool-section__header">
        <div>
          <p className="workspace-kicker">Documents</p>
          <h2 id="cv-import-title">Import from CV</h2>
        </div>
        <p>
          PDF and DOCX extraction runs locally. Choosing a file never overwrites your profile; conflicting values stay unselected until you approve them.
        </p>
      </div>

      <div className="cv-import-grid">
        <div>
          <div className="cv-dropzone">
            <div className="cv-dropzone__content">
              <div className="workspace-brand__mark" aria-hidden="true">CV</div>
              <h3>{file ? file.name : 'Choose your CV'}</h3>
              <p>
                {file
                  ? `${fileSize(file.size)} · ${file.type || 'document'}`
                  : 'Text-based PDF, DOCX, or TXT. Scanned PDFs stay unsupported rather than guessed.'}
              </p>
              <input
                ref={fileInput}
                className="fillio-visually-hidden"
                type="file"
                accept={ACCEPTED_FILES}
                aria-label="Choose CV"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0];
                  if (nextFile) void chooseFile(nextFile);
                }}
              />
              <button
                className="fillio-button fillio-button-primary"
                type="button"
                disabled={busy}
                onClick={() => fileInput.current?.click()}
              >
                {file ? 'Choose another CV' : 'Choose CV'}
              </button>
              {file ? (
                <button
                  className="fillio-button"
                  type="button"
                  disabled={busy || profile === null}
                  onClick={() => void saveCvToLibrary()}
                >
                  Save CV locally
                </button>
              ) : null}
            </div>
          </div>

          <div className="workspace-card" style={{ marginTop: 16 }}>
            <div className="fillio-section-heading">
              <div>
                <strong>Stored resumes</strong>
                <p className="muted" style={{ margin: '4px 0 0' }}>
                  Files remain on this browser in extension-owned IndexedDB.
                </p>
              </div>
              <span className="fillio-chip fillio-chip-strong">{resumes.length}</span>
            </div>
            {resumes.length === 0 ? (
              <div className="fillio-empty-row">No CV stored yet.</div>
            ) : (
              <div className="document-list">
                {resumes.map((document) => (
                  <div className="document-row" key={document.id}>
                    <div className="document-row__meta">
                      <strong>{document.label || document.fileName}</strong>
                      <span>{document.fileName}</span>
                    </div>
                    <button
                      className="fillio-button fillio-button-danger"
                      type="button"
                      disabled={busy}
                      onClick={() => void removeResume(document)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="workspace-card">
          <div className="fillio-section-heading">
            <div>
              <strong>Review extracted data</strong>
              <p className="muted" style={{ margin: '4px 0 0' }}>
                {conflicts > 0
                  ? `${conflicts} conflicts require an explicit choice.`
                  : 'New values are selected automatically; existing values are preserved.'}
              </p>
            </div>
            {preview.length > 0 ? (
              <span className="fillio-chip fillio-chip-strong">{selectedCount} selected</span>
            ) : null}
          </div>

          {busy && draft === null ? <p className="muted">Extracting locally…</p> : null}
          {error ? <p className="fillio-status fillio-status-danger" role="alert">{error}</p> : null}
          {message ? <p className="fillio-status" role="status">{message}</p> : null}

          {preview.length === 0 && !busy ? (
            <div className="fillio-empty-row">Choose a CV to preview extracted profile data.</div>
          ) : (
            <div className="cv-preview">
              {preview.map((item) => (
                <label className="cv-preview__row" key={item.key}>
                  <input
                    type="checkbox"
                    checked={selected.has(item.key)}
                    onChange={() => toggle(item.key)}
                  />
                  <span className="cv-preview__label">
                    {item.label}
                    {item.status === 'conflict' ? (
                      <span className="cv-preview__conflict"> · conflict</span>
                    ) : null}
                  </span>
                  <span className="cv-preview__value">
                    {item.extracted}
                    <small style={{ display: 'block', marginTop: 4, color: 'var(--fillio-color-muted)' }}>
                      {item.evidence}
                      {item.status === 'conflict' && item.current
                        ? ` · current: ${item.current}`
                        : ''}
                    </small>
                  </span>
                </label>
              ))}
            </div>
          )}

          {preview.length > 0 ? (
            <div className="button-row" style={{ marginTop: 16 }}>
              <button
                className="fillio-button fillio-button-accent"
                type="button"
                disabled={busy || selected.size === 0}
                onClick={() => void applySelected()}
              >
                Import selected data
              </button>
              <button
                className="fillio-button fillio-button-ghost"
                type="button"
                disabled={busy}
                onClick={() => setSelected(new Set())}
              >
                Clear selection
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
