import { useEffect, useState } from 'react';

import {
  createProfileBackup,
  parseProfileBackup,
  serializeProfileBackup,
} from '../../application/profile/profile-backup';
import { calculateProfileReadiness } from '../../application/profile/profile-readiness';
import type { ProfileRepository } from '../../application/profile/profile-repository';
import { createEmptyStoredProfile } from '../../domain/profile/create-empty-profile';
import type {
  BaseProfile,
  StoredProfileEnvelope,
} from '../../domain/profile/profile-schema';
import {
  SensitiveVaultSection,
  type VaultClient,
} from '../vault/SensitiveVaultSection';
import './profile.css';

type ProfilePageProps = {
  repository: ProfileRepository;
  vaultClient?: VaultClient;
};

type ContactItem = BaseProfile['contact']['emails'][number];
type ProfileMutation = (profile: StoredProfileEnvelope) => void;

function createId(): string {
  return globalThis.crypto.randomUUID();
}

function primaryContactValue(items: ContactItem[]): string {
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

export function ProfilePage({ repository, vaultClient }: ProfilePageProps) {
  const [profile, setProfile] = useState<StoredProfileEnvelope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>(
    'idle',
  );

  useEffect(() => {
    let active = true;
    void repository
      .load()
      .then((stored) => {
        if (active) setProfile(stored ?? createEmptyStoredProfile());
      })
      .catch(() => {
        if (active) setError('Could not load your profile.');
      });
    return () => {
      active = false;
    };
  }, [repository]);

  function changeProfile(mutate: ProfileMutation) {
    setProfile((current) => {
      if (current === null) return current;
      const next = structuredClone(current);
      mutate(next);
      return next;
    });
    setSaveState('idle');
  }

  async function saveProfile() {
    if (profile === null) return;
    setSaveState('saving');
    setError(null);
    const next = {
      ...profile,
      metadata: { ...profile.metadata, updatedAt: new Date().toISOString() },
    };
    try {
      await repository.save(next);
      setProfile(next);
      setSaveState('saved');
    } catch {
      setError('Could not save your profile.');
      setSaveState('idle');
    }
  }

  function exportProfile() {
    if (profile === null) return;
    const json = serializeProfileBackup(createProfileBackup(profile));
    const url = URL.createObjectURL(
      new Blob([json], { type: 'application/json;charset=utf-8' }),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `fillio-profile-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importProfile(file: File) {
    try {
      const imported = parseProfileBackup(await file.text()).profile;
      await repository.save(imported);
      setProfile(imported);
      setError(null);
      setSaveState('saved');
    } catch {
      setError('Could not import this Fillio backup.');
    }
  }

  if (error !== null && profile === null) {
    return <main className="profile-page">{error}</main>;
  }
  if (profile === null) {
    return <main className="profile-page">Loading profile…</main>;
  }

  const { baseProfile } = profile;
  const readiness = calculateProfileReadiness(baseProfile);
  const missingEssentials = [
    {
      label: 'First name',
      missing: baseProfile.personal.legalName.first.trim() === '',
    },
    {
      label: 'Email',
      missing: primaryContactValue(baseProfile.contact.emails).trim() === '',
    },
    {
      label: 'Phone',
      missing: primaryContactValue(baseProfile.contact.phones).trim() === '',
    },
  ].filter((essential) => essential.missing);
  const saveStateText =
    saveState === 'saving'
      ? 'Saving profile...'
      : saveState === 'saved'
        ? 'Profile saved.'
        : 'Changes not saved.';

  return (
    <main className="profile-page">
      <header className="profile-header">
        <div>
          <p className="eyebrow">Fillio</p>
          <h1>Career profile</h1>
          <p className="muted">
            Save factual career data once. Sensitive information stays in the
            separate encrypted vault.
          </p>
        </div>
        <div className="profile-save-action">
          <p className="profile-save-state" role="status" aria-live="polite">
            {saveStateText}
          </p>
          <button
            className="fillio-button fillio-button-primary"
            type="button"
            onClick={() => void saveProfile()}
            disabled={saveState === 'saving'}
          >
            {saveState === 'saving' ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </header>

      {error !== null ? <p role="alert">{error}</p> : null}

      <section
        className="profile-readiness"
        aria-labelledby="profile-readiness-title"
      >
        <div className="fillio-section-heading">
          <div>
            <p className="eyebrow">Profile readiness</p>
            <h2 id="profile-readiness-title">
              {readiness.completed} of {readiness.total} sections ready
            </h2>
          </div>
          <span className="fillio-chip fillio-chip-strong">
            {readiness.percentage}% complete
          </span>
        </div>
        <div className="profile-readiness-details">
          <p className="profile-readiness-label">Missing essentials</p>
          {missingEssentials.length > 0 ? (
            <ul className="profile-readiness-list">
              {missingEssentials.map((essential) => (
                <li key={essential.label}>{essential.label}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">Your core contact details are ready.</p>
          )}
        </div>
      </section>

      <section className="profile-section">
        <h2>Basic information</h2>
        <div className="form-grid">
          <label>
            First name
            <input
              value={baseProfile.personal.legalName.first}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.personal.legalName.first =
                    event.target.value;
                })
              }
            />
          </label>
          <label>
            Middle name
            <input
              value={baseProfile.personal.legalName.middle}
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
              value={baseProfile.personal.legalName.last}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.personal.legalName.last =
                    event.target.value;
                })
              }
            />
          </label>
          <label>
            Preferred name
            <input
              value={baseProfile.personal.preferredName}
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
              value={baseProfile.professional.headline}
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
            value={baseProfile.professional.summary}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.professional.summary = event.target.value;
              })
            }
          />
        </label>
      </section>

      <section className="profile-section">
        <h2>Contact</h2>
        <div className="form-grid">
          <label>
            Primary email
            <input
              type="email"
              value={primaryContactValue(baseProfile.contact.emails)}
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
              value={primaryContactValue(baseProfile.contact.phones)}
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
              value={baseProfile.contact.whatsapp}
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
              value={baseProfile.contact.address.line1}
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
              value={baseProfile.contact.address.city}
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
              value={baseProfile.contact.address.state}
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
              value={baseProfile.contact.address.country}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.contact.address.country =
                    event.target.value;
                })
              }
            />
          </label>
          <label>
            Postal code
            <input
              value={baseProfile.contact.address.postalCode}
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

      <section className="profile-section">
        <h2>Links</h2>
        <div className="form-grid">
          <label>
            LinkedIn
            <input
              value={baseProfile.links.linkedin}
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
              value={baseProfile.links.github}
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
              value={baseProfile.links.portfolio}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.links.portfolio = event.target.value;
                })
              }
            />
          </label>
        </div>
      </section>

      <section className="profile-section">
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
                });
              })
            }
          >
            Add experience
          </button>
        </div>
        {baseProfile.professional.experiences.length === 0 ? (
          <div className="fillio-empty-row">No experience added yet.</div>
        ) : (
          <div className="record-list">
            {baseProfile.professional.experiences.map((experience, index) => (
              <article className="record-card" key={experience.id}>
                <div className="form-grid">
                  {[
                    ['Company', 'company'],
                    ['Job title', 'title'],
                    ['Employment type', 'employmentType'],
                    ['Location', 'location'],
                    ['Start date', 'startDate'],
                    ['End date', 'endDate'],
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
                  Remove experience {index + 1}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="profile-section">
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
            Add education
          </button>
        </div>
        {baseProfile.professional.education.length === 0 ? (
          <div className="fillio-empty-row">No education added yet.</div>
        ) : (
          <div className="record-list">
            {baseProfile.professional.education.map((education, index) => (
              <article className="record-card" key={education.id}>
                <div className="form-grid">
                  {[
                    ['Institution', 'institution'],
                    ['Degree', 'degree'],
                    ['Field of study', 'fieldOfStudy'],
                    ['Location', 'location'],
                    ['Start date', 'startDate'],
                    ['End date', 'endDate'],
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
                <button
                  className="fillio-button"
                  type="button"
                  onClick={() =>
                    changeProfile((draft) => {
                      draft.baseProfile.professional.education.splice(index, 1);
                    })
                  }
                >
                  Remove education {index + 1}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="profile-section">
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
            Add skill
          </button>
        </div>
        {baseProfile.professional.skills.length === 0 ? (
          <div className="fillio-empty-row">No skills added yet.</div>
        ) : (
          <div className="record-list">
            {baseProfile.professional.skills.map((skill, index) => (
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
                  Remove skill {index + 1}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <details className="profile-section">
        <summary>Job preferences</summary>
        <div className="form-grid">
          <label>
            Desired roles, comma separated
            <input
              value={listValue(baseProfile.jobPreferences.desiredRoles)}
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
              value={listValue(baseProfile.jobPreferences.employmentTypes)}
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
              value={listValue(baseProfile.jobPreferences.workArrangements)}
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
              value={listValue(baseProfile.jobPreferences.preferredLocations)}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.jobPreferences.preferredLocations =
                    parseList(event.target.value);
                })
              }
            />
          </label>
          <label>
            Availability date
            <input
              type="date"
              value={baseProfile.jobPreferences.availabilityDate}
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
              value={baseProfile.jobPreferences.noticePeriod}
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

      <details className="profile-section">
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
            Add language
          </button>
        </div>
        {baseProfile.professional.languages.map((language, index) => (
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
            Add certification
          </button>
        </div>
        {baseProfile.professional.certifications.map((certification, index) => (
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
              Remove
            </button>
          </article>
        ))}

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
            Add project
          </button>
        </div>
        {baseProfile.professional.projects.map((project, index) => (
          <article className="record-card" key={project.id}>
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
                Skills, comma separated
                <input
                  value={listValue(project.skills)}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item =
                        draft.baseProfile.professional.projects[index];
                      if (item !== undefined)
                        item.skills = parseList(event.target.value);
                    })
                  }
                />
              </label>
            </div>
            <label>
              Description
              <textarea
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
            <button
              className="fillio-button"
              type="button"
              onClick={() =>
                changeProfile((draft) =>
                  draft.baseProfile.professional.projects.splice(index, 1),
                )
              }
            >
              Remove
            </button>
          </article>
        ))}
      </details>

      <details className="profile-section">
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
            Add resume
          </button>
        </div>
        {baseProfile.documents.resumes.map((document, index) => (
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
                      if (item !== undefined)
                        item.fileName = event.target.value;
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
            Add answer
          </button>
        </div>
        {baseProfile.customAnswers.map((answer, index) => (
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
              Remove answer
            </button>
          </article>
        ))}
      </details>

      {vaultClient !== undefined ? (
        <SensitiveVaultSection vaultClient={vaultClient} />
      ) : null}

      <section className="profile-section">
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
                  draft.preferences.defaultVariantId =
                    event.target.value || null;
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
                          if (item !== undefined)
                            item.name = event.target.value;
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
                      {baseProfile.documents.resumes.map((resume) => (
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
                  Remove variant {index + 1}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <details className="profile-section">
        <summary>Backup and recovery</summary>
        <p className="muted">
          Export contains the normal versioned profile and variants. Sensitive
          vault values are not exported as plaintext.
        </p>
        <div className="fillio-section-heading">
          <button
            className="fillio-button"
            type="button"
            onClick={exportProfile}
          >
            Export profile backup
          </button>
          <label className="fillio-button">
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
    </main>
  );
}
