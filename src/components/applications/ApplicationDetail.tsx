import type { ReactNode } from 'react';
import { ArrowLeft, ExternalLink, Pencil, Trash2 } from 'lucide-react';

import {
  APPLICATION_SUBSTAGES_BY_STAGE,
  type ApplicationStage,
  type ApplicationSubstage,
  type JobApplication,
} from '../../domain/applications/application-schema';
import { ActionRow, Button, SectionHeader, SelectField } from '../ui';
import {
  ACTIVE_APPLICATION_STAGES,
  applicationIsClosed,
} from './application-focus';
import {
  PRIORITY_LABELS,
  STAGE_LABELS,
  SUBSTAGE_LABELS,
  applicationHasCompletableAction,
  displayDate,
  nextActionStatus,
  nextPipelineStage,
  previousPipelineStage,
  recommendedLifecycleAction,
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
    <section className="grid gap-3 border-t border-app-border pt-4 first:border-t-0 first:pt-0">
      <h3 className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-app-subtle">
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
      <span className="text-[13px] font-medium text-app-subtle">{label}</span>
      <div className="text-sm text-app-text">{children}</div>
    </div>
  );
}

function ProgressTrack({ application }: { application: JobApplication }) {
  const closed = applicationIsClosed(application);
  const activeStageIndex = closed
    ? ACTIVE_APPLICATION_STAGES.length - 1
    : ACTIVE_APPLICATION_STAGES.findIndex(
        (stage) => stage === application.stage,
      );

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
                className={`truncate text-xs font-medium ${
                  current ? 'text-app-ink' : 'text-app-subtle'
                }`}
              >
                {STAGE_LABELS[stage]}
              </span>
            </div>
          );
        })}
      </div>
      {closed ? (
        <p className="m-0 text-xs text-app-subtle">
          This opportunity is closed
          {application.substage === undefined
            ? '.'
            : ` as ${SUBSTAGE_LABELS[application.substage]}.`}
        </p>
      ) : null}
    </div>
  );
}

function defaultSubstageForStage(
  stage: ApplicationStage,
): ApplicationSubstage | undefined {
  if (stage === 'applying') return 'preparing_application';
  if (stage === 'applied') return 'submitted';
  if (stage === 'offer') return 'offer_received';
  return undefined;
}

