import { useEffect, useState, type ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';

import type { PageAnalysisSummary } from '../../application/forms/analyze-field-contexts';
import type { PageVariantOption } from '../../application/forms/page-messages';
import type { ProfileRepository } from '../../application/profile/profile-repository';
import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import type { StoredProfileEnvelope } from '../../domain/profile/profile-schema';
import type { VariantRecommendation } from '../../domain/variants/recommend-variant';
import { Button, Chip, SelectField } from '../ui';

type PopupPageProps = {
  repository: ProfileRepository;
  openOptions: () => void | Promise<void>;
  pageSummary?: PageAnalysisSummary | null;
  variantRecommendation?: VariantRecommendation | null;
  activeVariantId?: string | null;
  variantOptions?: PageVariantOption[];
  onSelectVariant?: (variantId: string | null) => void | Promise<void>;
};

const cardClass =
  'rounded-app border border-app-border bg-app-surface-glass p-2.5 shadow-section backdrop-blur-xl';
const sectionHeadingClass = 'flex items-center justify-between gap-2';
const mutedClass = 'm-0 text-[13px] leading-[1.45] text-app-text';

function getPrimaryActionLabel(
  pageSummary: PageAnalysisSummary | null | undefined,
): string {
  if (pageSummary === null || pageSummary === undefined) return 'Open workspace';
  if (pageSummary.ready > 0 || pageSummary.needsReview > 0) {
    return 'Prepare fields in workspace';
  }
  if (pageSummary.sensitive > 0) return 'Manage vault in workspace';
  return 'Open workspace';
}

function PopupShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid w-[320px] gap-2.5 bg-app-bg p-3 text-app-ink">
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
        <h1 className="m-0 text-lg font-semibold tracking-tight">Job Flow</h1>
        <p className={mutedClass}>Could not load your career profile.</p>
        <Button onClick={() => void openOptions()}>Open workspace</Button>
      </PopupShell>
    );
  }

  const primaryActionLabel = getPrimaryActionLabel(pageSummary);
  const recommendedVariant =
    variantRecommendation?.variantId === null ||
    variantRecommendation?.variantId === undefined
      ? null
      : (profile.variants.find(
          (variant) => variant.id === variantRecommendation.variantId,
        ) ?? null);

  return (
    <PopupShell>
      <header>
        <p className="mb-1 mt-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-app-subtle">
          Job Flow
        </p>
        <h1 className="m-0 text-lg font-semibold tracking-tight">
          Current application
        </h1>
      </header>

      <section className={cardClass}>
        <div className={sectionHeadingClass}>
          <h2 className="m-0 text-sm font-semibold">Current page</h2>
          {pageSummary !== null && pageSummary !== undefined ? (
            <Chip strong>Form found</Chip>
          ) : null}
        </div>
        {pageSummary === null || pageSummary === undefined ? (
          <p className={`${mutedClass} mt-2`}>
            Open a job application form to see what Job Flow can help with.
          </p>
        ) : (
          <div
            className="mt-2 flex flex-wrap gap-1"
            aria-label="Current page form analysis"
          >
            <Chip>{pageSummary.ready} ready</Chip>
            <Chip>{pageSummary.needsReview} needs review</Chip>
            <Chip>{pageSummary.sensitive} sensitive</Chip>
            <Chip>{pageSummary.unknown} unknown</Chip>
          </div>
        )}
      </section>

      <section className={cardClass}>
        <h2 className="m-0 text-sm font-semibold">Application profile</h2>

        {recommendedVariant !== null ? (
          <div className="mt-2">
            <Chip strong>Recommended</Chip>
            <p className="mb-0 mt-2 text-[13px]">
              <strong>{recommendedVariant.name || 'Untitled variant'}</strong>
            </p>
            <p className={`${mutedClass} mt-1`}>
              {variantRecommendation?.evidence.length
                ? `Matched page signals: ${variantRecommendation.evidence.join(', ')}`
                : 'Using your default application profile because this page has no strong matching signal.'}
            </p>
          </div>
        ) : variantOptions.length === 0 ? (
          <p className={`${mutedClass} mt-2`}>Using your base career profile.</p>
        ) : null}

        {variantOptions.length > 0 && onSelectVariant !== undefined ? (
          <SelectField
            className="mt-2"
            label="Use for this page"
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
          </SelectField>
        ) : null}

        {recommendedVariant !== null && onSelectVariant !== undefined ? (
          <Button className="mt-2" onClick={() => void onSelectVariant(null)}>
            Use automatic recommendation
          </Button>
        ) : null}
      </section>

      <Button
        className="w-full"
        variant="primary"
        onClick={() => void openOptions()}
      >
        <ExternalLink aria-hidden="true" size={16} />
        {primaryActionLabel}
      </Button>
    </PopupShell>
  );
}
