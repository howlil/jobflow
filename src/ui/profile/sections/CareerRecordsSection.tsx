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

export function CareerRecordsSection({
  activeSection,
  changeProfile,
  profile,
}: ProfileSectionProps) {
  return (
    <details
      className="profile-section"
      open
      hidden={activeSection !== 'experience'}
    >
      <summary>Languages, certifications, and projects</summary>

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

      <div className="jobflow-section-heading">
        <h3>Certifications</h3>
        <button
          className="jobflow-button"
          type="button"
          onClick={() =>
            changeProfile((draft) =>
              draft.baseProfile.professional.certifications.push({
                id: createProfileItemId(),
                name: '',
                issuer: '',
                issueDate: '',
                expiryDate: '',
                credentialId: '',
                url: '',
              }),
            )
          }
        >
          <Plus aria-hidden="true" size={16} />
          Add certification
        </button>
      </div>
      {profile.baseProfile.professional.certifications.map(
        (certification, index) => (
          <article className="record-card" key={certification.id}>
            <div className="form-grid">
              <label>
                Certification
                <input
                  value={certification.name}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item =
                        draft.baseProfile.professional.certifications[index];
                      if (item !== undefined) item.name = event.target.value;
                    })
                  }
                />
              </label>
              <label>
                Issuer
                <input
                  value={certification.issuer}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item =
                        draft.baseProfile.professional.certifications[index];
                      if (item !== undefined) item.issuer = event.target.value;
                    })
                  }
                />
              </label>
              <label>
                Credential URL
                <input
                  value={certification.url}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item =
                        draft.baseProfile.professional.certifications[index];
                      if (item !== undefined) item.url = event.target.value;
                    })
                  }
                />
              </label>
              <label>
                Issue date
                <input
                  {...dateInputProps(certification.issueDate)}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item =
                        draft.baseProfile.professional.certifications[index];
                      if (item !== undefined)
                        item.issueDate = event.target.value;
                    })
                  }
                />
              </label>
              <label>
                Expiry date
                <input
                  {...dateInputProps(certification.expiryDate)}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item =
                        draft.baseProfile.professional.certifications[index];
                      if (item !== undefined)
                        item.expiryDate = event.target.value;
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
                  draft.baseProfile.professional.certifications.splice(
                    index,
                    1,
                  ),
                )
              }
            >
              <Trash2 aria-hidden="true" size={16} />
              Remove
            </button>
          </article>
        ),
      )}

      <div className="jobflow-section-heading">
        <h3>Projects</h3>
        <button
          className="jobflow-button"
          type="button"
          onClick={() =>
            changeProfile((draft) =>
              draft.baseProfile.professional.projects.push({
                id: createProfileItemId(),
                name: '',
                role: '',
                description: '',
                url: '',
                startDate: '',
                endDate: '',
                skills: [],
              }),
            )
          }
        >
          <Plus aria-hidden="true" size={16} />
          Add project
        </button>
      </div>
      {profile.baseProfile.professional.projects.map((project, index) => (
        <CollapsibleRecord
          key={project.id}
          initialOpen={project.name.trim() === ''}
        >
          <summary className="record-summary">
            <span>{project.name || 'Untitled project'}</span>
            <span className="record-summary-meta">
              {project.role ||
                dateRangeSummary(project.startDate, project.endDate) ||
                `Project ${index + 1}`}
            </span>
          </summary>
          <div className="form-grid">
            <label>
              Project
              <input
                value={project.name}
                onChange={(event) =>
                  changeProfile((draft) => {
                    const item = draft.baseProfile.professional.projects[index];
                    if (item !== undefined) item.name = event.target.value;
                  })
                }
              />
            </label>
            <label>
              Role
              <input
                value={project.role}
                onChange={(event) =>
                  changeProfile((draft) => {
                    const item = draft.baseProfile.professional.projects[index];
                    if (item !== undefined) item.role = event.target.value;
                  })
                }
              />
            </label>
            <label>
              URL
              <input
                value={project.url}
                onChange={(event) =>
                  changeProfile((draft) => {
                    const item = draft.baseProfile.professional.projects[index];
                    if (item !== undefined) item.url = event.target.value;
                  })
                }
              />
            </label>
            <label>
              Start date
              <input
                {...dateInputProps(project.startDate)}
                onChange={(event) =>
                  changeProfile((draft) => {
                    const item = draft.baseProfile.professional.projects[index];
                    if (item !== undefined) item.startDate = event.target.value;
                  })
                }
              />
            </label>
            <label>
              End date
              <input
                {...dateInputProps(project.endDate)}
                onChange={(event) =>
                  changeProfile((draft) => {
                    const item = draft.baseProfile.professional.projects[index];
                    if (item !== undefined) item.endDate = event.target.value;
                  })
                }
              />
            </label>
            <label>
              Skills, comma separated
              <input
                value={listValue(project.skills)}
                onChange={(event) =>
                  changeProfile((draft) => {
                    const item = draft.baseProfile.professional.projects[index];
                    if (item !== undefined)
                      item.skills = syncSkills(
                        draft,
                        parseList(event.target.value),
                      );
                  })
                }
              />
            </label>
          </div>
          {skillNames(profile).length > 0 ? (
            <label>
              Add existing skill
              <select
                value=""
                aria-label={`Add existing skill to project ${index + 1}`}
                onChange={(event) => {
                  const selected = event.target.value;
                  if (selected === '') return;
                  changeProfile((draft) => {
                    const item = draft.baseProfile.professional.projects[index];
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
          <label>
            Description
            <textarea
              placeholder={'Use one project result per line.'}
              value={project.description}
              onChange={(event) =>
                changeProfile((draft) => {
                  const item = draft.baseProfile.professional.projects[index];
                  if (item !== undefined) item.description = event.target.value;
                })
              }
            />
          </label>
          {descriptionPreview(project.description)}
          <button
            className="jobflow-button"
            type="button"
            onClick={() =>
              changeProfile((draft) =>
                draft.baseProfile.professional.projects.splice(index, 1),
              )
            }
          >
            <Trash2 aria-hidden="true" size={16} />
            Remove
          </button>
        </CollapsibleRecord>
      ))}
    </details>
  );
}
