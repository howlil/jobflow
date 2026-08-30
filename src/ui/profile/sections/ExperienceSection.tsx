import { Plus, Trash2 } from 'lucide-react';

import { deriveActiveSkillNames } from '../../../domain/profile/derived-skills';
import {
  CheckboxField,
  EmptyState,
  FieldGrid,
  IconButton,
  TextareaField,
  TextField,
} from '../../design-system/primitives';
import {
  WorkspaceSection,
  WorkspaceSectionHeader,
} from '../../design-system/WorkspaceSectionCard';
import { LinkedSkillEditor } from '../LinkedSkillEditor';
import {
  addLinkedSkill,
  CollapsibleRecord,
  createProfileItemId,
  dateRangeSummary,
  listValue,
  monthInputProps,
  monthInputValue,
  parseList,
} from './profile-section-helpers';
import type { ProfileSectionProps } from './profile-section-types';

function invalidMonth(value: string): boolean {
  return value.trim() !== '' && monthInputValue(value) === '';
}

export function ExperienceSection({
  activeSection,
  changeProfile,
  profile,
}: ProfileSectionProps) {
  const skillSuggestions = [
    ...profile.baseProfile.professional.skills.map((skill) => skill.name),
    ...deriveActiveSkillNames(profile.baseProfile),
  ];

  return (
    <WorkspaceSection hidden={activeSection !== 'experience'}>
      <WorkspaceSectionHeader
        title="Experience"
        description="Add work, internship, freelance, or organization experience. Skills added here contribute to your unique active skill inventory."
        action={
          <IconButton
            size="sm"
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
                    className="absolute right-3 top-3 z-10"
                    size="xs"
                    tone="danger"
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
                          !experience.current &&
                          invalidMonth(experience.endDate)
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

                    <LinkedSkillEditor
                      editorId={experience.id}
                      contextLabel={`experience ${index + 1}`}
                      linkedSkills={experience.skills ?? []}
                      skills={skillSuggestions}
                      onAdd={(skillName) =>
                        changeProfile((draft) => {
                          const item =
                            draft.baseProfile.professional.experiences[index];
                          if (item === undefined) return;

                          const normalizedName = skillName
                            .trim()
                            .replace(/\s+/g, ' ');
                          let canonicalSkill =
                            draft.baseProfile.professional.skills.find(
                              (skill) =>
                                skill.name.trim().toLowerCase() ===
                                normalizedName.toLowerCase(),
                            );
                          if (canonicalSkill === undefined) {
                            canonicalSkill = {
                              id: createProfileItemId(),
                              name: normalizedName,
                              level: '',
                              yearsExperience: null,
                            };
                            draft.baseProfile.professional.skills.push(
                              canonicalSkill,
                            );
                          }
                          item.skills = addLinkedSkill(
                            item.skills,
                            canonicalSkill.name,
                          );
                        })
                      }
                      onRemove={(skillName) =>
                        changeProfile((draft) => {
                          const item =
                            draft.baseProfile.professional.experiences[index];
                          if (item === undefined) return;
                          item.skills = (item.skills ?? []).filter(
                            (value) =>
                              value.trim().toLowerCase() !==
                              skillName.toLowerCase(),
                          );
                        })
                      }
                    />
                  </div>
                </CollapsibleRecord>
              );
            },
          )}
        </div>
      )}
    </WorkspaceSection>
  );
}
