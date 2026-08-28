import { Download, Plus, Trash2, Upload } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import type { StoredProfileEnvelope } from '../../../domain/profile/profile-schema';
import {
  SensitiveVaultSection,
  type VaultClient,
} from '../../vault/SensitiveVaultSection';
import type { WorkspaceSection } from '../workspace-sections';

type ContactItem =
  StoredProfileEnvelope['baseProfile']['contact']['emails'][number];
export type ProfileMutation = (profile: StoredProfileEnvelope) => void;

type SectionProps = {
  activeSection: WorkspaceSection;
  changeProfile: (mutate: ProfileMutation) => void;
  profile: StoredProfileEnvelope;
};

type PersonalSectionProps = SectionProps;
type ContactSectionProps = SectionProps;
type LinksSectionProps = SectionProps;
type ExperienceSectionProps = SectionProps;
type EducationSectionProps = SectionProps;
type SkillsSectionProps = SectionProps;
type PreferencesSectionProps = SectionProps;
type DocumentsSectionProps = SectionProps;
type SensitiveSectionProps = {
  activeSection: WorkspaceSection;
  vaultClient: VaultClient | undefined;
};
type VariantsSectionProps = SectionProps;
type BackupSectionProps = {
  activeSection: WorkspaceSection;
  exportProfile: () => void;
  importProfile: (file: File) => void;
};

type CollapsibleRecordProps = {
  children: ReactNode;
  initialOpen: boolean;
};

type ProfileFormSectionsProps = SectionProps & {
  exportProfile: () => void;
  importProfile: (file: File) => void;
  vaultClient: VaultClient | undefined;
};

function createId(): string {
  return globalThis.crypto.randomUUID();
}

export function primaryContactValue(items: ContactItem[]): string {
  return items.find((item) => item.primary)?.value ?? items[0]?.value ?? '';
}

function updatePrimaryContact(
  items: ContactItem[],
  value: string,
): ContactItem[] {
  const primaryIndex = items.findIndex((item) => item.primary);
  if (primaryIndex === -1) {
    return [
      { id: createId(), label: 'Primary', value, primary: true },
      ...items,
    ];
  }
  return items.map((item, index) =>
    index === primaryIndex ? { ...item, value } : item,
  );
}

function parseList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function listValue(values: string[]): string {
  return values.join(', ');
}

function parseNullableNumber(value: string): number | null {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function sectionIsProfile(activeSection: WorkspaceSection): boolean {
  return (
    activeSection === 'personal' ||
    activeSection === 'contact' ||
    activeSection === 'links'
  );
}

function formatDateValue(value: string): string {
  const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoDateMatch === null) return value;
  const [, year, month, day] = isoDateMatch;
  return `${day}/${month}/${year}`;
}

function dateInputProps(value: string) {
  return {
    inputMode: 'numeric' as const,
    pattern: '\\d{2}/\\d{2}/\\d{4}',
    placeholder: 'DD/MM/YYYY',
    value: formatDateValue(value),
  };
}

function dateRangeSummary(
  startDate: string,
  endDate: string,
  current = false,
): string {
  const start = formatDateValue(startDate);
  const end = current ? 'Present' : formatDateValue(endDate);
  if (start !== '' && end !== '') return `${start} - ${end}`;
  return start || end;
}

function descriptionItems(value: string): string[] {
  return value
    .split(/\r?\n|;+/)
    .map((item) => item.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean);
}

function descriptionPreview(value: string) {
  const items = descriptionItems(value);
  if (items.length === 0) return null;

  return (
    <ul className="description-preview-list" aria-label="Description preview">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function skillNames(profile: StoredProfileEnvelope): string[] {
  return profile.baseProfile.professional.skills
    .map((skill) => skill.name.trim())
    .filter(Boolean);
}

function ensureSkill(profile: StoredProfileEnvelope, name: string): void {
  const normalized = name.trim();
  if (normalized === '') return;
  const exists = profile.baseProfile.professional.skills.some(
    (skill) => skill.name.trim().toLowerCase() === normalized.toLowerCase(),
  );
  if (exists) return;
  profile.baseProfile.professional.skills.push({
    id: createId(),
    name: normalized,
    level: '',
    yearsExperience: null,
  });
}

function syncSkills(
  profile: StoredProfileEnvelope,
  values: string[],
): string[] {
  const parsed = values.map((value) => value.trim()).filter(Boolean);
  for (const value of parsed) {
    ensureSkill(profile, value);
  }
  return parsed;
}

function addLinkedSkill(current: string[] | undefined, skillName: string) {
  const normalized = skillName.trim();
  if (normalized === '') return current ?? [];
  const values = current ?? [];
  const exists = values.some(
    (value) => value.trim().toLowerCase() === normalized.toLowerCase(),
  );
  return exists ? values : [...values, normalized];
}

function CollapsibleRecord({ children, initialOpen }: CollapsibleRecordProps) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <details
      className="record-card"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      {children}
    </details>
  );
}

