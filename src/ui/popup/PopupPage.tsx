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
import './popup.css';

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

  if (!loaded) return <main className="popup-page">Loading…</main>;
  if (error || profile === null) {
    return (
      <main className="popup-page">
        <h1>Fillio</h1>
        <p>Could not load your career profile.</p>
        <button type="button" onClick={() => void openOptions()}>
          Open profile settings
        </button>
      </main>
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
    <main className="popup-page">
      <header className="popup-header">
        <div>
          <p className="popup-eyebrow">Fillio</p>
          <h1>Ready to apply</h1>
        </div>
        <strong className="popup-readiness">{readiness.percentage}% ready</strong>
        <p className="popup-muted popup-header__summary">
          {readiness.completed} of {readiness.total} profile sections ready
        </p>
      </header>

      {missingEssentials.length > 0 ? (
        <section className="popup-card popup-card--essentials">
          <div className="popup-section-heading">
            <h2>Missing essentials</h2>
            <span className="fillio-chip">Next up</span>
          </div>
          <ul className="popup-essentials-list">
            {missingEssentials.map((essential) => (
              <li key={essential}>{essential}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="popup-card popup-card--page">
        <div className="popup-section-heading">
          <h2>Current page</h2>
          {pageSummary !== null && pageSummary !== undefined ? (
            <span className="fillio-chip fillio-chip-strong">Form found</span>
          ) : null}
        </div>
        {pageSummary === null || pageSummary === undefined ? (
          <p className="popup-muted popup-empty">
            Open a job application form to see safe fields Fillio can help with.
          </p>
        ) : (
          <div className="page-summary" aria-label="Current page form analysis">
            <span className="fillio-chip">{pageSummary.ready} ready</span>
            <span className="fillio-chip">{pageSummary.needsReview} needs review</span>
            <span className="fillio-chip">{pageSummary.sensitive} sensitive</span>
            <span className="fillio-chip">{pageSummary.unknown} unknown</span>
          </div>
        )}
      </section>

      <section className="popup-card popup-card--variants">
        <div className="popup-section-heading">
          <h2>Application profiles</h2>
          <strong>
            {variantCount} application {variantCount === 1 ? 'variant' : 'variants'}
          </strong>
        </div>
        {recommendedVariant !== null ? (
          <div className="popup-empty">
            <span className="fillio-chip fillio-chip-strong">Recommended</span>
            <p><strong>{recommendedVariant.name || 'Untitled variant'}</strong></p>
            <p className="popup-muted">
              {variantRecommendation?.evidence.length
                ? `Matched page signals: ${variantRecommendation.evidence.join(', ')}`
                : 'Using your default application profile because this page has no strong matching signal.'}
            </p>
          </div>
        ) : null}

        {variantOptions.length > 0 && onSelectVariant !== undefined ? (
          <label>
            Use for this page
            <select
              value={activeVariantId ?? ''}
              onChange={(event) => void onSelectVariant(event.target.value || null)}
            >
              <option value="">No application variant</option>
              {variantOptions.map((variant) => (
                <option value={variant.id} key={variant.id}>{variant.name}</option>
              ))}
            </select>
          </label>
        ) : null}

        {recommendedVariant !== null && onSelectVariant !== undefined ? (
          <button className="fillio-button" type="button" onClick={() => void onSelectVariant(null)}>
            Use automatic recommendation
          </button>
        ) : null}

        {profile.variants.length > 0 ? (
          <ul className="variant-list">
            {profile.variants.map((variant) => (
              <li key={variant.id}>{variant.name || 'Untitled variant'}</li>
            ))}
          </ul>
        ) : (
          <p className="popup-muted popup-empty">Add variants for different target roles.</p>
        )}
      </section>

      {fileInputCount > 0 ? (
        <section className="popup-card">
          <div className="popup-section-heading">
            <h2>Document upload</h2>
            <span className="fillio-chip">Explicit</span>
          </div>
          <p className="popup-muted">
            {fileInputCount} file {fileInputCount === 1 ? 'field' : 'fields'} detected. Stored files are attached only when you click Attach in the page launcher.
          </p>
          {visibleDocumentFields.length > 0 ? (
            <ul className="variant-list">
              {visibleDocumentFields.map((field, index) => (
                <li key={`${field.fieldFingerprint}-${index}`}>
                  <strong>{field.fieldLabel}</strong>
                  <div className="popup-muted">{DOCUMENT_INTENT_LABELS[field.intent]}</div>
                  {field.recommendedDocument !== null ? (
                    <div>
                      Ready to attach: <strong>{field.recommendedDocument.label || field.recommendedDocument.fileName}</strong>
                      {field.recommendedDocument.fileName ? ` — ${field.recommendedDocument.fileName}` : ''}
                    </div>
                  ) : field.intent === 'unknown' ? (
                    <div className="popup-muted">
                      Unknown document type; choose the file manually after checking the site label.
                    </div>
                  ) : (
                    <div className="popup-muted">No matching stored document is configured.</div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="popup-muted">Store a CV in the career workspace for deterministic guidance.</p>
          )}
        </section>
      ) : null}

      <button
        className="fillio-button fillio-button-primary popup-primary"
        type="button"
        onClick={() => void openOptions()}
      >
        {primaryActionLabel}
      </button>
    </main>
  );
}