export function ApplicationDetail({
  application,
  todayKey,
  onBack,
  onEdit,
  onDelete,
  onChangeStage,
  onChangeSubstage,
  onCompleteAction,
}: {
  application: JobApplication;
  todayKey: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
  onChangeStage: (
    stage: ApplicationStage,
    substage?: ApplicationSubstage,
  ) => void | Promise<void>;
  onChangeSubstage: (
    substage: ApplicationSubstage | undefined,
  ) => void | Promise<void>;
  onCompleteAction: () => void | Promise<void>;
}) {
  const closed = applicationIsClosed(application);
  const previousStage = previousPipelineStage(application.stage);
  const nextStage = nextPipelineStage(application.stage);
  const dueStatus = closed ? null : nextActionStatus(application, todayKey);
  const suggestedAction = recommendedLifecycleAction(application);
  const substages = APPLICATION_SUBSTAGES_BY_STAGE[application.stage];
  const contact = [application.contactName, application.contactEmail]
    .filter(Boolean)
    .join(' · ');
  const hasImportantDates =
    application.appliedAt !== undefined ||
    application.interviewAt !== undefined ||
    application.offerAt !== undefined ||
    application.closedAt !== undefined;

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

      <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium">
        <span className="rounded-control border border-app-border px-2 py-1 text-app-ink">
          {STAGE_LABELS[application.stage]}
        </span>
        {application.substage !== undefined ? (
          <span className="rounded-control border border-app-border px-2 py-1 text-app-text">
            {SUBSTAGE_LABELS[application.substage]}
          </span>
        ) : null}
        {application.priority !== undefined ? (
          <span className="rounded-control border border-app-border px-2 py-1 text-app-text">
            {PRIORITY_LABELS[application.priority]}
          </span>
        ) : null}
        <span className="text-app-subtle">
          Updated {displayDate(application.updatedAt)}
        </span>
      </div>

      <div className="grid gap-5 border-t border-app-border pt-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] xl:gap-8">
        <div className="grid content-start gap-4">
          <DetailBlock title="Next action">
            {application.nextAction !== undefined ? (
              <p className="m-0 text-base font-semibold text-app-ink">
                {application.nextAction}
              </p>
            ) : suggestedAction !== null ? (
              <div className="grid gap-1">
                <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-app-subtle">
                  Suggested next
                </span>
                <p className="m-0 text-sm font-medium text-app-text">
                  {suggestedAction}
                </p>
              </div>
            ) : (
              <p className="m-0 text-sm text-app-subtle">Lifecycle complete.</p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs text-app-subtle">
              {dueStatus !== null ? (
                <span className="rounded-control border border-app-warning/30 bg-app-warning-soft px-2 py-1 text-app-warning">
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

            {substages.length > 0 ? (
              <SelectField
                label="Lifecycle detail"
                value={application.substage ?? ''}
                onChange={(event) =>
                  void onChangeSubstage(
                    event.target.value === ''
                      ? undefined
                      : (event.target.value as ApplicationSubstage),
                  )
                }
              >
                {!closed ? <option value="">No lifecycle detail</option> : null}
                {substages.map((substage) => (
                  <option value={substage} key={substage}>
                    {SUBSTAGE_LABELS[substage]}
                  </option>
                ))}
              </SelectField>
            ) : null}

            {!closed ? (
              <>
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
                      onClick={() =>
                        void onChangeStage(
                          nextStage,
                          defaultSubstageForStage(nextStage),
                        )
                      }
                    >
                      {stageActionLabel(nextStage)}
                    </Button>
                  ) : null}
                </ActionRow>

                <div className="grid gap-2 border-t border-app-border pt-3">
                  <span className="text-[13px] font-medium text-app-subtle">
                    Close opportunity
                  </span>
                  <ActionRow>
                    {application.stage === 'offer' ? (
                      <Button
                        variant="default"
                        onClick={() => void onChangeStage('closed', 'accepted')}
                      >
                        Mark accepted
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      onClick={() => void onChangeStage('closed', 'rejected')}
                    >
                      Mark rejected
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => void onChangeStage('closed', 'withdrawn')}
                    >
                      Withdraw
                    </Button>
                  </ActionRow>
                </div>
              </>
            ) : null}
          </DetailBlock>

          <DetailBlock title="Timeline">
            <ol className="m-0 grid list-none gap-3 p-0">
              {[...application.stageHistory].reverse().map((entry, index) => (
                <li
                  className="grid gap-1 border-l-2 border-app-border pl-3"
                  key={`${entry.enteredAt}-${entry.stage}-${index}`}
                >
                  <span className="text-sm font-medium text-app-ink">
                    {entry.substage === undefined
                      ? STAGE_LABELS[entry.stage]
                      : SUBSTAGE_LABELS[entry.substage]}
                  </span>
                  <span className="text-xs text-app-subtle">
                    {STAGE_LABELS[entry.stage]} · {displayDate(entry.enteredAt)}
                  </span>
                </li>
              ))}
            </ol>
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

        <div className="grid content-start gap-4 xl:border-l xl:border-app-border xl:pl-8">
          <DetailBlock title="Important dates">
            {hasImportantDates ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                {application.appliedAt !== undefined ? (
                  <DetailValue label="Applied">
                    {displayDate(application.appliedAt)}
                  </DetailValue>
                ) : null}
                {application.interviewAt !== undefined ? (
                  <DetailValue label="Interview">
                    {displayDate(application.interviewAt)}
                  </DetailValue>
                ) : null}
                {application.offerAt !== undefined ? (
                  <DetailValue label="Offer">
                    {displayDate(application.offerAt)}
                  </DetailValue>
                ) : null}
                {application.closedAt !== undefined ? (
                  <DetailValue label="Closed">
                    {displayDate(application.closedAt)}
                  </DetailValue>
                ) : null}
              </div>
            ) : (
              <p className="m-0 text-sm text-app-subtle">
                Dates are captured as this opportunity advances.
              </p>
            )}
          </DetailBlock>

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
              {application.substage !== undefined ? (
                <DetailValue label="Lifecycle detail">
                  {SUBSTAGE_LABELS[application.substage]}
                </DetailValue>
              ) : null}
              {application.priority !== undefined ? (
                <DetailValue label="Priority">
                  {PRIORITY_LABELS[application.priority]}
                </DetailValue>
              ) : null}
            </div>
          </DetailBlock>

          <div className="flex justify-end border-t border-app-border pt-4">
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
