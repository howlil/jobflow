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
  onBack: () => void;
  onSave: (draft: ApplicationDraft) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState(initialDraft);

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
      <button className="jobflow-panel__back" type="button" onClick={onBack}>
        <ArrowLeft aria-hidden="true" size={15} />
        Back
      </button>
      <div>
        <p className="jobflow-panel__section-label">Pipeline</p>
        <h2>Close the application loop</h2>
        <p className="jobflow-panel__helper">
          Confirm the detected job details once. Jobflow never submits the application; use Mark as applied only after you submit on the employer site.
        </p>
      </div>
      <div className="jobflow-panel__form">
        <label>
          Company
          <input value={draft.company} onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))} />
        </label>
        <label>
          Role
          <input value={draft.role} onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value }))} />
        </label>
        <label>
          Job URL
          <input type="url" value={draft.jobUrl ?? ''} onChange={(event) => setDraft((current) => ({ ...current, jobUrl: event.target.value }))} />
        </label>
      </div>
      {status ? <p className="jobflow-panel__status" role="status">{status}</p> : null}
      <div className="jobflow-panel__review-actions">
        <button className="jobflow-panel__action jobflow-panel__action--secondary" type="button" onClick={() => save('saved')}>
          Save for later
        </button>
        <button className="jobflow-panel__action jobflow-panel__action--primary" type="button" onClick={() => save('applied')}>
          Mark as applied
        </button>
      </div>
    </section>
  );
}
