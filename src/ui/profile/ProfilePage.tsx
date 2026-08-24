import { useEffect, useState } from 'react';

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
      {
        id: createId(),
        label: 'Primary',
        value,
        primary: true,
      },
      ...items,
    ];
  }

  return items.map((item, index) =>
    index === primaryIndex ? { ...item, value } : item,
  );
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
        if (active) {
          setProfile(stored ?? createEmptyStoredProfile());
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load your profile.');
        }
      });

    return () => {
      active = false;
    };
  }, [repository]);

  function changeProfile(mutate: ProfileMutation) {
    setProfile((current) => {
      if (current === null) {
        return current;
      }

      const next = structuredClone(current);
      mutate(next);
      return next;
    });
    setSaveState('idle');
  }

  async function saveProfile() {
    if (profile === null) {
      return;
    }

    setSaveState('saving');
    setError(null);

    const next = {
      ...profile,
      metadata: {
        ...profile.metadata,
        updatedAt: new Date().toISOString(),
      },
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
            Save factual career data once. Sensitive information is not stored
            here.
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
        </div>
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
                  <label>
                    Company {index + 1}
                    <input
                      value={experience.company}
                      onChange={(event) =>
                        changeProfile((draft) => {
                          const item =
                            draft.baseProfile.professional.experiences[index];
                          if (item !== undefined)
                            item.company = event.target.value;
                        })
                      }
                    />
                  </label>
                  <label>
                    Job title {index + 1}
                    <input
                      value={experience.title}
                      onChange={(event) =>
                        changeProfile((draft) => {
                          const item =
                            draft.baseProfile.professional.experiences[index];
                          if (item !== undefined)
                            item.title = event.target.value;
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
                  <label>
                    Institution {index + 1}
                    <input
                      value={education.institution}
                      onChange={(event) =>
                        changeProfile((draft) => {
                          const item =
                            draft.baseProfile.professional.education[index];
                          if (item !== undefined) {
                            item.institution = event.target.value;
                          }
                        })
                      }
                    />
                  </label>
                  <label>
                    Degree {index + 1}
                    <input
                      value={education.degree}
                      onChange={(event) =>
                        changeProfile((draft) => {
                          const item =
                            draft.baseProfile.professional.education[index];
                          if (item !== undefined)
                            item.degree = event.target.value;
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
                <label>
                  Skill {index + 1}
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

      {vaultClient !== undefined ? (
        <SensitiveVaultSection vaultClient={vaultClient} />
      ) : null}

      <section className="profile-section">
        <div className="fillio-section-heading">
          <div>
            <h2>Application variants</h2>
            <p className="muted">
              Keep factual data in the base profile; variants store only role
              specific overrides.
            </p>
          </div>
          <button
            className="fillio-button"
            type="button"
            onClick={() =>
              changeProfile((draft) => {
                const id = createId();
                draft.variants.push({
                  id,
                  name: '',
                  targetRoles: [],
                });
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
                    Variant name {index + 1}
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
                    Variant headline {index + 1}
                    <input
                      value={variant.headlineOverride ?? ''}
                      onChange={(event) =>
                        changeProfile((draft) => {
                          const item = draft.variants[index];
                          if (item !== undefined) {
                            item.headlineOverride = event.target.value;
                          }
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
    </main>
  );
}
