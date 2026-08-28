import { Plus, Trash2 } from 'lucide-react';

import {
  createProfileItemId,
  listValue,
  parseList,
} from './profile-section-helpers';
import type { ProfileSectionProps } from './profile-section-types';

export function VariantsSection({
  activeSection,
  changeProfile,
  profile,
}: ProfileSectionProps) {
  return (
    <section className="profile-section" hidden={activeSection !== 'variants'}>
      <div className="jobflow-section-heading">
        <div>
          <h2>Application variants</h2>
          <p className="muted">
            Keep factual data in the base profile; variants store only
            role-specific overrides and preferred documents.
          </p>
        </div>
        <button
          className="jobflow-button"
          type="button"
          onClick={() =>
            changeProfile((draft) => {
              const id = createProfileItemId();
              draft.variants.push({ id, name: '', targetRoles: [] });
              draft.preferences.defaultVariantId ??= id;
            })
          }
        >
          <Plus aria-hidden="true" size={16} />
          Add variant
        </button>
      </div>

      {profile.variants.length > 0 ? (
        <label className="default-variant">
          Default variant
          <select
            value={profile.preferences.defaultVariantId ?? ''}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.preferences.defaultVariantId = event.target.value || null;
              })
            }
          >
            <option value="">None</option>
            {profile.variants.map((variant) => (
              <option value={variant.id} key={variant.id}>
                {variant.name || 'Untitled variant'}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {profile.variants.length === 0 ? (
        <div className="jobflow-empty-row">
          No application variants added yet.
        </div>
      ) : (
        <div className="record-list">
          {profile.variants.map((variant, index) => (
            <article className="record-card" key={variant.id}>
              <div className="form-grid">
                <label>
                  Variant name
                  <input
                    value={variant.name}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item = draft.variants[index];
                        if (item !== undefined) item.name = event.target.value;
                      })
                    }
                  />
                </label>
                <label>
                  Target roles, comma separated
                  <input
                    value={listValue(variant.targetRoles)}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item = draft.variants[index];
                        if (item !== undefined)
                          item.targetRoles = parseList(event.target.value);
                      })
                    }
                  />
                </label>
                <label>
                  Variant headline
                  <input
                    value={variant.headlineOverride ?? ''}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item = draft.variants[index];
                        if (item !== undefined)
                          item.headlineOverride = event.target.value;
                      })
                    }
                  />
                </label>
                <label>
                  Preferred resume
                  <select
                    value={variant.preferredResumeId ?? ''}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item = draft.variants[index];
                        if (item !== undefined)
                          item.preferredResumeId = event.target.value || null;
                      })
                    }
                  >
                    <option value="">Use first configured resume</option>
                    {profile.baseProfile.documents.resumes.map((resume) => (
                      <option value={resume.id} key={resume.id}>
                        {resume.label || resume.fileName || 'Untitled resume'}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                className="jobflow-button"
                type="button"
                onClick={() =>
                  changeProfile((draft) => {
                    const removed = draft.variants[index];
                    draft.variants.splice(index, 1);
                    if (
                      removed !== undefined &&
                      draft.preferences.defaultVariantId === removed.id
                    ) {
                      draft.preferences.defaultVariantId =
                        draft.variants[0]?.id ?? null;
                    }
                  })
                }
              >
                <Trash2 aria-hidden="true" size={16} />
                Remove variant {index + 1}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
