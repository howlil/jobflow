import type { JobApplication } from '../../domain/applications/application-schema';

export const ACTIVE_APPLICATION_STAGES = [
  'saved',
  'applying',
  'applied',
  'interview',
  'offer',
] as const;

export const CLOSED_APPLICATION_SUBSTAGES = [
  'accepted',
  'rejected',
  'withdrawn',
] as const;

export type ApplicationView = 'board' | 'needs-action' | 'closed';

export function localDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function actionDateKey(application: JobApplication): string | null {
  const value = application.nextActionAt?.slice(0, 10);
  return value === undefined || value === '' ? null : value;
}

export function applicationIsClosed(application: JobApplication): boolean {
  return application.stage === 'closed';
}

export function applicationNeedsAction(
  application: JobApplication,
  todayKey: string,
): boolean {
  if (applicationIsClosed(application)) return false;
  const actionKey = actionDateKey(application);
  return actionKey !== null && actionKey <= todayKey;
}

export function applicationMatchesQuery(
  application: JobApplication,
  query: string,
): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (normalizedQuery === '') return true;

  const searchableText = [
    application.company,
    application.role,
    application.source ?? '',
    application.contactName ?? '',
    application.contactEmail ?? '',
    application.substage ?? '',
  ]
    .join(' ')
    .toLocaleLowerCase();

  return normalizedQuery
    .split(/\s+/)
    .every((term) => searchableText.includes(term));
}

function actionPriority(application: JobApplication, todayKey: string): number {
  const actionKey = actionDateKey(application);
  if (actionKey === null) return 3;
  if (actionKey < todayKey) return 0;
  if (actionKey === todayKey) return 1;
  return 2;
}

export function compareApplicationsByAction(
  left: JobApplication,
  right: JobApplication,
  todayKey: string,
): number {
  const priorityDelta =
    actionPriority(left, todayKey) - actionPriority(right, todayKey);
  if (priorityDelta !== 0) return priorityDelta;

  const leftActionKey = actionDateKey(left);
  const rightActionKey = actionDateKey(right);
  if (
    leftActionKey !== null &&
    rightActionKey !== null &&
    leftActionKey !== rightActionKey
  ) {
    return leftActionKey.localeCompare(rightActionKey);
  }

  return right.updatedAt.localeCompare(left.updatedAt);
}

export function focusApplications(
  applications: JobApplication[],
  options: {
    query: string;
    view: ApplicationView;
    todayKey: string;
  },
): JobApplication[] {
  return applications
    .filter((application) =>
      applicationMatchesQuery(application, options.query),
    )
    .filter((application) => {
      if (options.view === 'closed') return applicationIsClosed(application);
      if (applicationIsClosed(application)) return false;
      if (options.view === 'needs-action') {
        return applicationNeedsAction(application, options.todayKey);
      }
      return true;
    })
    .sort((left, right) =>
      compareApplicationsByAction(left, right, options.todayKey),
    );
}
