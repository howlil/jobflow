import type { JobApplication } from '../../domain/applications/application-schema';

export type ApplicationView = 'all' | 'needs-action';

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

export function applicationNeedsAction(
  application: JobApplication,
  todayKey: string,
): boolean {
  const actionKey = actionDateKey(application);
  return actionKey !== null && actionKey <= todayKey;
}

export function applicationMatchesQuery(
  application: JobApplication,
  query: string,
): boolean {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (normalizedQuery === '') return true;

  return `${application.company} ${application.role}`
    .toLocaleLowerCase()
    .includes(normalizedQuery);
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
    .filter(
      (application) =>
        options.view === 'all' ||
        applicationNeedsAction(application, options.todayKey),
    )
    .sort((left, right) =>
      compareApplicationsByAction(left, right, options.todayKey),
    );
}
