import type {
  ApplicationPriority,
  ApplicationStage,
  ApplicationSubstage,
  JobApplication,
} from '../../domain/applications/application-schema';
import {
  ACTIVE_APPLICATION_STAGES,
  applicationIsClosed,
} from './application-focus';

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  saved: 'Saved',
  applying: 'Applying',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  closed: 'Closed',
};

export const SUBSTAGE_LABELS: Record<ApplicationSubstage, string> = {
  preparing_application: 'Preparing application',
  ready_to_apply: 'Ready to apply',
  submitted: 'Submitted',
  recruiter_review: 'Recruiter review',
  hiring_manager_review: 'Hiring manager review',
  assessment: 'Assessment',
  recruiter_screen: 'Recruiter screen',
  technical_interview: 'Technical interview',
  system_design: 'System design',
  behavioral_interview: 'Behavioral interview',
  final_interview: 'Final interview',
  offer_received: 'Offer received',
  offer_negotiation: 'Offer negotiation',
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

export function displayLifecycleLabel(application: JobApplication): string {
  if (application.substage !== undefined) {
    return SUBSTAGE_LABELS[application.substage];
  }
  return STAGE_LABELS[application.stage];
}

export function recommendedLifecycleAction(
  application: JobApplication,
): string | null {
  if (application.stage === 'closed') return null;

  switch (application.substage) {
    case 'preparing_application':
      return 'Finish tailoring the application.';
    case 'ready_to_apply':
      return 'Submit the application.';
    case 'submitted':
    case 'recruiter_review':
    case 'hiring_manager_review':
      return 'Follow up if there is no response.';
    case 'assessment':
      return 'Complete the assessment and record the result.';
    case 'recruiter_screen':
    case 'technical_interview':
    case 'system_design':
    case 'behavioral_interview':
    case 'final_interview':
      return 'Prepare for the next interview step.';
    case 'offer_received':
    case 'offer_negotiation':
      return 'Review the offer and decide the next move.';
    default:
      break;
  }

  switch (application.stage) {
    case 'saved':
      return 'Review the role and decide whether to apply.';
    case 'applying':
      return 'Prepare the application for submission.';
    case 'applied':
      return 'Track the response and keep the next follow-up explicit.';
    case 'interview':
      return 'Prepare for the next interview step.';
    case 'offer':
      return 'Review the offer and decide the next move.';
  }
}

export function nextPipelineStage(
  stage: ApplicationStage,
): ApplicationStage | null {
  const index = ACTIVE_APPLICATION_STAGES.findIndex((item) => item === stage);
  if (index < 0) return null;
  return ACTIVE_APPLICATION_STAGES[index + 1] ?? null;
}

export function previousPipelineStage(
  stage: ApplicationStage,
): ApplicationStage | null {
  const index = ACTIVE_APPLICATION_STAGES.findIndex((item) => item === stage);
  if (index <= 0) return null;
  return ACTIVE_APPLICATION_STAGES[index - 1] ?? null;
}

export function stageActionLabel(nextStage: ApplicationStage): string {
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
