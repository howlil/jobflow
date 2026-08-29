import { Plus, Trash2 } from 'lucide-react';

import {
  Button,
  CheckboxField,
  EmptyState,
  FieldGrid,
  Section,
  SectionHeader,
  SelectField,
  TextareaField,
  TextField,
} from '../../design-system/primitives';
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
    <Section hidden={activeSection !== 'experience'}>
      <SectionHeader
        title="Experience"
        action={
          <Button
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
          </Button>
        }
      />
      {profile.baseProfile.professional.experiences.length === 0 ? (
        <EmptyState>No experience added yet.</EmptyState>
      ) : (
        <div className="grid gap-3">
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
                            draft.baseProfile.professional.experiences[index];
                          if (item !== undefined && key !== undefined) {
                            Reflect.set(item, key, event.target.value);
                          }
                        })
                      }
                    />
                  ))}
                  <TextField
                    label="Start date"
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
                  <TextField
                    label="End date"
                    {...dateInputProps(experience.endDate)}
                    disabled={experience.current}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.experiences[index];
                        if (item !== undefined) item.endDate = event.target.value;
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
                      if (item !== undefined) item.current = event.target.checked;
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
                      if (item !== undefined) item.description = event.target.value;
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
                <TextField
                  label="Related skills, comma separated"
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
                {skillNames(profile).length > 0 ? (
                  <SelectField
                    label="Add existing skill"
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
                  </SelectField>
                ) : null}
                <Button
                  className="justify-self-start"
                  variant="danger"
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
                </Button>
              </CollapsibleRecord>
            ),
          )}
        </div>
      )}
    </Section>
  );
}
