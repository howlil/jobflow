import { useEffect, useMemo, useRef, useState } from 'react';

import type { CvImportWorkflow } from '../../application/profile/cv-import-workflow';
import type {
  CvImportDraft,
  CvImportKey,
  CvImportPreviewItem,
} from '../../domain/profile/cv-import';
import type {
  DocumentMetadata,
  StoredProfileEnvelope,
} from '../../domain/profile/profile-schema';

const ACCEPTED_FILES =
  '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';

function fileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function initialSelection(preview: CvImportPreviewItem[]): Set<CvImportKey> {
  return new Set(
    preview.filter((item) => item.status === 'new').map((item) => item.key),
  );
}

async function readResumeAvailability(
  workflow: CvImportWorkflow,
  profile: StoredProfileEnvelope,
): Promise<Record<string, boolean>> {
  const entries = await Promise.all(
    profile.baseProfile.documents.resumes.map(
      async (document) =>
        [
          document.id,
          await workflow.hasStoredResume(document.id),
        ] as const,
    ),
  );
  return Object.fromEntries(entries);
}

type CvImportSectionProps = {
  workflow: CvImportWorkflow;
  onProfileChanged?: () => void;
};

export function CvImportSection({
  workflow,
  onProfileChanged,
}: CvImportSectionProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<StoredProfileEnvelope | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<CvImportDraft | null>(null);
  const [preview, setPreview] = useState<CvImportPreviewItem[]>([]);
  const [selected, setSelected] = useState<Set<CvImportKey>>(new Set());
  const [resumeAvailability, setResumeAvailability] = useState<
    Record<string, boolean>
  >({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void workflow.loadProfile().then(async (stored) => {
      const availability = await readResumeAvailability(workflow, stored);
      if (active) {
        setProfile(stored);
        setResumeAvailability(availability);
      }
    });
    return () => {
      active = false;
    };
  }, [workflow]);

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
    setBusy(true);

    try {
      const prepared = await workflow.prepare(nextFile, profile);
      setProfile(prepared.profile);
      setDraft(prepared.draft);
      setPreview(prepared.preview);
      setSelected(initialSelection(prepared.preview));
      setMessage(
        prepared.preview.length > 0
          ? `Found ${prepared.preview.length} profile candidates. Review them before importing.`
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
      const next = await workflow.applySelected(profile, draft, selected);
      setProfile(next);
      setMessage(`Imported ${selected.size} reviewed profile groups.`);
      onProfileChanged?.();
    } catch {
      setError(
        'Could not apply the selected CV data. Your existing profile was left unchanged.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function importSelectedAndSaveCv() {
    if (
      profile === null ||
      draft === null ||
      file === null ||
      selected.size === 0
    )
      return;
    setBusy(true);
    setError(null);

    try {
      const next = await workflow.importSelectedAndSaveCv(
        profile,
        draft,
        selected,
        file,
      );
      setProfile(next);
      setResumeAvailability(await readResumeAvailability(workflow, next));
      setMessage(
        `Imported ${selected.size} reviewed profile groups and stored ${file.name}.`,
      );
      onProfileChanged?.();
    } catch {
      setError(
        'Could not import the selected CV data and file. Your existing profile was left unchanged.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveCvToLibrary() {
    if (profile === null || file === null) return;
    setBusy(true);
    setError(null);

    try {
      const next = await workflow.saveCvToLibrary(profile, file);
      setProfile(next);
      setResumeAvailability(await readResumeAvailability(workflow, next));
      setMessage(
        `${file.name} is stored locally and can be attached from Job Flow.`,
      );
      onProfileChanged?.();
    } catch {
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
      const next = await workflow.removeResume(profile, document);
      setProfile(next);
      setResumeAvailability(await readResumeAvailability(workflow, next));
      setMessage(`Removed ${document.fileName}.`);
      onProfileChanged?.();
    } catch {
      setError('Could not remove this CV.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="workspace-tool-section"
      id="cv-import"
      aria-labelledby="cv-import-title"
    >
      <div className="workspace-tool-section__header">
        <div>
          <p className="workspace-kicker">Documents</p>
          <h2 id="cv-import-title">Resumes</h2>
        </div>
        <p>
          Resume entries represent files stored locally by Job Flow. They can be
          selected by application variants and attached only after you approve
          the action.
        </p>
      </div>

      <div className="workspace-card">
        <div className="jobflow-section-heading">
          <div>
            <strong>Stored resumes</strong>
            <p className="muted" style={{ margin: '4px 0 0' }}>
              Files remain on this browser in extension-owned IndexedDB.
            </p>
          </div>
          <span className="jobflow-chip jobflow-chip-strong">
            {resumes.length}
          </span>
        </div>
        {resumes.length === 0 ? (
          <div className="jobflow-empty-row">No CV stored yet.</div>
        ) : (
          <div className="document-list">
            {resumes.map((document) => {
              const available = resumeAvailability[document.id];
              return (
                <div className="document-row" key={document.id}>
                  <div className="document-row__meta">
                    <strong>{document.label || document.fileName}</strong>
                    <span>{document.fileName}</span>
                    {available === false ? (
                      <span className="text-red-700">
                        File unavailable · remove this legacy entry and add the
                        CV again.
                      </span>
                    ) : null}
                  </div>
                  <button
                    className="jobflow-button jobflow-button-danger"
                    type="button"
                    disabled={busy}
                    onClick={() => void removeResume(document)}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="jobflow-section-heading">
        <div>
          <h3>Add or import CV</h3>
          <p className="muted">
            PDF and DOCX extraction runs locally. Choosing a file never
            overwrites your profile; conflicting values stay unselected until
            you approve them.
          </p>
        </div>
      </div>

      <div className="cv-dropzone">
        <div className="cv-dropzone__content">
          <div className="workspace-brand__mark" aria-hidden="true">
            CV
          </div>
          <h3>{file ? file.name : 'Choose your CV'}</h3>
          <p>
            {file
              ? `${fileSize(file.size)} · ${file.type || 'document'}`
              : 'Text-based PDF, DOCX, or TXT. Scanned PDFs stay unsupported rather than guessed.'}
          </p>
          <input
            ref={fileInput}
            className="jobflow-visually-hidden"
            type="file"
            accept={ACCEPTED_FILES}
            aria-label="Choose CV"
            onChange={(event) => {
              const nextFile = event.target.files?.[0];
              if (nextFile) void chooseFile(nextFile);
            }}
          />
          <button
            className="jobflow-button jobflow-button-primary"
            type="button"
            disabled={busy}
            onClick={() => fileInput.current?.click()}
          >
            {file ? 'Choose another CV' : 'Choose CV'}
          </button>
          {file ? (
            <button
              className="jobflow-button"
              type="button"
              disabled={busy || profile === null}
              onClick={() => void saveCvToLibrary()}
            >
              Save CV locally
            </button>
          ) : null}
        </div>
      </div>

      <div className="workspace-card">
        <div className="jobflow-section-heading">
          <div>
            <strong>Review extracted data</strong>
            <p className="muted" style={{ margin: '4px 0 0' }}>
              {conflicts > 0
                ? `${conflicts} conflicts require an explicit choice.`
                : 'New values are selected automatically; existing values are preserved.'}
            </p>
          </div>
          {preview.length > 0 ? (
            <span className="jobflow-chip jobflow-chip-strong">
              {selectedCount} selected
            </span>
          ) : null}
        </div>

        {busy && draft === null ? (
          <p className="muted">Extracting locally…</p>
        ) : null}
        {error ? (
          <p className="jobflow-status jobflow-status-danger" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="jobflow-status" role="status">
            {message}
          </p>
        ) : null}

        {preview.length === 0 && !busy ? (
          <div className="jobflow-empty-row">
            Choose a CV to preview extracted profile data.
          </div>
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
                  <small
                    style={{
                      display: 'block',
                      marginTop: 4,
                      color: 'var(--jobflow-color-muted)',
                    }}
                  >
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
              className="jobflow-button jobflow-button-accent"
              type="button"
              disabled={busy || selected.size === 0 || file === null}
              onClick={() => void importSelectedAndSaveCv()}
            >
              Import data and save CV
            </button>
            <button
              className="jobflow-button"
              type="button"
              disabled={busy || selected.size === 0}
              onClick={() => void applySelected()}
            >
              Import selected data
            </button>
            <button
              className="jobflow-button jobflow-button-ghost"
              type="button"
              disabled={busy}
              onClick={() => setSelected(new Set())}
            >
              Clear selection
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
