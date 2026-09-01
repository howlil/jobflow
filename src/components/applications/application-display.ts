import type {
  ApplicationPriority,
  ApplicationStage,
  JobApplication,
} from '../../domain/applications/application-schema';
import {
  ACTIVE_APPLICATION_STAGES,
  applicationIsClosed,
} from './application-focus';

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  saved: 'Saved',
  applied: 'Applied',
  assessment: 'Assessment',
  interview: 'Interview',
  offer: 'Offer',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export const PRIORITY_LABELS: Record<ApplicationPriority, string> = {
  p0: 'P0 · Apply ASAP',
  p1: 'P1 · Strong target',
  p2: 'P2 · Consider',
  p3: 'P3 · Low priority',
};

export function displayDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function nextActionStatus(
  application: JobApplication,
  todayKey: string,
): string | null {
  if (application.nextActionAt === undefined) return null;
  const actionKey = application.nextActionAt.slice(0, 10);

  if (actionKey < todayKey) return `Overdue ${application.nextActionAt}`;
  if (actionKey === todayKey) return 'Due today';
  return `Next ${application.nextActionAt}`;
}

export function nextPipelineStage(
  stage: ApplicationStage,
): ApplicationStage | null {
  const index = ACTIVE_APPLICATION_STAGES.findIndex((item) => item === stage);
  if (index < 0) return null;
  if (stage === 'offer') return 'accepted';
  return ACTIVE_APPLICATION_STAGES[index + 1] ?? null;
}

export function previousPipelineStage(
  stage: ApplicationStage,
): ApplicationStage | null {
  const index = ACTIVE_APPLICATION_STAGES.findIndex((item) => item === stage);
  if (index <= 0) return null;
  return ACTIVE_APPLICATION_STAGES[index - 1] ?? null;
}

export function stageActionLabel(
  currentStage: ApplicationStage,
  nextStage: ApplicationStage,
): string {
  if (currentStage === 'offer' && nextStage === 'accepted') {
    return 'Mark accepted';
  }
  return `${STAGE_LABELS[nextStage]} →`;
}

export function applicationHasCompletableAction(
  application: JobApplication,
): boolean {
  return (
    !applicationIsClosed(application) &&
    (application.nextAction !== undefined ||
      application.nextActionAt !== undefined)
  );
}
