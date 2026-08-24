import { useEffect, useState } from 'react';

import type { PageAnalysisSummary } from '../../application/forms/analyze-field-contexts';
import type { ProfileRepository } from '../../application/profile/profile-repository';
import { calculateProfileReadiness } from '../../application/profile/profile-readiness';
import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import type { StoredProfileEnvelope } from '../../domain/profile/profile-schema';
import './popup.css';

type PopupPageProps = {
  repository: ProfileRepository;
  openOptions: () => void | Promise<void>;
  pageSummary?: PageAnalysisSummary | null;
};

export function PopupPage({
  repository,
  openOptions,
  pageSummary,
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

  if (!loaded) {
    return <main className="popup-page">Loading…</main>;
  }

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

  return (
    <main className="popup-page">
      <header>
        <p className="popup-eyebrow">Fillio</p>
        <h1>{readiness.percentage}% ready</h1>
        <p className="popup-muted">
          {readiness.completed} of {readiness.total} profile sections ready
        </p>
      </header>

      <section className="popup-card">
        <h2>Current page</h2>
        {pageSummary === null || pageSummary === undefined ? (
          <p className="popup-muted popup-empty">No supported form detected.</p>
        ) : (
          <div className="page-summary" aria-label="Current page form analysis">
            <span>{pageSummary.ready} ready</span>
            <span>{pageSummary.needsReview} needs review</span>
            <span>{pageSummary.sensitive} sensitive</span>
            <span>{pageSummary.unknown} unknown</span>
          </div>
        )}
      </section>

      <section className="popup-card">
        <div className="popup-row">
          <span>Application profiles</span>
          <strong>
            {variantCount} application{' '}
            {variantCount === 1 ? 'variant' : 'variants'}
          </strong>
        </div>
        {profile.variants.length > 0 ? (
          <ul className="variant-list">
            {profile.variants.map((variant) => (
              <li key={variant.id}>{variant.name || 'Untitled variant'}</li>
            ))}
          </ul>
        ) : (
          <p className="popup-muted popup-empty">
            Add variants for different target roles.
          </p>
        )}
      </section>

      <button
        className="popup-primary"
        type="button"
        onClick={() => void openOptions()}
      >
        Open profile settings
      </button>
    </main>
  );
}
