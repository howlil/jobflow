import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import type { ApplicationDraft } from '../../application/applications/application-service';

export function ApplicationClosureView({
  initialDraft,
  status,
  onBack,
  onSave,
}: {
  initialDraft: ApplicationDraft;
  status: string | null;
  onBack?: () => void;
  onSave: (draft: ApplicationDraft) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState<ApplicationDraft>(initialDraft);

  function save(stage: ApplicationDraft['stage']) {
    const now = new Date().toISOString();
    void onSave({
      ...draft,
      stage,
      ...(stage === 'applied' ? { appliedAt: draft.appliedAt ?? now } : {}),
    });
  }

  return (
    <section className="jobflow-panel__detail" aria-label="Application closure">
      {onBack !== undefined ? (
        <button className="jobflow-panel__back" type="button" onClick={onBack}>
          <ArrowLeft aria-hidden="true" size={15} />
          Back
        </button>
      ) : null}
      <div>
        <p className="jobflow-panel__section-label">Pipeline</p>
        <h2>Close the application loop</h2>
        <p className="jobflow-panel__helper">
          Confirm the detected job details and optional follow-up once. Jobflow
          never submits the application; mark it applied only after you submit
          on the employer site.
        </p>
      </div>
      <div className="jobflow-panel__form">
        <label>
          Company
          <input
            value={draft.company}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                company: event.target.value,
              }))
            }
          />
        </label>
        <label>
          Role
          <input
            value={draft.role}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                role: event.target.value,
              }))
            }
          />
        </label>
        <label>
          Job URL
          <input
            type="url"
            value={draft.jobUrl ?? ''}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                jobUrl: event.target.value,
              }))
            }
          />
        </label>
        <label>
          Next action
          <input
            type="date"
            value={draft.nextActionAt ?? ''}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                nextActionAt: event.target.value,
              }))
            }
          />
        </label>
        <label>
          Notes
          <textarea
            value={draft.notes ?? ''}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                notes: event.target.value,
              }))
            }
          />
        </label>
      </div>
      {status !== null ? (
        <p className="jobflow-panel__status" role="status">
          {status}
        </p>
      ) : null}
      <div className="jobflow-panel__review-actions">
        <button
          className="jobflow-panel__action jobflow-panel__action--secondary"
          type="button"
          onClick={() => save(draft.stage)}
        >
          Save to pipeline
        </button>
        <button
          className="jobflow-panel__action jobflow-panel__action--primary"
          type="button"
          onClick={() => save('applied')}
        >
          Mark as applied
        </button>
      </div>
    </section>
  );
}
