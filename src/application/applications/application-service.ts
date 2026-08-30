import {
  APPLICATION_STAGES,
  JobApplicationSchema,
  type ApplicationStage,
  type JobApplication,
  type StoredApplicationCollection,
} from '../../domain/applications/application-schema';
import { createEmptyApplicationCollection } from '../../domain/applications/create-empty-application-collection';
import type { ApplicationRepository } from './application-repository';

export type ApplicationDraft = {
  company: string;
  role: string;
  jobUrl?: string;
  stage: ApplicationStage;
  notes?: string;
  source?: string;
  contactName?: string;
  contactEmail?: string;
  nextActionAt?: string;
};

export type PageApplicationCapture = {
  url: string;
  signals: string[];
};

export type ApplicationService = ReturnType<typeof createApplicationService>;

const TITLE_SPLITTERS = [
  /\s+at\s+/i,
  /\s+\|\s+/,
  /\s+-\s+/,
  /\s+–\s+/,
  /\s+—\s+/,
];

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function maybeUrl(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  if (!JobApplicationSchema.shape.jobUrl.safeParse(trimmed).success) {
    throw new Error('Invalid job URL.');
  }
  return trimmed;
}

function optionalText(value: string | undefined): string | undefined {
  const trimmed = normalizeText(value ?? '');
  return trimmed === '' ? undefined : trimmed;
}

function optionalEmail(value: string | undefined): string | undefined {
  const trimmed = normalizeText(value ?? '');
  if (trimmed === '') return undefined;
  if (!JobApplicationSchema.shape.contactEmail.safeParse(trimmed).success) {
    throw new Error('Invalid contact email.');
  }
  return trimmed;
}

