import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';

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
import {
  ActionRow,
  Button,
  Chip,
  EmptyState,
  FilePicker,
  IconButton,
  SectionHeader,
  StatusMessage,
} from '../design-system/primitives';

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
        [document.id, await workflow.hasStoredResume(document.id)] as const,
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
      <SectionHeader
        eyebrow="Documents"
        title={<span id="cv-import-title">Resumes</span>}
        description="Resume entries represent files stored locally by Job Flow. They can be selected by application variants and attached only after you approve the action."
      />

      <div className="workspace-card">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-1">
            <strong className="text-sm font-semibold text-app-ink">
              Stored resumes
            </strong>
            <p className="m-0 text-xs leading-5 text-app-text">
              Files remain on this browser in extension-owned IndexedDB.
            </p>
          </div>
          <Chip strong>{resumes.length}</Chip>
        </div>
        {resumes.length === 0 ? (
          <EmptyState>No CV stored yet.</EmptyState>
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
                  <IconButton
                    size="xs"
                    tone="danger"
                    aria-label={`Remove ${document.fileName}`}
                    title={`Remove ${document.fileName}`}
                    disabled={busy}
                    onClick={() => void removeResume(document)}
                  >
                    <Trash2 aria-hidden="true" size={14} />
                  </IconButton>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <h3 className="m-0 text-sm font-semibold text-app-ink">
          Add or import CV
        </h3>
        <p className="m-0 max-w-3xl text-xs leading-5 text-app-text">
          PDF and DOCX extraction runs locally. Choosing a file never overwrites
          your profile; conflicting values stay unselected until you approve
          them.
        </p>
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
          <ActionRow className="justify-center">
            <FilePicker
              accept={ACCEPTED_FILES}
              disabled={busy}
              inputLabel="Choose CV"
              onFile={chooseFile}
              label={file ? 'Choose another CV' : 'Choose CV'}
            />
            {file ? (
              <Button
                disabled={busy || profile === null}
                onClick={() => void saveCvToLibrary()}
              >
                Save CV locally
              </Button>
            ) : null}
          </ActionRow>
        </div>
      </div>

      <div className="workspace-card">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-1">
            <strong className="text-sm font-semibold text-app-ink">
              Review extracted data
            </strong>
            <p className="m-0 text-xs leading-5 text-app-text">
              {conflicts > 0
                ? `${conflicts} conflicts require an explicit choice.`
                : 'New values are selected automatically; existing values are preserved.'}
            </p>
          </div>
          {preview.length > 0 ? (
            <Chip strong>{selectedCount} selected</Chip>
          ) : null}
        </div>

        {busy && draft === null ? (
          <p className="m-0 text-xs leading-5 text-app-text">
            Extracting locally…
          </p>
        ) : null}
        {error ? (
          <StatusMessage tone="danger" role="alert">
            {error}
          </StatusMessage>
        ) : null}
        {message ? (
          <StatusMessage role="status">{message}</StatusMessage>
        ) : null}

        {preview.length === 0 && !busy ? (
          <EmptyState>
            Choose a CV to preview extracted profile data.
          </EmptyState>
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
                    <span className="text-amber-700"> · conflict</span>
                  ) : null}
                </span>
                <span className="cv-preview__value">
                  {item.extracted}
                  <small className="mt-1 block text-[11px] leading-4 text-app-subtle">
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
          <ActionRow>
            <Button
              variant="primary"
              disabled={busy || selected.size === 0 || file === null}
              onClick={() => void importSelectedAndSaveCv()}
            >
              Import data and save CV
            </Button>
            <Button
              disabled={busy || selected.size === 0}
              onClick={() => void applySelected()}
            >
              Import selected data
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => setSelected(new Set())}
            >
              Clear selection
            </Button>
          </ActionRow>
        ) : null}
      </div>
    </section>
  );
}
