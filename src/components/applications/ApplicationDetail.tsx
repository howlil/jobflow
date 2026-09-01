import type { ReactNode } from 'react';
import { ArrowLeft, ExternalLink, Pencil, Trash2 } from 'lucide-react';

import type {
  ApplicationStage,
  JobApplication,
} from '../../domain/applications/application-schema';
import { ActionRow, Button, SectionHeader } from '../ui';
import {
  ACTIVE_APPLICATION_STAGES,
  applicationIsClosed,
} from './application-focus';
import {
  PRIORITY_LABELS,
  STAGE_LABELS,
  applicationHasCompletableAction,
  displayDate,
  nextActionStatus,
  nextPipelineStage,
  previousPipelineStage,
  stageActionLabel,
} from './application-display';

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-3 rounded-lg border border-app-border bg-app-surface p-4">
      <h3 className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-app-subtle">
        {title}
      </h3>
      {children}
    </section>
  );
}

function DetailValue({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <span className="text-[11px] font-medium text-app-subtle">{label}</span>
      <div className="text-sm text-app-text">{children}</div>
    </div>
  );
}

function ProgressTrack({ application }: { application: JobApplication }) {
  const activeStageIndex = ACTIVE_APPLICATION_STAGES.indexOf(application.stage);

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-5 gap-1" aria-label="Application progress">
        {ACTIVE_APPLICATION_STAGES.map((stage, index) => {
          const current = application.stage === stage;
          const reached = activeStageIndex >= index;
          return (
            <div className="grid min-w-0 gap-1" key={stage}>
              <span
                aria-hidden="true"
                className={`h-1 rounded-full ${
                  reached ? 'bg-app-ink' : 'bg-app-border'
                }`}
              />
              <span
                className={`truncate text-[10px] font-medium ${
                  current ? 'text-app-ink' : 'text-app-subtle'
                }`}
              >
                {STAGE_LABELS[stage]}
              </span>
            </div>
          );
        })}
      </div>
      {applicationIsClosed(application) ? (
        <p className="m-0 text-xs text-app-subtle">
          This opportunity is closed as {STAGE_LABELS[application.stage]}.
        </p>
      ) : null}
    </div>
  );
}

export function ApplicationDetail({
  application,
  todayKey,
  onBack,
  onEdit,
  onDelete,
  onChangeStage,
  onCompleteAction,
}: {
  application: JobApplication;
  todayKey: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
  onChangeStage: (stage: ApplicationStage) => void | Promise<void>;
  onCompleteAction: () => void | Promise<void>;
}) {
  const closed = applicationIsClosed(application);
  const previousStage = previousPipelineStage(application.stage);
  const nextStage = nextPipelineStage(application.stage);
  const dueStatus = closed ? null : nextActionStatus(application, todayKey);
  const contact = [application.contactName, application.contactEmail]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className="grid gap-5"
      aria-label={`${application.company} application detail`}
    >
      <div>
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft aria-hidden="true" size={15} />
          Back to pipeline
        </Button>
      </div>

      <SectionHeader
        title={application.role}
        description={application.company}
        action={
          <Button variant="default" onClick={onEdit}>
            <Pencil aria-hidden="true" size={14} />
            Edit details
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
        <span className="rounded-control border border-app-border px-2 py-1 text-app-ink">
          {STAGE_LABELS[application.stage]}
        </span>
        {application.priority !== undefined ? (
          <span className="rounded-control border border-app-border px-2 py-1 text-app-text">
            {PRIORITY_LABELS[application.priority]}
          </span>
        ) : null}
        <span className="text-app-subtle">
          Updated {displayDate(application.updatedAt)}
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <div className="grid content-start gap-4">
          <DetailBlock title="Next action">
            {application.nextAction !== undefined ? (
              <p className="m-0 text-base font-semibold text-app-ink">
                {application.nextAction}
              </p>
            ) : (
              <p className="m-0 text-sm text-app-subtle">No next action set.</p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs text-app-subtle">
              {dueStatus !== null ? (
                <span className="rounded-control border border-amber-200 bg-amber-50 px-2 py-1 text-amber-800">
                  {dueStatus}
                </span>
              ) : null}
              {application.deadline !== undefined ? (
                <span>
                  Application deadline {displayDate(application.deadline)}
                </span>
              ) : null}
            </div>
            {applicationHasCompletableAction(application) ? (
              <ActionRow>
                <Button
                  variant="primary"
                  onClick={() => void onCompleteAction()}
                >
                  Mark done
                </Button>
              </ActionRow>
            ) : null}
          </DetailBlock>

          <DetailBlock title="Progress">
            <ProgressTrack application={application} />
            {!closed ? (
              <ActionRow>
                {previousStage !== null ? (
                  <Button
                    variant="ghost"
                    onClick={() => void onChangeStage(previousStage)}
                  >
                    ← {STAGE_LABELS[previousStage]}
                  </Button>
                ) : null}
                {nextStage !== null ? (
                  <Button
                    variant="default"
                    onClick={() => void onChangeStage(nextStage)}
                  >
                    {stageActionLabel(application.stage, nextStage)}
                  </Button>
                ) : null}
              </ActionRow>
            ) : null}
          </DetailBlock>

          <DetailBlock title="Notes">
            {application.notes !== undefined ? (
              <p className="m-0 whitespace-pre-wrap text-sm leading-6 text-app-text">
                {application.notes}
              </p>
            ) : (
              <p className="m-0 text-sm text-app-subtle">No notes yet.</p>
            )}
          </DetailBlock>
        </div>

        <div className="grid content-start gap-4">
          <DetailBlock title="Job context">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {application.source !== undefined ? (
                <DetailValue label="Source">{application.source}</DetailValue>
              ) : null}
              {contact !== '' ? (
                <DetailValue label="Contact">{contact}</DetailValue>
              ) : null}
              {application.jobUrl !== undefined ? (
                <DetailValue label="Job posting">
                  <a
                    className="inline-flex items-center gap-1 font-medium text-app-ink underline underline-offset-4"
                    href={application.jobUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open job
                    <ExternalLink aria-hidden="true" size={13} />
                  </a>
                </DetailValue>
              ) : null}
              {application.deadline !== undefined ? (
                <DetailValue label="Application deadline">
                  {displayDate(application.deadline)}
                </DetailValue>
              ) : null}
            </div>
          </DetailBlock>

          <DetailBlock title="Application">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <DetailValue label="Company">{application.company}</DetailValue>
              <DetailValue label="Role">{application.role}</DetailValue>
              <DetailValue label="Stage">
                {STAGE_LABELS[application.stage]}
              </DetailValue>
              {application.priority !== undefined ? (
                <DetailValue label="Priority">
                  {PRIORITY_LABELS[application.priority]}
                </DetailValue>
              ) : null}
            </div>
          </DetailBlock>

          <div className="flex justify-end">
            <Button variant="danger" onClick={() => void onDelete()}>
              <Trash2 aria-hidden="true" size={14} />
              Delete job
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
