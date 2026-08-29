import { Plus, Trash2 } from 'lucide-react';

import {
  createProfileItemId,
  listValue,
  parseList,
} from './profile-section-helpers';
import type { ProfileSectionProps } from './profile-section-types';

export function DocumentsSection({
  activeSection,
  changeProfile,
  profile,
}: ProfileSectionProps) {
  return (
    <section className="profile-section" hidden={activeSection !== 'documents'}>
      <div className="jobflow-section-heading">
        <div>
          <h2>Reusable answers</h2>
          <p className="muted">
            Keep answers you reuse across application forms. Resume files are
            managed above as stored documents.
          </p>
        </div>
        <button
          className="jobflow-button"
          type="button"
          onClick={() =>
            changeProfile((draft) =>
              draft.baseProfile.customAnswers.push({
                id: createProfileItemId(),
                question: '',
                answer: '',
                canonicalIntent: '',
                tags: [],
              }),
            )
          }
        >
          <Plus aria-hidden="true" size={16} />
          Add answer
        </button>
      </div>

      {profile.baseProfile.customAnswers.length === 0 ? (
        <div className="jobflow-empty-row">No reusable answers added yet.</div>
      ) : (
        <div className="record-list">
          {profile.baseProfile.customAnswers.map((answer, index) => (
            <article className="record-card" key={answer.id}>
              <label>
                Question
                <input
                  value={answer.question}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item = draft.baseProfile.customAnswers[index];
                      if (item !== undefined) item.question = event.target.value;
                    })
                  }
                />
              </label>
              <label>
                Answer
                <textarea
                  value={answer.answer}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item = draft.baseProfile.customAnswers[index];
                      if (item !== undefined) item.answer = event.target.value;
                    })
                  }
                />
              </label>
              <label>
                Tags, comma separated
                <input
                  value={listValue(answer.tags)}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item = draft.baseProfile.customAnswers[index];
                      if (item !== undefined)
                        item.tags = parseList(event.target.value);
                    })
                  }
                />
              </label>
              <button
                className="jobflow-button"
                type="button"
                onClick={() =>
                  changeProfile((draft) =>
                    draft.baseProfile.customAnswers.splice(index, 1),
                  )
                }
              >
                <Trash2 aria-hidden="true" size={16} />
                Remove answer
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
