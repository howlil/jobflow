import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';

import {
  CheckboxField,
  Chip,
  EmptyState,
  FieldGrid,
  IconButton,
  Section,
  SectionHeader,
  TextareaField,
  TextField,
} from '../../design-system/primitives';
import {
  addLinkedSkill,
  CollapsibleRecord,
  createProfileItemId,
  dateRangeSummary,
  descriptionPreview,
  listValue,
  monthInputProps,
  monthInputValue,
  parseList,
} from './profile-section-helpers';
import type { ProfileSectionProps } from './profile-section-types';

function invalidMonth(value: string): boolean {
  return value.trim() !== '' && monthInputValue(value) === '';
}

function ExperienceSkillEditor({
  experienceId,
  experienceIndex,
  linkedSkills,
  changeProfile,
  profile,
}: {
  experienceId: string;
  experienceIndex: number;
  linkedSkills: string[];
  changeProfile: ProfileSectionProps['changeProfile'];
  profile: ProfileSectionProps['profile'];
}) {
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const canonicalSkills = profile.baseProfile.professional.skills;
  const datalistId = `experience-skill-options-${experienceId}`;

  function addSkill() {
    const normalizedName = skillName.trim();
    const normalizedLevel = skillLevel.trim();
    if (normalizedName === '') return;

    changeProfile((draft) => {
      const experience =
        draft.baseProfile.professional.experiences[experienceIndex];
      if (experience === undefined) return;

      let canonicalSkill = draft.baseProfile.professional.skills.find(
        (skill) =>
          skill.name.trim().toLowerCase() === normalizedName.toLowerCase(),
      );

      if (canonicalSkill === undefined) {
        canonicalSkill = {
          id: createProfileItemId(),
          name: normalizedName,
          level: normalizedLevel,
          yearsExperience: null,
        };
        draft.baseProfile.professional.skills.push(canonicalSkill);
      } else if (normalizedLevel !== '') {
        canonicalSkill.level = normalizedLevel;
      }

      experience.skills = addLinkedSkill(
        experience.skills,
        canonicalSkill.name,
      );
    });

    setSkillName('');
    setSkillLevel('');
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(140px,0.45fr)_auto] sm:items-end">
        <TextField
          label="Skill"
          list={datalistId}
          placeholder="Type or choose a skill"
          value={skillName}
          onChange={(event) => {
            const nextName = event.target.value;
            setSkillName(nextName);
            const existing = canonicalSkills.find(
              (skill) =>
                skill.name.trim().toLowerCase() ===
                nextName.trim().toLowerCase(),
            );
            setSkillLevel(existing?.level ?? '');
          }}
        />
        <TextField
          label="Skill level"
          placeholder="e.g. Advanced"
          value={skillLevel}
          onChange={(event) => setSkillLevel(event.target.value)}
        />
        <IconButton
          className="!h-10 !w-10 self-end"
          aria-label={`Add skill to experience ${experienceIndex + 1}`}
          title="Add skill"
          disabled={skillName.trim() === ''}
          onClick={addSkill}
        >
          <Plus aria-hidden="true" size={16} />
        </IconButton>
      </div>

      <datalist id={datalistId}>
        {canonicalSkills
          .filter((skill) => skill.name.trim() !== '')
          .map((skill) => (
            <option value={skill.name} key={skill.id} />
          ))}
      </datalist>

      {linkedSkills.length > 0 ? (
        <div className="flex flex-wrap gap-2" aria-label="Linked skills">
          {linkedSkills.map((skillNameValue) => {
            const canonicalSkill = canonicalSkills.find(
              (skill) =>
                skill.name.trim().toLowerCase() ===
                skillNameValue.trim().toLowerCase(),
            );
            const level = canonicalSkill?.level.trim() ?? '';

            return (
              <Chip strong className="pr-1" key={skillNameValue}>
                <span>
                  {skillNameValue}
                  {level === '' ? '' : ` · ${level}`}
                </span>
                <button
                  className="grid h-5 w-5 place-items-center rounded text-app-subtle transition hover:bg-app-muted hover:text-app-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-ink"
                  type="button"
                  aria-label={`Remove ${skillNameValue} from experience ${experienceIndex + 1}`}
                  onClick={() =>
                    changeProfile((draft) => {
                      const experience =
                        draft.baseProfile.professional.experiences[
                          experienceIndex
                        ];
                      if (experience === undefined) return;
                      experience.skills = (experience.skills ?? []).filter(
                        (value) =>
                          value.trim().toLowerCase() !==
                          skillNameValue.trim().toLowerCase(),
                      );
                    })
                  }
                >
                  <X aria-hidden="true" size={12} />
                </button>
              </Chip>
            );
          })}
        </div>
      ) : (
        <p className="m-0 text-[11px] leading-4 text-app-subtle">
          No skills linked to this experience yet.
        </p>
      )}
    </div>
  );
}

