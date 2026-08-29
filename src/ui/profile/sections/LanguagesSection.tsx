import { Plus, Trash2 } from 'lucide-react';

import { createProfileItemId } from './profile-section-helpers';
import type { ProfileSectionProps } from './profile-section-types';

type LanguagesSectionProps = Pick<
  ProfileSectionProps,
  'changeProfile' | 'profile'
>;

export function LanguagesSection({
  changeProfile,
  profile,
}: LanguagesSectionProps) {
  return (
    <>
      <div className="jobflow-section-heading">
        <h3>Languages</h3>
        <button
          className="jobflow-button"
          type="button"
          onClick={() =>
            changeProfile((draft) =>
              draft.baseProfile.professional.languages.push({
                id: createProfileItemId(),
                name: '',
                proficiency: '',
              }),
            )
          }
        >
          <Plus aria-hidden="true" size={16} />
          Add language
        </button>
      </div>
      {profile.baseProfile.professional.languages.map((language, index) => (
        <article className="record-card" key={language.id}>
          <div className="form-grid">
            <label>
              Language
              <input
                value={language.name}
                onChange={(event) =>
                  changeProfile((draft) => {
                    const item =
                      draft.baseProfile.professional.languages[index];
                    if (item !== undefined) item.name = event.target.value;
                  })
                }
              />
            </label>
            <label>
              Proficiency
              <input
                value={language.proficiency}
                onChange={(event) =>
                  changeProfile((draft) => {
                    const item =
                      draft.baseProfile.professional.languages[index];
                    if (item !== undefined)
                      item.proficiency = event.target.value;
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
                draft.baseProfile.professional.languages.splice(index, 1),
              )
            }
          >
            <Trash2 aria-hidden="true" size={16} />
            Remove
          </button>
        </article>
      ))}
    </>
  );
}
