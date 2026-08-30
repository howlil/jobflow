import { Plus, Trash2 } from 'lucide-react';

import {
  EmptyState,
  FieldGrid,
  IconButton,
  Section,
  SectionHeader,
  TextareaField,
  TextField,
} from '../../design-system/primitives';
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
    <Section hidden={activeSection !== 'education'}>
      <SectionHeader
        title="Education"
        action={
          <IconButton
            size="sm"
            aria-label="Add education"
            title="Add education"
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
          </IconButton>
        }
      />
      {profile.baseProfile.professional.education.length === 0 ? (
        <EmptyState>No education added yet.</EmptyState>
      ) : (
        <div className="grid gap-4">
          {profile.baseProfile.professional.education.map(
            (education, index) => (
              <CollapsibleRecord
                key={education.id}
                initialOpen={
                  education.institution.trim() === '' &&
                  education.degree.trim() === ''
                }
              >
                <summary className="record-summary pr-10">
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
                <IconButton
                  className="absolute right-3 top-3 z-10"
                  size="xs"
                  tone="danger"
                  aria-label={`Remove education ${index + 1}`}
                  title={`Remove education ${index + 1}`}
                  onClick={() =>
                    changeProfile((draft) => {
                      draft.baseProfile.professional.education.splice(index, 1);
                    })
                  }
                >
                  <Trash2 aria-hidden="true" size={14} />
                </IconButton>
                <div className="grid gap-4 border-t border-app-border pt-4">
                  <FieldGrid>
                    {[
                      ['Institution', 'institution'],
                      ['Degree', 'degree'],
                      ['Field of study', 'fieldOfStudy'],
                      ['Location', 'location'],
                    ].map(([label, key]) => (
                      <TextField
                        key={key}
                        label={label}
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
                    ))}
                    <TextField
                      label="Start date"
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
                    <TextField
                      label="End date"
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
                    <TextField
                      inputMode="decimal"
                      label="GPA"
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
                    <TextField
                      inputMode="decimal"
                      label="Max GPA"
                      value={education.maxGpa ?? ''}
                      onChange={(event) =>
                        changeProfile((draft) => {
                          const item =
                            draft.baseProfile.professional.education[index];
                          if (item !== undefined)
                            item.maxGpa = parseNullableNumber(event.target.value);
                        })
                      }
                    />
                  </FieldGrid>
                  <TextareaField
                    label="Description"
                    placeholder="Use one academic highlight per line."
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
                  {descriptionPreview(education.description)}
                </div>
              </CollapsibleRecord>
            ),
          )}
        </div>
      )}
    </Section>
  );
}
