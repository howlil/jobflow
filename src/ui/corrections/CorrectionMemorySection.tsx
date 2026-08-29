import { useEffect, useMemo, useState } from 'react';

import type { CorrectionRepository } from '../../application/corrections/correction-repository';
import type { FieldCorrection } from '../../domain/corrections/correction-schema';
import { isCorrectionStale } from '../../domain/corrections/correction-staleness';
import {
  ActionRow,
  Button,
  Chip,
  EmptyState,
  Section,
  SectionHeader,
  StatusMessage,
} from '../design-system/primitives';

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
    <Section aria-labelledby="correction-memory-title">
      <SectionHeader
        eyebrow="Autofill memory"
        title={<span id="correction-memory-title">Learned field mappings</span>}
        description="Job Flow stores exact site/form/field corrections locally. Review stale mappings or remove anything that no longer matches the site."
        action={<Chip>{entries.length} saved</Chip>}
      />

      {error !== null ? (
        <StatusMessage tone="danger" role="alert">
          {error}
        </StatusMessage>
      ) : null}
      {!loaded ? (
        <p className="m-0 text-xs leading-5 text-app-text">
          Loading learned mappings…
        </p>
      ) : null}
      {loaded && entries.length === 0 ? (
        <EmptyState>No learned mappings yet.</EmptyState>
      ) : null}

      <div className="grid gap-3">
        {groups.map(([origin, siteEntries]) => {
          const label = originLabel(origin);
          return (
            <article
              className="grid gap-4 rounded-app border border-app-border bg-app-muted p-4"
              key={origin}
            >
              <div className="flex items-start justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
                <div className="grid min-w-0 gap-1">
                  <strong className="text-sm font-semibold text-app-ink">
                    {label}
                  </strong>
                  <p className="m-0 break-all text-xs leading-5 text-app-text">
                    {origin}
                  </p>
                </div>
                <Button
                  className="shrink-0"
                  aria-label={`Reset ${label}`}
                  onClick={() => void resetOrigin(origin)}
                >
                  Reset site
                </Button>
              </div>

              <ul className="m-0 grid list-none p-0">
                {siteEntries.map((entry) => {
                  const stale = isCorrectionStale(entry, now);
                  return (
                    <li
                      className="flex items-start justify-between gap-4 border-t border-app-border py-3 first:border-t-0 first:pt-0 last:pb-0 max-sm:flex-col"
                      key={`${entry.formFingerprint}:${entry.fieldFingerprint}`}
                    >
                      <div className="grid min-w-0 gap-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-xs font-semibold text-app-ink">
                            {entry.target}
                          </strong>
                          {stale ? <Chip>Review stale</Chip> : null}
                        </div>
                        <div className="break-all text-[11px] leading-4 text-app-subtle">
                          Form {entry.formFingerprint} · Field{' '}
                          {entry.fieldFingerprint}
                        </div>
                      </div>
                      <Button
                        className="shrink-0"
                        variant="danger"
                        onClick={() => void remove(entry)}
                      >
                        Delete mapping
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </div>

      {entries.length > 0 ? (
        !confirmResetAll ? (
          <ActionRow>
            <Button variant="danger" onClick={() => setConfirmResetAll(true)}>
              Reset all learned mappings
            </Button>
          </ActionRow>
        ) : (
          <div className="grid gap-3 border-t border-app-border pt-6">
            <p className="m-0 text-xs leading-5 text-app-text">
              This removes all learned field corrections from local storage.
            </p>
            <ActionRow>
              <Button variant="danger" onClick={() => void resetAll()}>
                Confirm reset all
              </Button>
              <Button onClick={() => setConfirmResetAll(false)}>Cancel</Button>
            </ActionRow>
          </div>
        )
      ) : null}
    </Section>
  );
}
