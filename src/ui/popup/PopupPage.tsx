import { useEffect, useState } from 'react';

import type { PageAnalysisSummary } from '../../application/forms/analyze-field-contexts';
import type {
  PageDocumentFieldSummary,
  PageVariantOption,
  RecommendedDocumentSummary,
} from '../../application/forms/page-messages';
import type { ProfileRepository } from '../../application/profile/profile-repository';
import { calculateProfileReadiness } from '../../application/profile/profile-readiness';
import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import type { StoredProfileEnvelope } from '../../domain/profile/profile-schema';
import type { VariantRecommendation } from '../../domain/variants/recommend-variant';

type PopupPageProps = {
  repository: ProfileRepository;
  openOptions: () => void | Promise<void>;
  pageSummary?: PageAnalysisSummary | null;
  variantRecommendation?: VariantRecommendation | null;
  activeVariantId?: string | null;
  variantOptions?: PageVariantOption[];
  fileInputCount?: number;
  recommendedResume?: RecommendedDocumentSummary | null;
  documentFields?: PageDocumentFieldSummary[];
  onSelectVariant?: (variantId: string | null) => void | Promise<void>;
};

const ESSENTIAL_LABELS = {
  identity: 'Your name',
  contact: 'Contact details',
  links: 'Professional links',
  experience: 'Work experience',
  education: 'Education',
  skills: 'Skills',
} as const;

const DOCUMENT_INTENT_LABELS: Record<
  PageDocumentFieldSummary['intent'],
  string
> = {
  resume: 'Resume',
  cover_letter: 'Cover letter',
  portfolio: 'Portfolio',
  transcript: 'Transcript',
  certificate: 'Certificate',
  unknown: 'Unknown document type',
};

const cardClass = 'rounded-app border border-app-border bg-white p-3';
const sectionHeadingClass = 'flex items-center justify-between gap-2';
const mutedClass = 'm-0 text-[13px] leading-[1.45] text-app-text';
const chipClass =
  'inline-flex items-center gap-1 rounded-control border border-app-border bg-app-muted px-2 py-0.5 text-[11px] font-medium leading-5 text-app-text';
const strongChipClass = `${chipClass} border-app-border-strong bg-white font-semibold text-app-ink`;
const fieldClass =
  'mt-1.5 min-h-9 w-full rounded-control border border-app-border bg-white px-2.5 py-2 text-xs text-app-ink outline-none transition hover:border-app-border-strong focus:border-app-ink focus:ring-2 focus:ring-app-border';
const buttonClass =
  'inline-flex min-h-9 items-center justify-center gap-2 rounded-control border border-app-border-strong bg-white px-3 py-1.5 text-xs font-semibold text-app-ink transition hover:border-app-ink hover:bg-app-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-ink focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50';

function getMissingEssentials(
  sections: ReturnType<typeof calculateProfileReadiness>['sections'],
): string[] {
  return (
    Object.entries(sections) as Array<[keyof typeof ESSENTIAL_LABELS, boolean]>
  )
    .filter(([, complete]) => !complete)
    .slice(0, 3)
    .map(([section]) => ESSENTIAL_LABELS[section]);
}

function getPrimaryActionLabel(
  profileComplete: boolean,
  pageSummary: PageAnalysisSummary | null | undefined,
): string {
  if (!profileComplete) return 'Complete profile';
  if (pageSummary === null || pageSummary === undefined) {
    return 'Open profile settings';
  }
  if (pageSummary.ready > 0 || pageSummary.needsReview > 0) {
    return 'Prepare fields in settings';
  }
  if (pageSummary.sensitive > 0) return 'Manage vault in settings';
  return 'Open profile settings';
}

function PopupShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid w-[340px] gap-3 bg-app-bg p-4 text-app-ink">
      {children}
    </main>
  );
}