function createApplicationId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `application-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function deriveCompanyAndRole(
  signals: string[],
): Pick<ApplicationDraft, 'company' | 'role'> {
  const normalizedSignals = signals.map(normalizeText).filter(Boolean);
  const titleLike = normalizedSignals.find((signal) =>
    TITLE_SPLITTERS.some((splitter) => splitter.test(signal)),
  );

  if (titleLike === undefined) return { company: '', role: '' };

  for (const splitter of TITLE_SPLITTERS) {
    const parts = titleLike.split(splitter).map(normalizeText).filter(Boolean);
    if (parts.length < 2) continue;

    const [left, right] = parts;
    if (left === undefined || right === undefined) continue;

    if (splitter.source.includes('at')) {
      return { role: left, company: right };
    }
    return { role: left, company: right };
  }

  return { company: '', role: '' };
}

function sortApplications(applications: JobApplication[]): JobApplication[] {
  return [...applications].sort((left, right) => {
    const stageDelta =
      APPLICATION_STAGES.indexOf(left.stage) -
      APPLICATION_STAGES.indexOf(right.stage);
    if (stageDelta !== 0) return stageDelta;
    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

function validateDraft(draft: ApplicationDraft): ApplicationDraft {
  const company = normalizeText(draft.company);
  const role = normalizeText(draft.role);
  const jobUrl = maybeUrl(draft.jobUrl ?? '');
  const notes = optionalText(draft.notes);
  const source = optionalText(draft.source);
  const contactName = optionalText(draft.contactName);
  const contactEmail = optionalEmail(draft.contactEmail);
  const nextActionAt = optionalText(draft.nextActionAt);
  const candidate = {
    id: 'draft',
    company,
    role,
    ...(jobUrl === undefined ? {} : { jobUrl }),
    stage: draft.stage,
    ...(notes === undefined ? {} : { notes }),
    ...(source === undefined ? {} : { source }),
    ...(contactName === undefined ? {} : { contactName }),
    ...(contactEmail === undefined ? {} : { contactEmail }),
    ...(nextActionAt === undefined ? {} : { nextActionAt }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  JobApplicationSchema.parse(candidate);
  return {
    company,
    role,
    ...(jobUrl === undefined ? {} : { jobUrl }),
    stage: draft.stage,
    ...(notes === undefined ? {} : { notes }),
    ...(source === undefined ? {} : { source }),
    ...(contactName === undefined ? {} : { contactName }),
    ...(contactEmail === undefined ? {} : { contactEmail }),
    ...(nextActionAt === undefined ? {} : { nextActionAt }),
  };
}

function draftFromChanges(
  current: JobApplication,
  changes: Partial<ApplicationDraft>,
): ApplicationDraft {
  const draft: ApplicationDraft = {
    company: changes.company ?? current.company,
    role: changes.role ?? current.role,
    stage: changes.stage ?? current.stage,
  };
  if (changes.jobUrl !== undefined) {
    draft.jobUrl = changes.jobUrl;
  } else if (current.jobUrl !== undefined) {
    draft.jobUrl = current.jobUrl;
  }
  if (changes.notes !== undefined) {
    draft.notes = changes.notes;
  } else if (current.notes !== undefined) {
    draft.notes = current.notes;
  }
  if (changes.source !== undefined) {
    draft.source = changes.source;
  } else if (current.source !== undefined) {
    draft.source = current.source;
  }
  if (changes.contactName !== undefined) {
    draft.contactName = changes.contactName;
  } else if (current.contactName !== undefined) {
    draft.contactName = current.contactName;
  }
  if (changes.contactEmail !== undefined) {
    draft.contactEmail = changes.contactEmail;
  } else if (current.contactEmail !== undefined) {
    draft.contactEmail = current.contactEmail;
  }
  if (changes.nextActionAt !== undefined) {
    draft.nextActionAt = changes.nextActionAt;
  } else if (current.nextActionAt !== undefined) {
    draft.nextActionAt = current.nextActionAt;
  }
  return draft;
}

export function createApplicationService(repository: ApplicationRepository) {
  async function loadCollection(): Promise<StoredApplicationCollection> {
    return (await repository.load()) ?? createEmptyApplicationCollection();
  }

  async function saveCollection(
    collection: StoredApplicationCollection,
  ): Promise<StoredApplicationCollection> {
    await repository.save(collection);
    return collection;
  }

  async function updateApplication(
    id: string,
    changes: Partial<ApplicationDraft>,
  ): Promise<JobApplication> {
    const collection = await loadCollection();
    const index = collection.applications.findIndex(
      (application) => application.id === id,
    );
    if (index === -1) throw new Error('Application not found.');

    const current = collection.applications[index];
    if (current === undefined) throw new Error('Application not found.');

    const cleanDraft = validateDraft(draftFromChanges(current, changes));
    const now = new Date().toISOString();
    const next = JobApplicationSchema.parse({
      id: current.id,
      ...cleanDraft,
      createdAt: current.createdAt,
      updatedAt: now,
    });
    const applications = [...collection.applications];
    applications[index] = next;
    await saveCollection({
      ...collection,
      applications,
      metadata: { ...collection.metadata, updatedAt: now },
    });
    return next;
  }

  return {
    async list(): Promise<JobApplication[]> {
      const collection = await loadCollection();
      return sortApplications(collection.applications);
    },

    createDraftFromPageCapture(
      capture: PageApplicationCapture,
    ): ApplicationDraft {
      return {
        ...deriveCompanyAndRole(capture.signals),
        ...(maybeUrl(capture.url) === undefined ? {} : { jobUrl: capture.url }),
        stage: 'saved',
      };
    },

    async create(draft: ApplicationDraft): Promise<JobApplication> {
      const cleanDraft = validateDraft(draft);
      const collection = await loadCollection();
      const now = new Date().toISOString();
      const application = JobApplicationSchema.parse({
        id: createApplicationId(),
        ...cleanDraft,
        createdAt: now,
        updatedAt: now,
      });
      await saveCollection({
        ...collection,
        applications: [...collection.applications, application],
        metadata: { ...collection.metadata, updatedAt: now },
      });
      return application;
    },

    async update(
      id: string,
      changes: Partial<ApplicationDraft>,
    ): Promise<JobApplication> {
      return updateApplication(id, changes);
    },

    async changeStage(
      id: string,
      stage: ApplicationStage,
    ): Promise<JobApplication> {
      return updateApplication(id, { stage });
    },

    async delete(id: string): Promise<void> {
      const collection = await loadCollection();
      const applications = collection.applications.filter(
        (application) => application.id !== id,
      );
      if (applications.length === collection.applications.length) return;
      const now = new Date().toISOString();
      await saveCollection({
        ...collection,
        applications,
        metadata: { ...collection.metadata, updatedAt: now },
      });
    },
  };
}