function PersonalSection(props: PersonalSectionProps) {
  const { activeSection, changeProfile, profile } = props;

  return (
    <section
      className="profile-section"
      id="basic-info"
      hidden={!sectionIsProfile(activeSection)}
    >
      <h2>Basic information</h2>
      <div className="form-grid">
        <label>
          First name
          <input
            value={profile.baseProfile.personal.legalName.first}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.personal.legalName.first = event.target.value;
              })
            }
          />
        </label>
        <label>
          Middle name
          <input
            value={profile.baseProfile.personal.legalName.middle}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.personal.legalName.middle =
                  event.target.value;
              })
            }
          />
        </label>
        <label>
          Last name
          <input
            value={profile.baseProfile.personal.legalName.last}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.personal.legalName.last = event.target.value;
              })
            }
          />
        </label>
        <label>
          Preferred name
          <input
            value={profile.baseProfile.personal.preferredName}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.personal.preferredName = event.target.value;
              })
            }
          />
        </label>
        <label>
          Professional headline
          <input
            value={profile.baseProfile.professional.headline}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.professional.headline = event.target.value;
              })
            }
          />
        </label>
      </div>
      <label>
        Professional summary
        <textarea
          value={profile.baseProfile.professional.summary}
          onChange={(event) =>
            changeProfile((draft) => {
              draft.baseProfile.professional.summary = event.target.value;
            })
          }
        />
      </label>
    </section>
  );
}

function ContactSection(props: ContactSectionProps) {
  const { activeSection, changeProfile, profile } = props;

  return (
    <section
      className="profile-section"
      hidden={!sectionIsProfile(activeSection)}
    >
      <h2>Contact</h2>
      <div className="form-grid">
        <label>
          Primary email
          <input
            type="email"
            value={primaryContactValue(profile.baseProfile.contact.emails)}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.contact.emails = updatePrimaryContact(
                  draft.baseProfile.contact.emails,
                  event.target.value,
                );
              })
            }
          />
        </label>
        <label>
          Primary phone
          <input
            value={primaryContactValue(profile.baseProfile.contact.phones)}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.contact.phones = updatePrimaryContact(
                  draft.baseProfile.contact.phones,
                  event.target.value,
                );
              })
            }
          />
        </label>
        <label>
          WhatsApp
          <input
            value={profile.baseProfile.contact.whatsapp}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.contact.whatsapp = event.target.value;
              })
            }
          />
        </label>
        <label>
          Address line
          <input
            value={profile.baseProfile.contact.address.line1}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.contact.address.line1 = event.target.value;
              })
            }
          />
        </label>
        <label>
          City
          <input
            value={profile.baseProfile.contact.address.city}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.contact.address.city = event.target.value;
              })
            }
          />
        </label>
        <label>
          State / province
          <input
            value={profile.baseProfile.contact.address.state}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.contact.address.state = event.target.value;
              })
            }
          />
        </label>
        <label>
          Country
          <input
            value={profile.baseProfile.contact.address.country}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.contact.address.country = event.target.value;
              })
            }
          />
        </label>
        <label>
          Postal code
          <input
            value={profile.baseProfile.contact.address.postalCode}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.contact.address.postalCode =
                  event.target.value;
              })
            }
          />
        </label>
      </div>
    </section>
  );
}

function LinksSection(props: LinksSectionProps) {
  const { activeSection, changeProfile, profile } = props;

  return (
    <section
      className="profile-section"
      hidden={!sectionIsProfile(activeSection)}
    >
      <h2>Links</h2>
      <div className="form-grid">
        <label>
          LinkedIn
          <input
            value={profile.baseProfile.links.linkedin}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.links.linkedin = event.target.value;
              })
            }
          />
        </label>
        <label>
          GitHub
          <input
            value={profile.baseProfile.links.github}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.links.github = event.target.value;
              })
            }
          />
        </label>
        <label>
          Portfolio
          <input
            value={profile.baseProfile.links.portfolio}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.links.portfolio = event.target.value;
              })
            }
          />
        </label>
      </div>
    </section>
  );
}

