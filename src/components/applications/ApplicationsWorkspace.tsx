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
} from '../ui';
import {
  ACTIVE_APPLICATION_STAGES,
  CLOSED_APPLICATION_STAGES,
  applicationIsClosed,
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

function nextPipelineStage(stage: ApplicationStage): ApplicationStage | null {
  const index = ACTIVE_APPLICATION_STAGES.findIndex((item) => item === stage);
  if (index < 0) return null;
  if (stage === 'offer') return 'accepted';
  return ACTIVE_APPLICATION_STAGES[index + 1] ?? null;
}

function previousPipelineStage(
  stage: ApplicationStage,
): ApplicationStage | null {
  const index = ACTIVE_APPLICATION_STAGES.findIndex((item) => item === stage);
  if (index <= 0) return null;
  return ACTIVE_APPLICATION_STAGES[index - 1] ?? null;
}

function PipelineCard({
  application,
  todayKey,
  showStage,
  showFollowUpNote,
  onEdit,
  onDelete,
  onChangeStage,
}: {
  application: JobApplication;
  todayKey: string;
  showStage: boolean;
  showFollowUpNote: boolean;
  onEdit: (application: JobApplication) => void;
  onDelete: (id: string) => void | Promise<void>;
  onChangeStage: (id: string, stage: ApplicationStage) => void | Promise<void>;
}) {
  const closed = applicationIsClosed(application);
  const dueStatus = closed ? null : nextActionStatus(application, todayKey);
  const previousStage = previousPipelineStage(application.stage);
  const nextStage = nextPipelineStage(application.stage);
  const contextualDetail = application.contactName
    ? `Contact: ${application.contactName}`
    : application.source
      ? `Source: ${application.source}`
      : null;
  const followUpNote = application.notes?.trim();

  return (
    <RecordCard
      action={
        <div className="flex gap-1">
          <IconButton
            aria-label={`Edit ${application.company} ${application.role}`}
            size="xs"
            onClick={() => onEdit(application)}
          >
            <Pencil aria-hidden="true" size={14} />
          </IconButton>
          <IconButton
            aria-label={`Delete ${application.company} ${application.role}`}
            size="xs"
            tone="danger"
            onClick={() => void onDelete(application.id)}
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

      <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-app-subtle">
        {showStage ? (
          <span className="rounded-control border border-app-border px-2 py-1 text-app-text">
            {STAGE_LABELS[application.stage]}
          </span>
        ) : null}
        {dueStatus !== null ? (
          <span className="rounded-control border border-amber-200 bg-amber-50 px-2 py-1 text-amber-800">
            {dueStatus}
          </span>
        ) : null}
      </div>

      {showFollowUpNote && followUpNote ? (
        <p className="m-0 whitespace-pre-wrap text-xs leading-5 text-app-text">
          {followUpNote}
        </p>
      ) : null}

      {contextualDetail !== null ? (
        <p className="m-0 text-xs text-app-subtle">{contextualDetail}</p>
      ) : null}

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

      {!closed ? (
        <ActionRow>
          {previousStage !== null ? (
            <Button
              variant="ghost"
              onClick={() => void onChangeStage(application.id, previousStage)}
            >
              ← {STAGE_LABELS[previousStage]}
            </Button>
          ) : null}
          {nextStage !== null ? (
            <Button
              variant="default"
              onClick={() => void onChangeStage(application.id, nextStage)}
            >
              {stageActionLabel(application.stage, nextStage)}
            </Button>
          ) : null}
        </ActionRow>
      ) : null}
    </RecordCard>
  );
}

function stageActionLabel(
  currentStage: ApplicationStage,
  nextStage: ApplicationStage,
): string {
  if (currentStage === 'offer' && nextStage === 'accepted') {
    return 'Mark accepted';
  }
  return `${STAGE_LABELS[nextStage]} →`;
}

export function ApplicationsWorkspace({
  service,
}: {
  service: ApplicationService;
}) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [draft, setDraft] = useState<ApplicationDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [applicationView, setApplicationView] =
    useState<ApplicationView>('board');

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

  function resetForm() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setFormOpen(false);
    setError(null);
  }

  function openCreateForm() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setFormOpen(true);
    setStatus(null);
    setError(null);
  }

  function openEditForm(application: JobApplication) {
    setEditingId(application.id);
    setDraft(draftFromApplication(application));
    setFormOpen(true);
    setStatus(null);
    setError(null);
  }

  function updateDraft(changes: Partial<ApplicationDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
    setStatus(null);
    setError(null);
  }

  async function submitDraft() {
    try {
      if (editingId === null) {
        await service.create(draft);
        setStatus('Job added to pipeline.');
      } else {
        await service.update(editingId, draft);
        setStatus('Job updated.');
      }
      setDraft(EMPTY_DRAFT);
      setEditingId(null);
      setFormOpen(false);
      await reload();
    } catch {
      setError('Company, role, and a valid URL are required before saving.');
    }
  }

  async function changeStage(id: string, stage: ApplicationStage) {
    try {
      await service.changeStage(id, stage);
      setStatus(`Moved to ${STAGE_LABELS[stage]}.`);
      await reload();
    } catch {
      setError('Could not update this job stage.');
    }
  }

  async function deleteApplication(id: string) {
    try {
      await service.delete(id);
      if (editingId === id) resetForm();
      setStatus('Job deleted.');
      await reload();
    } catch {
      setError('Could not delete this job.');
    }
  }

  const todayKey = localDateKey(new Date());
  const activeCount = applications.filter(
    (application) => !applicationIsClosed(application),
  ).length;
  const closedCount = applications.length - activeCount;
  const actionableCount = applications.filter((application) =>
    applicationNeedsAction(application, todayKey),
  ).length;
  const opportunityLabel = activeCount === 1 ? 'opportunity' : 'opportunities';
  const visibleApplications = focusApplications(applications, {
    query,
    view: applicationView,
    todayKey,
  });

  return (
    <Section id="applications">
      <SectionHeader
        title="Job pipeline"
        description="Move opportunities through the hiring funnel and keep follow-ups visible."
        action={
          formOpen ? (
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          ) : (
            <Button variant="primary" onClick={openCreateForm}>
              <Plus aria-hidden="true" size={15} />
              Add job
            </Button>
          )
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

      {formOpen ? (
        <div className="grid gap-3 rounded-lg border border-app-border bg-app-surface p-3">
          <div className="grid gap-1">
            <h3 className="m-0 text-sm font-semibold text-app-ink">
              {editingId === null ? 'Add job' : 'Edit job'}
            </h3>
            <p className="m-0 text-xs text-app-subtle">
              Keep the board focused; full job details live here while you add
              or edit an opportunity.
            </p>
          </div>
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
              label="Next action"
              type="date"
              value={draft.nextActionAt ?? ''}
              onChange={(event) =>
                updateDraft({ nextActionAt: event.target.value })
              }
            />
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
          </FieldGrid>
          <TextareaField
            label="Notes"
            value={draft.notes ?? ''}
            onChange={(event) => updateDraft({ notes: event.target.value })}
          />
          <ActionRow>
            <Button variant="primary" onClick={() => void submitDraft()}>
              {editingId === null ? 'Add to pipeline' : 'Save changes'}
            </Button>
          </ActionRow>
        </div>
      ) : null}

      <div className="grid gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <TextField
            className="min-w-0 flex-1"
            label="Search jobs"
            placeholder="Company or role"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div
            aria-label="Pipeline view"
            className="flex shrink-0 flex-wrap gap-2"
            role="group"
          >
            <Button
              aria-pressed={applicationView === 'board'}
              variant={applicationView === 'board' ? 'primary' : 'default'}
              onClick={() => setApplicationView('board')}
            >
              Board
            </Button>
            <Button
              aria-pressed={applicationView === 'needs-action'}
              variant={
                applicationView === 'needs-action' ? 'primary' : 'default'
              }
              onClick={() => setApplicationView('needs-action')}
            >
              Needs action {actionableCount}
            </Button>
            <Button
              aria-pressed={applicationView === 'closed'}
              variant={applicationView === 'closed' ? 'primary' : 'default'}
              onClick={() => setApplicationView('closed')}
            >
              Closed {closedCount}
            </Button>
          </div>
        </div>
        <p className="m-0 text-xs text-app-subtle">
          {activeCount} active {opportunityLabel} · {actionableCount} need
          action
        </p>
      </div>

      {loading ? (
        <p className="m-0 text-xs text-app-text">Loading pipeline...</p>
      ) : applications.length === 0 ? (
        <EmptyState>No jobs in your pipeline yet.</EmptyState>
      ) : visibleApplications.length === 0 ? (
        <EmptyState>No jobs match this view.</EmptyState>
      ) : applicationView === 'board' ? (
        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[1100px] grid-cols-5 gap-3">
            {ACTIVE_APPLICATION_STAGES.map((stage) => {
              const items = visibleApplications.filter(
                (application) => application.stage === stage,
              );
              return (
                <section
                  className="grid content-start gap-3 rounded-lg border border-app-border bg-app-muted/30 p-3"
                  key={stage}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="m-0 text-xs font-semibold uppercase tracking-[0.05em] text-app-ink">
                      {STAGE_LABELS[stage]}
                    </h3>
                    <span className="text-[11px] font-medium text-app-subtle">
                      {items.length}
                    </span>
                  </div>
                  {items.length === 0 ? (
                    <EmptyState className="min-h-16 py-3">No jobs</EmptyState>
                  ) : (
                    <div className="grid gap-3">
                      {items.map((application) => (
                        <PipelineCard
                          key={application.id}
                          application={application}
                          todayKey={todayKey}
                          showStage={false}
                          showFollowUpNote={false}
                          onEdit={openEditForm}
                          onDelete={deleteApplication}
                          onChangeStage={changeStage}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      ) : applicationView === 'needs-action' ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleApplications.map((application) => (
            <PipelineCard
              key={application.id}
              application={application}
              todayKey={todayKey}
              showStage
              showFollowUpNote
              onEdit={openEditForm}
              onDelete={deleteApplication}
              onChangeStage={changeStage}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          {CLOSED_APPLICATION_STAGES.map((stage) => {
            const items = visibleApplications.filter(
              (application) => application.stage === stage,
            );
            return (
              <section
                className="grid content-start gap-3 rounded-lg border border-app-border bg-app-muted/30 p-3"
                key={stage}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="m-0 text-xs font-semibold uppercase tracking-[0.05em] text-app-ink">
                    {STAGE_LABELS[stage]}
                  </h3>
                  <span className="text-[11px] font-medium text-app-subtle">
                    {items.length}
                  </span>
                </div>
                {items.length === 0 ? (
                  <EmptyState className="min-h-16 py-3">No jobs</EmptyState>
                ) : (
                  <div className="grid gap-3">
                    {items.map((application) => (
                      <PipelineCard
                        key={application.id}
                        application={application}
                        todayKey={todayKey}
                        showStage={false}
                        showFollowUpNote={false}
                        onEdit={openEditForm}
                        onDelete={deleteApplication}
                        onChangeStage={changeStage}
                      />
                    ))}
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