import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import {
  APPLICATION_STAGES,
  type ApplicationStage,
  type JobApplication,
} from '../../domain/applications/application-schema';
import type {
  ApplicationDraft,
  ApplicationService,
} from '../../application/applications/application-service';
import {
  ActionRow,
  Button,
  EmptyState,
  FieldGrid,
  IconButton,
  RecordCard,
  RecordHeader,
  Section,
  SectionHeader,
  SelectField,
  StatusMessage,
  TextField,
  TextareaField,
} from '../design-system/primitives';
import {
  applicationNeedsAction,
  focusApplications,
  localDateKey,
  type ApplicationView,
} from './application-focus';

const STAGE_LABELS: Record<ApplicationStage, string> = {
  saved: 'Saved',
  applied: 'Applied',
  assessment: 'Assessment',
  interview: 'Interview',
  offer: 'Offer',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

const EMPTY_DRAFT: ApplicationDraft = {
  company: '',
  role: '',
  jobUrl: '',
  stage: 'saved',
  notes: '',
  source: '',
  contactName: '',
  contactEmail: '',
  nextActionAt: '',
};

function displayDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function draftFromApplication(application: JobApplication): ApplicationDraft {
  return {
    company: application.company,
    role: application.role,
    jobUrl: application.jobUrl ?? '',
    stage: application.stage,
    notes: application.notes ?? '',
    source: application.source ?? '',
    contactName: application.contactName ?? '',
    contactEmail: application.contactEmail ?? '',
    nextActionAt: application.nextActionAt ?? '',
  };
}

function nextActionStatus(
  application: JobApplication,
  todayKey: string,
): string | null {
  if (application.nextActionAt === undefined) return null;
  const actionKey = application.nextActionAt.slice(0, 10);

  if (actionKey < todayKey) return `Overdue ${application.nextActionAt}`;
  if (actionKey === todayKey) return 'Due today';
  return `Next ${application.nextActionAt}`;
}

export function ApplicationsWorkspace({
  service,
}: {
  service: ApplicationService;
}) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [draft, setDraft] = useState<ApplicationDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [applicationView, setApplicationView] =
    useState<ApplicationView>('all');

  async function reload(active = true) {
    try {
      const next = await service.list();
      if (!active) return;
      setApplications(next);
      setError(null);
    } catch {
      if (active) setError('Could not load saved applications.');
    } finally {
      if (active) setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    void reload(active);
    return () => {
      active = false;
    };
  }, [service]);

  function updateDraft(changes: Partial<ApplicationDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
    setStatus(null);
    setError(null);
  }

  async function submitDraft() {
    try {
      if (editingId === null) {
        await service.create(draft);
        setStatus('Application saved.');
      } else {
        await service.update(editingId, draft);
        setStatus('Application updated.');
      }
      setDraft(EMPTY_DRAFT);
      setEditingId(null);
      await reload();
    } catch {
      setError('Company, role, and a valid URL are required before saving.');
    }
  }

  async function changeStage(id: string, stage: ApplicationStage) {
    try {
      await service.changeStage(id, stage);
      setStatus('Application stage updated.');
      await reload();
    } catch {
      setError('Could not update this application stage.');
    }
  }

  async function deleteApplication(id: string) {
    try {
      await service.delete(id);
      if (editingId === id) {
        setEditingId(null);
        setDraft(EMPTY_DRAFT);
      }
      setStatus('Application deleted.');
      await reload();
    } catch {
      setError('Could not delete this application.');
    }
  }

  const submitLabel =
    editingId === null ? 'Create application' : 'Save changes';
  const todayKey = localDateKey(new Date());
  const actionableCount = applications.filter((application) =>
    applicationNeedsAction(application, todayKey),
  ).length;
  const visibleApplications = focusApplications(applications, {
    query,
    view: applicationView,
    todayKey,
  });

  return (
    <Section id="applications">
      <SectionHeader
        title="Applications"
        description="Track local job applications and move each record between pipeline stages."
        action={
          editingId !== null ? (
            <Button
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                setDraft(EMPTY_DRAFT);
                setError(null);
              }}
            >
              Cancel edit
            </Button>
          ) : null
        }
      />

      {error !== null ? (
        <StatusMessage tone="danger" role="alert">
          {error}
        </StatusMessage>
      ) : null}
      {status !== null ? (
        <StatusMessage tone="success" role="status">
          {status}
        </StatusMessage>
      ) : null}

      <div className="grid gap-4 border-y border-app-border py-4">
        <FieldGrid>
          <TextField
            label="Company"
            value={draft.company}
            onChange={(event) => updateDraft({ company: event.target.value })}
          />
          <TextField
            label="Role"
            value={draft.role}
            onChange={(event) => updateDraft({ role: event.target.value })}
          />
          <TextField
            label="Job URL"
            type="url"
            value={draft.jobUrl ?? ''}
            onChange={(event) => updateDraft({ jobUrl: event.target.value })}
          />
          <SelectField
            label="Stage"
            value={draft.stage}
            onChange={(event) =>
              updateDraft({ stage: event.target.value as ApplicationStage })
            }
          >
            {APPLICATION_STAGES.map((stage) => (
              <option value={stage} key={stage}>
                {STAGE_LABELS[stage]}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Source"
            value={draft.source ?? ''}
            onChange={(event) => updateDraft({ source: event.target.value })}
          />
          <TextField
            label="Contact name"
            value={draft.contactName ?? ''}
            onChange={(event) =>
              updateDraft({ contactName: event.target.value })
            }
          />
          <TextField
            label="Contact email"
            type="email"
            value={draft.contactEmail ?? ''}
            onChange={(event) =>
              updateDraft({ contactEmail: event.target.value })
            }
          />
          <TextField
            label="Next action"
            type="date"
            value={draft.nextActionAt ?? ''}
            onChange={(event) =>
              updateDraft({ nextActionAt: event.target.value })
            }
          />
        </FieldGrid>
        <TextareaField
          label="Notes"
          value={draft.notes ?? ''}
          onChange={(event) => updateDraft({ notes: event.target.value })}
        />
        <ActionRow>
          <Button variant="primary" onClick={() => void submitDraft()}>
            <Plus aria-hidden="true" size={15} />
            {submitLabel}
          </Button>
        </ActionRow>
      </div>

      <div className="grid gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <TextField
            className="min-w-0 flex-1"
            label="Search applications"
            placeholder="Company or role"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div
            aria-label="Application view"
            className="flex shrink-0 gap-2"
            role="group"
          >
            <Button
              aria-pressed={applicationView === 'all'}
              variant={applicationView === 'all' ? 'primary' : 'default'}
              onClick={() => setApplicationView('all')}
            >
              All
            </Button>
            <Button
              aria-pressed={applicationView === 'needs-action'}
              variant={
                applicationView === 'needs-action' ? 'primary' : 'default'
              }
              onClick={() => setApplicationView('needs-action')}
            >
              Needs action
            </Button>
          </div>
        </div>
        <p className="m-0 text-xs text-app-subtle">
          {actionableCount === 1
            ? '1 application needs attention.'
            : `${actionableCount} applications need attention.`}
        </p>
      </div>

      {loading ? (
        <p className="m-0 text-xs text-app-text">Loading applications...</p>
      ) : applications.length === 0 ? (
        <EmptyState>No applications saved yet.</EmptyState>
      ) : visibleApplications.length === 0 ? (
        <EmptyState>No applications match this view.</EmptyState>
      ) : (
        <div className="grid gap-6">
          {APPLICATION_STAGES.map((stage) => {
            const items = visibleApplications.filter(
              (application) => application.stage === stage,
            );
            return (
              <section className="grid gap-3" key={stage}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="m-0 text-sm font-semibold text-app-ink">
                    {STAGE_LABELS[stage]}
                  </h3>
                  <span className="text-[11px] font-medium text-app-subtle">
                    {items.length}
                  </span>
                </div>
                {items.length === 0 ? (
                  <EmptyState className="min-h-10 py-2">
                    No applications in this stage.
                  </EmptyState>
                ) : (
                  <div className="grid gap-3">
                    {items.map((application) => {
                      const dueStatus = nextActionStatus(application, todayKey);
                      return (
                        <RecordCard
                          key={application.id}
                          action={
                            <div className="flex gap-1">
                              <IconButton
                                aria-label={`Edit ${application.company} ${application.role}`}
                                size="xs"
                                onClick={() => {
                                  setEditingId(application.id);
                                  setDraft(draftFromApplication(application));
                                  setStatus(null);
                                  setError(null);
                                }}
                              >
                                <Pencil aria-hidden="true" size={14} />
                              </IconButton>
                              <IconButton
                                aria-label={`Delete ${application.company} ${application.role}`}
                                size="xs"
                                tone="danger"
                                onClick={() =>
                                  void deleteApplication(application.id)
                                }
                              >
                                <Trash2 aria-hidden="true" size={14} />
                              </IconButton>
                            </div>
                          }
                        >
                          <RecordHeader
                            title={application.role}
                            context={application.company}
                            meta={`Updated ${displayDate(application.updatedAt)}`}
                          />
                          {application.jobUrl !== undefined ? (
                            <a
                              className="w-max text-xs font-medium text-app-ink underline underline-offset-4"
                              href={application.jobUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open job
                            </a>
                          ) : null}
                          <div className="flex flex-wrap gap-2 text-[11px] font-medium text-app-subtle">
                            {dueStatus !== null ? (
                              <span className="rounded-control border border-amber-200 bg-amber-50 px-2 py-1 text-amber-800">
                                {dueStatus}
                              </span>
                            ) : null}
                            {application.source !== undefined ? (
                              <span>Source: {application.source}</span>
                            ) : null}
                            {application.contactName !== undefined ? (
                              <span>Contact: {application.contactName}</span>
                            ) : null}
                          </div>
                          {application.notes !== undefined ? (
                            <p className="m-0 text-xs leading-5 text-app-text">
                              {application.notes}
                            </p>
                          ) : null}
                          <SelectField
                            label="Move stage"
                            value={application.stage}
                            onChange={(event) =>
                              void changeStage(
                                application.id,
                                event.target.value as ApplicationStage,
                              )
                            }
                          >
                            {APPLICATION_STAGES.map((nextStage) => (
                              <option value={nextStage} key={nextStage}>
                                {STAGE_LABELS[nextStage]}
                              </option>
                            ))}
                          </SelectField>
                        </RecordCard>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </Section>
  );
}