export function PopupPage({
  repository,
  openOptions,
  pageSummary,
  variantRecommendation,
  activeVariantId,
  variantOptions = [],
  fileInputCount = 0,
  recommendedResume,
  documentFields = [],
  onSelectVariant,
}: PopupPageProps) {
  const [profile, setProfile] = useState<StoredProfileEnvelope | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    void repository
      .load()
      .then((stored) => {
        if (active) {
          setProfile(stored ?? createEmptyStoredProfile());
          setLoaded(true);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [repository]);

  if (!loaded) return <PopupShell>Loading…</PopupShell>;
  if (error || profile === null) {
    return (
      <PopupShell>
        <h1 className="m-0 text-xl font-semibold tracking-tight">Fillio</h1>
        <p className={mutedClass}>Could not load your career profile.</p>
        <button
          className={buttonClass}
          type="button"
          onClick={() => void openOptions()}
        >
          Open profile settings
        </button>
      </PopupShell>
    );
  }

  const readiness = calculateProfileReadiness(profile.baseProfile);
  const variantCount = profile.variants.length;
  const missingEssentials = getMissingEssentials(readiness.sections);
  const primaryActionLabel = getPrimaryActionLabel(
    readiness.completed === readiness.total,
    pageSummary,
  );
  const recommendedVariant =
    variantRecommendation?.variantId === null ||
    variantRecommendation?.variantId === undefined
      ? null
      : (profile.variants.find(
          (variant) => variant.id === variantRecommendation.variantId,
        ) ?? null);
  const legacyDocumentFields: PageDocumentFieldSummary[] =
    documentFields.length === 0 && fileInputCount > 0
      ? [
          {
            fieldFingerprint: 'legacy-file-upload',
            fieldLabel: 'File upload',
            intent: recommendedResume === null ? 'unknown' : 'resume',
            evidence: [],
            recommendedDocument: recommendedResume ?? null,
          },
        ]
      : [];
  const visibleDocumentFields =
    documentFields.length > 0 ? documentFields : legacyDocumentFields;

  return (
    <PopupShell>
      <header className="grid grid-cols-[1fr_auto] items-start gap-x-3 gap-y-1">
        <div>
          <p className="mb-1 mt-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-app-subtle">
            Fillio
          </p>
          <h1 className="m-0 text-xl font-semibold tracking-tight">
            Ready to apply
          </h1>
        </div>
        <strong className="text-lg font-semibold text-emerald-700">
          {readiness.percentage}% ready
        </strong>
        <p className={`${mutedClass} col-span-2`}>
          {readiness.completed} of {readiness.total} profile sections ready
        </p>
      </header>

      {missingEssentials.length > 0 ? (
        <section className="rounded-app border border-amber-200 bg-amber-50 p-3">
          <div className={sectionHeadingClass}>
            <h2 className="m-0 text-sm font-semibold">Missing essentials</h2>
            <span className={chipClass}>Next up</span>
          </div>
          <ul className="mb-0 mt-2 grid gap-1 pl-[18px] text-[13px] text-app-ink">
            {missingEssentials.map((essential) => (
              <li key={essential}>{essential}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={cardClass}>
        <div className={sectionHeadingClass}>
          <h2 className="m-0 text-sm font-semibold">Current page</h2>
          {pageSummary !== null && pageSummary !== undefined ? (
            <span className={strongChipClass}>Form found</span>
          ) : null}
        </div>
        {pageSummary === null || pageSummary === undefined ? (
          <p className={`${mutedClass} mt-2`}>
            Open a job application form to see safe fields Fillio can help with.
          </p>
        ) : (
          <div
            className="mt-2 flex flex-wrap gap-1"
            aria-label="Current page form analysis"
          >
            <span className={chipClass}>{pageSummary.ready} ready</span>
            <span className={chipClass}>
              {pageSummary.needsReview} needs review
            </span>
            <span className={chipClass}>
              {pageSummary.sensitive} sensitive
            </span>
            <span className={chipClass}>{pageSummary.unknown} unknown</span>
          </div>
        )}
      </section>

      <section className={cardClass}>
        <div className={sectionHeadingClass}>
          <h2 className="m-0 text-sm font-semibold">Application profiles</h2>
          <strong className="text-xs font-semibold text-app-text">
            {variantCount} application {variantCount === 1 ? 'variant' : 'variants'}
          </strong>
        </div>

        {recommendedVariant !== null ? (
          <div className="mt-2">
            <span className={strongChipClass}>Recommended</span>
            <p className="mb-0 mt-2 text-[13px]">
              <strong>{recommendedVariant.name || 'Untitled variant'}</strong>
            </p>
            <p className={`${mutedClass} mt-1`}>
              {variantRecommendation?.evidence.length
                ? `Matched page signals: ${variantRecommendation.evidence.join(', ')}`
                : 'Using your default application profile because this page has no strong matching signal.'}
            </p>
          </div>
        ) : null}

        {variantOptions.length > 0 && onSelectVariant !== undefined ? (
          <label className="mt-2 grid text-[11px] font-medium text-app-text">
            Use for this page
            <select
              className={fieldClass}
              value={activeVariantId ?? ''}
              onChange={(event) =>
                void onSelectVariant(event.target.value || null)
              }
            >
              <option value="">No application variant</option>
              {variantOptions.map((variant) => (
                <option value={variant.id} key={variant.id}>
                  {variant.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {recommendedVariant !== null && onSelectVariant !== undefined ? (
          <button
            className={`${buttonClass} mt-2`}
            type="button"
            onClick={() => void onSelectVariant(null)}
          >
            Use automatic recommendation
          </button>
        ) : null}

        {profile.variants.length > 0 ? (
          <ul className="mb-0 mt-2 grid gap-1 border-t border-app-border pt-2 pl-[18px] text-[13px]">
            {profile.variants.map((variant) => (
              <li key={variant.id}>{variant.name || 'Untitled variant'}</li>
            ))}
          </ul>
        ) : (
          <p className={`${mutedClass} mt-2`}>
            Add variants for different target roles.
          </p>
        )}
      </section>

      {fileInputCount > 0 ? (
        <section className={cardClass}>
          <div className={sectionHeadingClass}>
            <h2 className="m-0 text-sm font-semibold">Document upload</h2>
            <span className={chipClass}>Explicit</span>
          </div>
          <p className={`${mutedClass} mt-2`}>
            {fileInputCount} file {fileInputCount === 1 ? 'field' : 'fields'}{' '}
            detected. Stored files are attached only when you click Attach in
            the page launcher.
          </p>
          {visibleDocumentFields.length > 0 ? (
            <ul className="mb-0 mt-2 grid gap-2 border-t border-app-border pt-2 pl-[18px] text-[13px]">
              {visibleDocumentFields.map((field, index) => (
                <li key={`${field.fieldFingerprint}-${index}`}>
                  <strong>{field.fieldLabel}</strong>
                  <div className="text-app-text">
                    {DOCUMENT_INTENT_LABELS[field.intent]}
                  </div>
                  {field.recommendedDocument !== null ? (
                    <div>
                      Ready to attach:{' '}
                      <strong>
                        {field.recommendedDocument.label ||
                          field.recommendedDocument.fileName}
                      </strong>
                      {field.recommendedDocument.fileName
                        ? ` — ${field.recommendedDocument.fileName}`
                        : ''}
                    </div>
                  ) : field.intent === 'unknown' ? (
                    <div className="text-app-text">
                      Unknown document type; choose the file manually after
                      checking the site label.
                    </div>
                  ) : (
                    <div className="text-app-text">
                      No matching stored document is configured.
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className={`${mutedClass} mt-2`}>
              Store a CV in the career workspace for deterministic guidance.
            </p>
          )}
        </section>
      ) : null}

      <button
        className={`${buttonClass} w-full border-app-ink bg-app-ink text-white hover:border-black hover:bg-black`}
        type="button"
        onClick={() => void openOptions()}
      >
        {primaryActionLabel}
      </button>
    </PopupShell>
  );
}
