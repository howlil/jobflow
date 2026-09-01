import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import {
  APPLICATION_PRIORITIES,
  APPLICATION_STAGES,
  type ApplicationPriority,
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
  RecordCard,
  RecordHeader,
  Section,
  SectionHeader,
  SelectField,
  StatusMessage,
  TextField,
  TextareaField,
} from '../ui';
import { ApplicationDetail } from './ApplicationDetail';
import {
  ACTIVE_APPLICATION_STAGES,
  CLOSED_APPLICATION_STAGES,
  applicationIsClosed,
  applicationNeedsAction,
  focusApplications,
  localDateKey,
  type ApplicationView,
} from './application-focus';
import {
  PRIORITY_LABELS,
  STAGE_LABELS,
  displayDate,
  nextActionStatus,
} from './application-display';

const EMPTY_DRAFT: ApplicationDraft = {
  company: '',
  role: '',
  jobUrl: '',
  stage: 'saved',
  notes: '',
  source: '',
  contactName: '',
  contactEmail: '',
  nextAction: '',
  nextActionAt: '',
  deadline: '',
};

function draftFromApplication(application: JobApplication): ApplicationDraft {
  return {
    company: application.company,
    role: application.role,
    jobUrl: application.jobUrl ?? '',
    stage: application.stage,
    priority: application.priority,
    notes: application.notes ?? '',
    source: application.source ?? '',
    contactName: application.contactName ?? '',
    contactEmail: application.contactEmail ?? '',
    nextAction: application.nextAction ?? '',
    nextActionAt: application.nextActionAt ?? '',
    deadline: application.deadline ?? '',
  };
}

function PipelineCard({
  application,
  todayKey,
  showStage,
  showFollowUpNote,
  onOpen,
}: {
  application: JobApplication;
  todayKey: string;
  showStage: boolean;
  showFollowUpNote: boolean;
  onOpen: (application: JobApplication) => void;
}) {
  const closed = applicationIsClosed(application);
  const dueStatus = closed ? null : nextActionStatus(application, todayKey);
  const contextualDetail = application.contactName
    ? `Contact: ${application.contactName}`
    : application.source
      ? `Source: ${application.source}`
      : null;
  const followUpNote = application.notes?.trim();

  return (
    <RecordCard>
      <RecordHeader
        title={application.role}
        context={application.company}
        meta={`Updated ${displayDate(application.updatedAt)}`}
      />

      <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-app-subtle">
        {application.priority !== undefined ? (
          <span className="rounded-control border border-app-border px-2 py-1 text-app-ink">
            {PRIORITY_LABELS[application.priority]}
          </span>
        ) : null}
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

      {application.nextAction ? (
        <p className="m-0 text-xs font-medium text-app-text">
          Next: {application.nextAction}
        </p>
      ) : null}

      {application.deadline ? (
        <p className="m-0 text-xs text-app-subtle">
          Deadline: {displayDate(application.deadline)}
        </p>
      ) : null}

      {showFollowUpNote && followUpNote ? (
        <p className="m-0 whitespace-pre-wrap text-xs leading-5 text-app-text">
          {followUpNote}
        </p>
      ) : null}

      {contextualDetail !== null ? (
        <p className="m-0 text-xs text-app-subtle">{contextualDetail}</p>
      ) : null}

      <ActionRow>
        <Button
          aria-label={`View ${application.company} ${application.role} details`}
          variant="default"
          onClick={() => onOpen(application)}
        >
          View details
        </Button>
      </ActionRow>
    </RecordCard>
  );
}

export function ApplicationsWorkspace({
  service,
}: {
  service: ApplicationService;
}) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [draft, setDraft] = useState<ApplicationDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
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
    setSelectedApplicationId(null);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setFormOpen(true);
    setStatus(null);
    setError(null);
  }

  function openApplicationDetail(application: JobApplication) {
    setSelectedApplicationId(application.id);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setFormOpen(false);
    setStatus(null);
    setError(null);
  }

  function backToPipeline() {
    setSelectedApplicationId(null);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setFormOpen(false);
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

  async function completeFollowUp(id: string) {
    try {
      await service.update(id, { nextAction: '', nextActionAt: '' });
      setStatus('Follow-up completed.');
      await reload();
    } catch {
      setError('Could not complete this follow-up.');
    }
  }

  async function deleteApplication(id: string) {
    try {
      await service.delete(id);
      if (editingId === id) resetForm();
      if (selectedApplicationId === id) setSelectedApplicationId(null);
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
  const selectedApplication =
    selectedApplicationId === null
      ? null
      : (applications.find(
          (application) => application.id === selectedApplicationId,
        ) ?? null);

  const form = formOpen ? (
    <div className="grid gap-3 rounded-lg border border-app-border bg-app-surface p-3">
      <div className="grid gap-1">
        <h3 className="m-0 text-sm font-semibold text-app-ink">
          {editingId === null ? 'Add job' : 'Edit job'}
        </h3>
        <p className="m-0 text-xs text-app-subtle">
          Capture only the context needed to decide and execute the next move.
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
        <SelectField
          label="Priority"
          value={draft.priority ?? ''}
          onChange={(event) =>
            updateDraft({
              priority:
                event.target.value === ''
                  ? undefined
                  : (event.target.value as ApplicationPriority),
            })
          }
        >
          <option value="">No priority</option>
          {APPLICATION_PRIORITIES.map((priority) => (
            <option value={priority} key={priority}>
              {PRIORITY_LABELS[priority]}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Next action"
          placeholder="Tailor resume, follow up, prepare interview..."
          value={draft.nextAction ?? ''}
          onChange={(event) => updateDraft({ nextAction: event.target.value })}
        />
        <TextField
          label="Next action date"
          type="date"
          value={draft.nextActionAt ?? ''}
          onChange={(event) =>
            updateDraft({ nextActionAt: event.target.value })
          }
        />
        <TextField
          label="Application deadline"
          type="date"
          value={draft.deadline ?? ''}
          onChange={(event) => updateDraft({ deadline: event.target.value })}
        />
        <TextField
          label="Source"
          value={draft.source ?? ''}
          onChange={(event) => updateDraft({ source: event.target.value })}
        />
        <TextField
          label="Contact name"
          value={draft.contactName ?? ''}
          onChange={(event) => updateDraft({ contactName: event.target.value })}
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
  ) : null;

  const feedback = (
    <>
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
    </>
  );

  if (
    selectedApplication !== null &&
    formOpen &&
    editingId === selectedApplication.id
  ) {
    return (
      <Section id="applications">
        <SectionHeader
          title="Edit job"
          description={`${selectedApplication.company} · ${selectedApplication.role}`}
          action={
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          }
        />
        {feedback}
        {form}
      </Section>
    );
  }

  if (selectedApplication !== null) {
    return (
      <Section id="applications">
        {feedback}
        <ApplicationDetail
          application={selectedApplication}
          todayKey={todayKey}
          onBack={backToPipeline}
          onEdit={() => openEditForm(selectedApplication)}
          onDelete={() => deleteApplication(selectedApplication.id)}
          onChangeStage={(stage) => changeStage(selectedApplication.id, stage)}
          onCompleteAction={() => completeFollowUp(selectedApplication.id)}
        />
      </Section>
    );
  }

  return (
    <Section id="applications">
      <SectionHeader
        title="Job pipeline"
        description="See what needs attention, move opportunities forward, and keep the next action explicit."
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

      {feedback}
      {form}

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
                          onOpen={openApplicationDetail}
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
              onOpen={openApplicationDetail}
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
                        onOpen={openApplicationDetail}
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
