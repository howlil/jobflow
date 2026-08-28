import { Plus, Trash2 } from 'lucide-react';

import {
  addLinkedSkill,
  CollapsibleRecord,
  createProfileItemId,
  dateInputProps,
  dateRangeSummary,
  descriptionPreview,
  listValue,
  parseList,
  skillNames,
  syncSkills,
} from './profile-section-helpers';
import type { ProfileSectionProps } from './profile-section-types';

export function ExperienceSection({
  activeSection,
  changeProfile,
  profile,
}: ProfileSectionProps) {
  return (
    <section
      className="profile-section"
      hidden={activeSection !== 'experience'}
    >
      <div className="jobflow-section-heading">
        <h2>Experience</h2>
        <button
          className="jobflow-button"
          type="button"
          onClick={() =>
            changeProfile((draft) => {
              draft.baseProfile.professional.experiences.push({
                id: createProfileItemId(),
                company: '',
                title: '',
                employmentType: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                description: '',
                achievements: [],
                skills: [],
              });
            })
          }
        >
          <Plus aria-hidden="true" size={16} />
          Add experience
        </button>
      </div>
      {profile.baseProfile.professional.experiences.length === 0 ? (
        <div className="jobflow-empty-row">No experience added yet.</div>
      ) : (
        <div className="record-list">
          {profile.baseProfile.professional.experiences.map(
            (experience, index) => (
              <CollapsibleRecord
                key={experience.id}
                initialOpen={
                  experience.company.trim() === '' &&
                  experience.title.trim() === ''
                }
              >
                <summary className="record-summary">
                  <span>
                    {experience.title || 'Untitled role'}
                    {experience.company ? ` at ${experience.company}` : ''}
                  </span>
                  <span className="record-summary-meta">
                    {dateRangeSummary(
                      experience.startDate,
                      experience.endDate,
                      experience.current,
                    ) || `Experience ${index + 1}`}
                  </span>
                </summary>
                <div className="form-grid">
                  {[
                    ['Company', 'company'],
                    ['Job title', 'title'],
                    ['Employment type', 'employmentType'],
                    ['Location', 'location'],
                  ].map(([label, key]) => (
                    <label key={key}>
                      {label}
                      <input
                        value={String(
                          experience[key as keyof typeof experience] ?? '',
                        )}
                        onChange={(event) =>
                          changeProfile((draft) => {
                            const item =
                              draft.baseProfile.professional.experiences[index];
                            if (item !== undefined && key !== undefined) {
                              Reflect.set(item, key, event.target.value);
                            }
                          })
                        }
                      />
                    </label>
                  ))}
                  <label>
                    Start date
                    <input
                      {...dateInputProps(experience.startDate)}
                      onChange={(event) =>
                        changeProfile((draft) => {
                          const item =
                            draft.baseProfile.professional.experiences[index];
                          if (item !== undefined)
                            item.startDate = event.target.value;
                        })
                      }
                    />
                  </label>
                  <label>
                    End date
                    <input
                      {...dateInputProps(experience.endDate)}
                      onChange={(event) =>
                        changeProfile((draft) => {
                          const item =
                            draft.baseProfile.professional.experiences[index];
                          if (item !== undefined)
                            item.endDate = event.target.value;
                        })
                      }
                    />
                  </label>
                </div>
                <label>
                  <input
                    type="checkbox"
                    checked={experience.current}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.experiences[index];
                        if (item !== undefined)
                          item.current = event.target.checked;
                      })
                    }
                  />
                  Current role
                </label>
                <label>
                  Description
                  <textarea
                    placeholder={'Lead with one impact per line.'}
                    value={experience.description}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.experiences[index];
                        if (item !== undefined)
                          item.description = event.target.value;
                      })
                    }
                  />
                </label>
                {descriptionPreview(experience.description)}
                <label>
                  Achievements, comma separated
                  <input
                    value={listValue(experience.achievements)}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.experiences[index];
                        if (item !== undefined)
                          item.achievements = parseList(event.target.value);
                      })
                    }
                  />
                </label>
                <label>
                  Related skills, comma separated
                  <input
                    value={listValue(experience.skills ?? [])}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.experiences[index];
                        if (item !== undefined) {
                          item.skills = syncSkills(
                            draft,
                            parseList(event.target.value),
                          );
                        }
                      })
                    }
                  />
                </label>
                {skillNames(profile).length > 0 ? (
                  <label>
                    Add existing skill
                    <select
                      value=""
                      aria-label={`Add existing skill to experience ${index + 1}`}
                      onChange={(event) => {
                        const selected = event.target.value;
                        if (selected === '') return;
                        changeProfile((draft) => {
                          const item =
                            draft.baseProfile.professional.experiences[index];
                          if (item !== undefined) {
                            item.skills = addLinkedSkill(item.skills, selected);
                          }
                        });
                      }}
                    >
                      <option value="">Choose skill</option>
                      {skillNames(profile).map((skill) => (
                        <option value={skill} key={skill}>
                          {skill}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <button
                  className="jobflow-button"
                  type="button"
                  onClick={() =>
                    changeProfile((draft) => {
                      draft.baseProfile.professional.experiences.splice(
                        index,
                        1,
                      );
                    })
                  }
                >
                  <Trash2 aria-hidden="true" size={16} />
                  Remove experience {index + 1}
                </button>
              </CollapsibleRecord>
            ),
          )}
        </div>
      )}
    </section>
  );
}