export function ExperienceSection({
  activeSection,
  changeProfile,
  profile,
}: ProfileSectionProps) {
  return (
    <Section hidden={activeSection !== 'experience'}>
      <SectionHeader
        title="Experience"
        action={
          <IconButton
            className="!h-9 !w-9"
            aria-label="Add experience"
            title="Add experience"
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
          </IconButton>
        }
      />
      {profile.baseProfile.professional.experiences.length === 0 ? (
        <EmptyState>No experience added yet.</EmptyState>
      ) : (
        <div className="grid gap-4">
          {profile.baseProfile.professional.experiences.map(
            (experience, index) => {
              const summaryContext = [
                experience.company,
                experience.employmentType,
                experience.location,
              ]
                .map((value) => value.trim())
                .filter(Boolean)
                .join(' · ');

              return (
                <CollapsibleRecord
                  className="relative bg-white shadow-sm"
                  key={experience.id}
                  initialOpen={
                    experience.company.trim() === '' &&
                    experience.title.trim() === ''
                  }
                >
                  <summary className="record-summary pr-10">
                    <span className="grid min-w-0 gap-1">
                      <span className="truncate">
                        {experience.title || 'Untitled role'}
                      </span>
                      {summaryContext === '' ? null : (
                        <span className="truncate text-[11px] font-medium text-app-subtle">
                          {summaryContext}
                        </span>
                      )}
                    </span>
                    <span className="record-summary-meta">
                      {dateRangeSummary(
                        experience.startDate,
                        experience.endDate,
                        experience.current,
                      ) || `Experience ${index + 1}`}
                    </span>
                  </summary>

                  <IconButton
                    className="absolute right-3 top-3 z-10 !h-8 !w-8 border-transparent bg-transparent text-app-subtle hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                    aria-label={`Remove experience ${index + 1}`}
                    title={`Remove experience ${index + 1}`}
                    onClick={() =>
                      changeProfile((draft) => {
                        draft.baseProfile.professional.experiences.splice(
                          index,
                          1,
                        );
                      })
                    }
                  >
                    <Trash2 aria-hidden="true" size={14} />
                  </IconButton>

                  <div className="grid gap-4 border-t border-app-border pt-4">
                    <FieldGrid>
                      {[
                        ['Company', 'company'],
                        ['Job title', 'title'],
                        ['Employment type', 'employmentType'],
                        ['Location', 'location'],
                      ].map(([label, key]) => (
                        <TextField
                          key={key}
                          label={label}
                          value={String(
                            experience[key as keyof typeof experience] ?? '',
                          )}
                          onChange={(event) =>
                            changeProfile((draft) => {
                              const item =
                                draft.baseProfile.professional.experiences[
                                  index
                                ];
                              if (item !== undefined && key !== undefined) {
                                Reflect.set(item, key, event.target.value);
                              }
                            })
                          }
                        />
                      ))}
                      <TextField
                        label="Start date"
                        {...monthInputProps(experience.startDate)}
                        error={
                          invalidMonth(experience.startDate)
                            ? 'Stored value is not a valid month. Choose a month to replace it.'
                            : undefined
                        }
                        onChange={(event) =>
                          changeProfile((draft) => {
                            const item =
                              draft.baseProfile.professional.experiences[index];
                            if (item !== undefined)
                              item.startDate = event.target.value;
                          })
                        }
                      />
                      <TextField
                        label="End date"
                        {...monthInputProps(experience.endDate)}
                        disabled={experience.current}
                        error={
                          !experience.current && invalidMonth(experience.endDate)
                            ? 'Stored value is not a valid month. Choose a month to replace it.'
                            : undefined
                        }
                        onChange={(event) =>
                          changeProfile((draft) => {
                            const item =
                              draft.baseProfile.professional.experiences[index];
                            if (item !== undefined)
                              item.endDate = event.target.value;
                          })
                        }
                      />
                    </FieldGrid>

                    <CheckboxField
                      label="Current role"
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

                    <TextareaField
                      label="Description"
                      placeholder="Lead with one impact per line."
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
                    {descriptionPreview(experience.description)}

                    <TextField
                      label="Achievements, comma separated"
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

                    <ExperienceSkillEditor
                      experienceId={experience.id}
                      experienceIndex={index}
                      linkedSkills={experience.skills ?? []}
                      changeProfile={changeProfile}
                      profile={profile}
                    />
                  </div>
                </CollapsibleRecord>
              );
            },
          )}
        </div>
      )}
    </Section>
  );
}
