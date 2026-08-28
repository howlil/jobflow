import { Plus, Trash2 } from 'lucide-react';

import {
  CollapsibleRecord,
  createProfileItemId,
  dateInputProps,
  dateRangeSummary,
  descriptionPreview,
  parseNullableNumber,
} from './profile-section-helpers';
import type { ProfileSectionProps } from './profile-section-types';

export function EducationSection({
  activeSection,
  changeProfile,
  profile,
}: ProfileSectionProps) {
  return (
    <section className="profile-section" hidden={activeSection !== 'education'}>
      <div className="jobflow-section-heading">
        <h2>Education</h2>
        <button
          className="jobflow-button"
          type="button"
          onClick={() =>
            changeProfile((draft) => {
              draft.baseProfile.professional.education.push({
                id: createProfileItemId(),
                institution: '',
                degree: '',
                fieldOfStudy: '',
                location: '',
                startDate: '',
                endDate: '',
                gpa: null,
                maxGpa: null,
                description: '',
              });
            })
          }
        >
          <Plus aria-hidden="true" size={16} />
          Add education
        </button>
      </div>
      {profile.baseProfile.professional.education.length === 0 ? (
        <div className="jobflow-empty-row">No education added yet.</div>
      ) : (
        <div className="record-list">
          {profile.baseProfile.professional.education.map(
            (education, index) => (
              <CollapsibleRecord
                key={education.id}
                initialOpen={
                  education.institution.trim() === '' &&
                  education.degree.trim() === ''
                }
              >
                <summary className="record-summary">
                  <span>{education.degree || 'Untitled education'}</span>
                  <span className="record-summary-meta">
                    {education.institution ||
                      dateRangeSummary(
                        education.startDate,
                        education.endDate,
                      ) ||
                      `Education ${index + 1}`}
                  </span>
                </summary>
                <div className="form-grid">
                  {[
                    ['Institution', 'institution'],
                    ['Degree', 'degree'],
                    ['Field of study', 'fieldOfStudy'],
                    ['Location', 'location'],
                  ].map(([label, key]) => (
                    <label key={key}>
                      {label}
                      <input
                        value={String(
                          education[key as keyof typeof education] ?? '',
                        )}
                        onChange={(event) =>
                          changeProfile((draft) => {
                            const item =
                              draft.baseProfile.professional.education[index];
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
                      {...dateInputProps(education.startDate)}
                      onChange={(event) =>
                        changeProfile((draft) => {
                          const item =
                            draft.baseProfile.professional.education[index];
                          if (item !== undefined)
                            item.startDate = event.target.value;
                        })
                      }
                    />
                  </label>
                  <label>
                    End date
                    <input
                      {...dateInputProps(education.endDate)}
                      onChange={(event) =>
                        changeProfile((draft) => {
                          const item =
                            draft.baseProfile.professional.education[index];
                          if (item !== undefined)
                            item.endDate = event.target.value;
                        })
                      }
                    />
                  </label>
                  <label>
                    GPA
                    <input
                      inputMode="decimal"
                      value={education.gpa ?? ''}
                      onChange={(event) =>
                        changeProfile((draft) => {
                          const item =
                            draft.baseProfile.professional.education[index];
                          if (item !== undefined)
                            item.gpa = parseNullableNumber(event.target.value);
                        })
                      }
                    />
                  </label>
                  <label>
                    Max GPA
                    <input
                      inputMode="decimal"
                      value={education.maxGpa ?? ''}
                      onChange={(event) =>
                        changeProfile((draft) => {
                          const item =
                            draft.baseProfile.professional.education[index];
                          if (item !== undefined)
                            item.maxGpa = parseNullableNumber(
                              event.target.value,
                            );
                        })
                      }
                    />
                  </label>
                </div>
                <label>
                  Description
                  <textarea
                    placeholder={'Use one academic highlight per line.'}
                    value={education.description}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.education[index];
                        if (item !== undefined)
                          item.description = event.target.value;
                      })
                    }
                  />
                </label>
                {descriptionPreview(education.description)}
                <button
                  className="jobflow-button"
                  type="button"
                  onClick={() =>
                    changeProfile((draft) => {
                      draft.baseProfile.professional.education.splice(index, 1);
                    })
                  }
                >
                  <Trash2 aria-hidden="true" size={16} />
                  Remove education {index + 1}
                </button>
              </CollapsibleRecord>
            ),
          )}
        </div>
      )}
    </section>
  );
}
