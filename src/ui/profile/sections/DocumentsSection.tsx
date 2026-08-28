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
    <details
      className="profile-section"
      open
      hidden={activeSection !== 'documents'}
    >
      <summary>Documents and reusable answers</summary>
      <div className="jobflow-section-heading">
        <div>
          <h3>Resume metadata</h3>
          <p className="muted">
            Metadata only. Job Flow never uploads the file for you.
          </p>
        </div>
        <button
          className="jobflow-button"
          type="button"
          onClick={() =>
            changeProfile((draft) =>
              draft.baseProfile.documents.resumes.push({
                id: createProfileItemId(),
                label: '',
                fileName: '',
                mimeType: 'application/pdf',
                lastKnownModified: null,
              }),
            )
          }
        >
          <Plus aria-hidden="true" size={16} />
          Add resume
        </button>
      </div>
      {profile.baseProfile.documents.resumes.map((document, index) => (
        <article className="record-card" key={document.id}>
          <div className="form-grid">
            <label>
              Label
              <input
                value={document.label}
                onChange={(event) =>
                  changeProfile((draft) => {
                    const item = draft.baseProfile.documents.resumes[index];
                    if (item !== undefined) item.label = event.target.value;
                  })
                }
              />
            </label>
            <label>
              File name
              <input
                value={document.fileName}
                onChange={(event) =>
                  changeProfile((draft) => {
                    const item = draft.baseProfile.documents.resumes[index];
                    if (item !== undefined) item.fileName = event.target.value;
                  })
                }
              />
            </label>
          </div>
          <button
            className="jobflow-button"
            type="button"
            onClick={() =>
              changeProfile((draft) =>
                draft.baseProfile.documents.resumes.splice(index, 1),
              )
            }
          >
            <Trash2 aria-hidden="true" size={16} />
            Remove resume
          </button>
        </article>
      ))}

      <div className="jobflow-section-heading">
        <h3>Reusable answers</h3>
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
    </details>
  );
}