function ExperienceSection(props: ExperienceSectionProps) {
  const { activeSection, changeProfile, profile } = props;

  return (
    <section
      className="profile-section"
      hidden={activeSection !== 'experience'}
    >
      <div className="fillio-section-heading">
        <h2>Experience</h2>
        <button
          className="fillio-button"
          type="button"
          onClick={() =>
            changeProfile((draft) => {
              draft.baseProfile.professional.experiences.push({
                id: createId(),
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
        <div className="fillio-empty-row">No experience added yet.</div>
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
                  className="fillio-button"
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

function EducationSection(props: EducationSectionProps) {
  const { activeSection, changeProfile, profile } = props;

  return (
    <section className="profile-section" hidden={activeSection !== 'education'}>
      <div className="fillio-section-heading">
        <h2>Education</h2>
        <button
          className="fillio-button"
          type="button"
          onClick={() =>
            changeProfile((draft) => {
              draft.baseProfile.professional.education.push({
                id: createId(),
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
        <div className="fillio-empty-row">No education added yet.</div>
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
                  className="fillio-button"
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

function SkillsSection(props: SkillsSectionProps) {
  const { activeSection, changeProfile, profile } = props;

  return (
    <>
      <section className="profile-section" hidden={activeSection !== 'skills'}>
        <div className="fillio-section-heading">
          <h2>Skills</h2>
          <button
            className="fillio-button"
            type="button"
            onClick={() =>
              changeProfile((draft) => {
                draft.baseProfile.professional.skills.push({
                  id: createId(),
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
          <div className="fillio-empty-row">No skills added yet.</div>
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
                          if (item !== undefined)
                            item.name = event.target.value;
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
                          if (item !== undefined)
                            item.level = event.target.value;
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
                  className="fillio-button"
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

      <details
        className="profile-section"
        open
        hidden={activeSection !== 'experience'}
      >
        <summary>Languages, certifications, and projects</summary>
        <div className="fillio-section-heading">
          <h3>Languages</h3>
          <button
            className="fillio-button"
            type="button"
            onClick={() =>
              changeProfile((draft) =>
                draft.baseProfile.professional.languages.push({
                  id: createId(),
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
              className="fillio-button"
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

        <div className="fillio-section-heading">
          <h3>Certifications</h3>
          <button
            className="fillio-button"
            type="button"
            onClick={() =>
              changeProfile((draft) =>
                draft.baseProfile.professional.certifications.push({
                  id: createId(),
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
                        if (item !== undefined)
                          item.issuer = event.target.value;
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
                className="fillio-button"
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

        <div className="fillio-section-heading">
          <h3>Projects</h3>
          <button
            className="fillio-button"
            type="button"
            onClick={() =>
              changeProfile((draft) =>
                draft.baseProfile.professional.projects.push({
                  id: createId(),
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
                      const item =
                        draft.baseProfile.professional.projects[index];
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
                      const item =
                        draft.baseProfile.professional.projects[index];
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
                      const item =
                        draft.baseProfile.professional.projects[index];
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
                      const item =
                        draft.baseProfile.professional.projects[index];
                      if (item !== undefined)
                        item.startDate = event.target.value;
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
                      const item =
                        draft.baseProfile.professional.projects[index];
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
                      const item =
                        draft.baseProfile.professional.projects[index];
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
                      const item =
                        draft.baseProfile.professional.projects[index];
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
                    if (item !== undefined)
                      item.description = event.target.value;
                  })
                }
              />
            </label>
            {descriptionPreview(project.description)}
            <button
              className="fillio-button"
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
    </>
  );
}

function PreferencesSection(props: PreferencesSectionProps) {
  const { activeSection, changeProfile, profile } = props;

  return (
    <details
      className="profile-section"
      open
      hidden={activeSection !== 'preferences'}
    >
      <summary>Job preferences</summary>
      <div className="form-grid">
        <label>
          Desired roles, comma separated
          <input
            value={listValue(profile.baseProfile.jobPreferences.desiredRoles)}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.jobPreferences.desiredRoles = parseList(
                  event.target.value,
                );
              })
            }
          />
        </label>
        <label>
          Employment types
          <input
            value={listValue(
              profile.baseProfile.jobPreferences.employmentTypes,
            )}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.jobPreferences.employmentTypes = parseList(
                  event.target.value,
                );
              })
            }
          />
        </label>
        <label>
          Work arrangements
          <input
            value={listValue(
              profile.baseProfile.jobPreferences.workArrangements,
            )}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.jobPreferences.workArrangements = parseList(
                  event.target.value,
                );
              })
            }
          />
        </label>
        <label>
          Preferred locations
          <input
            value={listValue(
              profile.baseProfile.jobPreferences.preferredLocations,
            )}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.jobPreferences.preferredLocations = parseList(
                  event.target.value,
                );
              })
            }
          />
        </label>
        <label>
          Availability date
          <input
            {...dateInputProps(
              profile.baseProfile.jobPreferences.availabilityDate,
            )}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.jobPreferences.availabilityDate =
                  event.target.value;
              })
            }
          />
        </label>
        <label>
          Notice period
          <input
            value={profile.baseProfile.jobPreferences.noticePeriod}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.jobPreferences.noticePeriod =
                  event.target.value;
              })
            }
          />
        </label>
      </div>
    </details>
  );
}

function DocumentsSection(props: DocumentsSectionProps) {
  const { activeSection, changeProfile, profile } = props;

  return (
    <details
      className="profile-section"
      open
      hidden={activeSection !== 'documents'}
    >
      <summary>Documents and reusable answers</summary>
      <div className="fillio-section-heading">
        <div>
          <h3>Resume metadata</h3>
          <p className="muted">
            Metadata only. Fillio never uploads the file for you.
          </p>
        </div>
        <button
          className="fillio-button"
          type="button"
          onClick={() =>
            changeProfile((draft) =>
              draft.baseProfile.documents.resumes.push({
                id: createId(),
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
            className="fillio-button"
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

      <div className="fillio-section-heading">
        <h3>Reusable answers</h3>
        <button
          className="fillio-button"
          type="button"
          onClick={() =>
            changeProfile((draft) =>
              draft.baseProfile.customAnswers.push({
                id: createId(),
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
            className="fillio-button"
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

function SensitiveSection(props: SensitiveSectionProps) {
  const { activeSection, vaultClient } = props;

  return vaultClient !== undefined && activeSection === 'sensitive' ? (
    <SensitiveVaultSection vaultClient={vaultClient} />
  ) : null;
}

function VariantsSection(props: VariantsSectionProps) {
  const { activeSection, changeProfile, profile } = props;

  return (
    <section className="profile-section" hidden={activeSection !== 'variants'}>
      <div className="fillio-section-heading">
        <div>
          <h2>Application variants</h2>
          <p className="muted">
            Keep factual data in the base profile; variants store only
            role-specific overrides and preferred documents.
          </p>
        </div>
        <button
          className="fillio-button"
          type="button"
          onClick={() =>
            changeProfile((draft) => {
              const id = createId();
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
        <div className="fillio-empty-row">
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
                className="fillio-button"
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

function BackupSection(props: BackupSectionProps) {
  const { activeSection, exportProfile, importProfile } = props;

  return (
    <details
      className="profile-section"
      open
      hidden={activeSection !== 'backup'}
    >
      <summary>Backup and recovery</summary>
      <p className="muted">
        Export contains the normal versioned profile and variants. Sensitive
        vault values are not exported as plaintext.
      </p>
      <div className="fillio-section-heading">
        <button className="fillio-button" type="button" onClick={exportProfile}>
          <Download aria-hidden="true" size={16} />
          Export profile backup
        </button>
        <label className="fillio-button">
          <Upload aria-hidden="true" size={16} />
          Import profile backup
          <input
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file !== undefined) void importProfile(file);
              event.target.value = '';
            }}
          />
        </label>
      </div>
    </details>
  );
}

export function ProfileFormSections({
  activeSection,
  changeProfile,
  exportProfile,
  importProfile,
  profile,
  vaultClient,
}: ProfileFormSectionsProps) {
  return (
    <>
      <PersonalSection
        activeSection={activeSection}
        changeProfile={changeProfile}
        profile={profile}
      />
      <ContactSection
        activeSection={activeSection}
        changeProfile={changeProfile}
        profile={profile}
      />
      <LinksSection
        activeSection={activeSection}
        changeProfile={changeProfile}
        profile={profile}
      />
      <ExperienceSection
        activeSection={activeSection}
        changeProfile={changeProfile}
        profile={profile}
      />
      <EducationSection
        activeSection={activeSection}
        changeProfile={changeProfile}
        profile={profile}
      />
      <SkillsSection
        activeSection={activeSection}
        changeProfile={changeProfile}
        profile={profile}
      />
      <PreferencesSection
        activeSection={activeSection}
        changeProfile={changeProfile}
        profile={profile}
      />
      <DocumentsSection
        activeSection={activeSection}
        changeProfile={changeProfile}
        profile={profile}
      />
      <SensitiveSection
        activeSection={activeSection}
        vaultClient={vaultClient}
      />
      <VariantsSection
        activeSection={activeSection}
        changeProfile={changeProfile}
        profile={profile}
      />
      <BackupSection
        activeSection={activeSection}
        exportProfile={exportProfile}
        importProfile={importProfile}
      />
    </>
  );
}
