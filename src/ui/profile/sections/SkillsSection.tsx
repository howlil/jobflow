import { Plus, Trash2 } from 'lucide-react';

import {
  createProfileItemId,
  parseNullableNumber,
} from './profile-section-helpers';
import type { ProfileSectionProps } from './profile-section-types';

export function SkillsSection({
  activeSection,
  changeProfile,
  profile,
}: ProfileSectionProps) {
  return (
    <section className="profile-section" hidden={activeSection !== 'skills'}>
      <div className="jobflow-section-heading">
        <h2>Skills</h2>
        <button
          className="jobflow-button"
          type="button"
          onClick={() =>
            changeProfile((draft) => {
              draft.baseProfile.professional.skills.push({
                id: createProfileItemId(),
                name: '',
                level: '',
                yearsExperience: null,
              });
            })
          }
        >
          <Plus aria-hidden="true" size={16} />
          Add skill
        </button>
      </div>
      {profile.baseProfile.professional.skills.length === 0 ? (
        <div className="jobflow-empty-row">No skills added yet.</div>
      ) : (
        <div className="record-list">
          {profile.baseProfile.professional.skills.map((skill, index) => (
            <article className="record-card" key={skill.id}>
              <div className="form-grid">
                <label>
                  Skill
                  <input
                    value={skill.name}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.skills[index];
                        if (item !== undefined) item.name = event.target.value;
                      })
                    }
                  />
                </label>
                <label>
                  Level
                  <input
                    value={skill.level}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.skills[index];
                        if (item !== undefined) item.level = event.target.value;
                      })
                    }
                  />
                </label>
                <label>
                  Years experience
                  <input
                    inputMode="decimal"
                    value={skill.yearsExperience ?? ''}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.skills[index];
                        if (item !== undefined)
                          item.yearsExperience = parseNullableNumber(
                            event.target.value,
                          );
                      })
                    }
                  />
                </label>
              </div>
              <button
                className="jobflow-button"
                type="button"
                onClick={() =>
                  changeProfile((draft) => {
                    draft.baseProfile.professional.skills.splice(index, 1);
                  })
                }
              >
                <Trash2 aria-hidden="true" size={16} />
                Remove skill {index + 1}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
