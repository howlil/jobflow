import { useEffect, useMemo, useState } from 'react';

import type { CorrectionRepository } from '../../application/corrections/correction-repository';
import type { FieldCorrection } from '../../domain/corrections/correction-schema';
import { isCorrectionStale } from '../../domain/corrections/correction-staleness';

type CorrectionMemorySectionProps = {
  repository: CorrectionRepository;
  now?: Date;
};

function originLabel(origin: string): string {
  try {
    return new URL(origin).host || origin;
  } catch {
    return origin;
  }
}

export function CorrectionMemorySection({
  repository,
  now,
}: CorrectionMemorySectionProps) {
  const [entries, setEntries] = useState<FieldCorrection[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmResetAll, setConfirmResetAll] = useState(false);

  async function refresh() {
    try {
      setEntries(await repository.listAll());
      setError(null);
    } catch {
      setError('Could not load learned mappings.');
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    void refresh();
  }, [repository]);

  const groups = useMemo(() => {
    const grouped = new Map<string, FieldCorrection[]>();
    for (const entry of entries) {
      const current = grouped.get(entry.origin) ?? [];
      current.push(entry);
      grouped.set(entry.origin, current);
    }
    return [...grouped.entries()].sort(([left], [right]) =>
      left.localeCompare(right),
    );
  }, [entries]);

  async function remove(entry: FieldCorrection) {
    try {
      await repository.remove(entry);
      await refresh();
    } catch {
      setError('Could not delete this learned mapping.');
    }
  }

  async function resetOrigin(origin: string) {
    try {
      await repository.removeForOrigin(origin);
      await refresh();
    } catch {
      setError('Could not reset mappings for this site.');
    }
  }

  async function resetAll() {
    try {
      await repository.clear();
      setConfirmResetAll(false);
      await refresh();
    } catch {
      setError('Could not reset learned mappings.');
    }
  }

  return (
    <section
      className="profile-section"
      aria-labelledby="correction-memory-title"
    >
      <div className="jobflow-section-heading">
        <div>
          <p className="eyebrow">Autofill memory</p>
          <h2 id="correction-memory-title">Learned field mappings</h2>
        </div>
        <span className="jobflow-chip">{entries.length} saved</span>
      </div>
      <p className="muted">
        Job Flow stores exact site/form/field corrections locally. Review stale
        mappings or remove anything that no longer matches the site.
      </p>

      {error !== null ? <p role="alert">{error}</p> : null}
      {!loaded ? <p className="muted">Loading learned mappings…</p> : null}
      {loaded && entries.length === 0 ? (
        <div className="jobflow-empty-row">No learned mappings yet.</div>
      ) : null}

      {groups.map(([origin, siteEntries]) => {
        const label = originLabel(origin);
        return (
          <article className="record-card" key={origin}>
            <div className="jobflow-section-heading">
              <div>
                <strong>{label}</strong>
                <p className="muted">{origin}</p>
              </div>
              <button
                className="jobflow-button"
                type="button"
                aria-label={`Reset ${label}`}
                onClick={() => void resetOrigin(origin)}
              >
                Reset site
              </button>
            </div>
            <ul className="profile-readiness-list">
              {siteEntries.map((entry) => {
                const stale = isCorrectionStale(entry, now);
                return (
                  <li
                    key={`${entry.formFingerprint}:${entry.fieldFingerprint}`}
                  >
                    <div>
                      <strong>{entry.target}</strong>{' '}
                      {stale ? (
                        <span className="jobflow-chip">Review stale</span>
                      ) : null}
                      <div className="muted">
                        Form {entry.formFingerprint} · Field{' '}
                        {entry.fieldFingerprint}
                      </div>
                    </div>
                    <button
                      className="jobflow-button"
                      type="button"
                      onClick={() => void remove(entry)}
                    >
                      Delete mapping
                    </button>
                  </li>
                );
              })}
            </ul>
          </article>
        );
      })}

      {entries.length > 0 ? (
        <div className="jobflow-section-heading">
          {!confirmResetAll ? (
            <button
              className="jobflow-button"
              type="button"
              onClick={() => setConfirmResetAll(true)}
            >
              Reset all learned mappings
            </button>
          ) : (
            <div>
              <p>
                This removes all learned field corrections from local storage.
              </p>
              <button
                className="jobflow-button"
                type="button"
                onClick={() => void resetAll()}
              >
                Confirm reset all
              </button>{' '}
              <button
                className="jobflow-button"
                type="button"
                onClick={() => setConfirmResetAll(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
