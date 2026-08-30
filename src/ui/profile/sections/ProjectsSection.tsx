import { Plus, Trash2 } from 'lucide-react';

import {
  EmptyState,
  FieldGrid,
  IconButton,
  Subsection,
  TextareaField,
  TextField,
} from '../../design-system/primitives';
import { LinkedSkillEditor } from '../LinkedSkillEditor';
import {
  addLinkedSkill,
  CollapsibleRecord,
  createProfileItemId,
  dateInputProps,
  dateRangeSummary,
  descriptionPreview,
} from './profile-section-helpers';
import type { ProfileSectionProps } from './profile-section-types';

type ProjectsSectionProps = Pick<
  ProfileSectionProps,
  'changeProfile' | 'profile'
>;

export function ProjectsSection({
  changeProfile,
  profile,
}: ProjectsSectionProps) {
  return (
    <Subsection
      title="Projects"
      action={
        <IconButton
          size="sm"
          aria-label="Add project"
          title="Add project"
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
        </IconButton>
      }
    >
      {profile.baseProfile.professional.projects.length === 0 ? (
        <EmptyState>No projects added yet.</EmptyState>
      ) : (
        <div className="grid gap-4">
          {profile.baseProfile.professional.projects.map((project, index) => (
            <CollapsibleRecord
              key={project.id}
              initialOpen={project.name.trim() === ''}
            >
              <summary className="record-summary pr-10">
                <span>{project.name || 'Untitled project'}</span>
                <span className="record-summary-meta">
                  {project.role ||
                    dateRangeSummary(project.startDate, project.endDate) ||
                    `Project ${index + 1}`}
                </span>
              </summary>
              <IconButton
                className="absolute right-3 top-3 z-10"
                size="xs"
                tone="danger"
                aria-label={`Remove project ${index + 1}`}
                title={`Remove project ${index + 1}`}
                onClick={() =>
                  changeProfile((draft) =>
                    draft.baseProfile.professional.projects.splice(index, 1),
                  )
                }
              >
                <Trash2 aria-hidden="true" size={14} />
              </IconButton>
              <div className="grid gap-4 border-t border-app-border pt-4">
                <FieldGrid columns={3}>
                  <TextField
                    label="Project"
                    value={project.name}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.projects[index];
                        if (item !== undefined) item.name = event.target.value;
                      })
                    }
                  />
                  <TextField
                    label="Role"
                    value={project.role}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.projects[index];
                        if (item !== undefined) item.role = event.target.value;
                      })
                    }
                  />
                  <TextField
                    label="URL"
                    value={project.url}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.projects[index];
                        if (item !== undefined) item.url = event.target.value;
                      })
                    }
                  />
                  <TextField
                    label="Start date"
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
                  <TextField
                    label="End date"
                    {...dateInputProps(project.endDate)}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.projects[index];
                        if (item !== undefined)
                          item.endDate = event.target.value;
                      })
                    }
                  />
                </FieldGrid>
                <LinkedSkillEditor
                  editorId={project.id}
                  contextLabel={`project ${index + 1}`}
                  linkedSkills={project.skills ?? []}
                  skills={profile.baseProfile.professional.skills}
                  onAdd={(skillName, skillLevel) =>
                    changeProfile((draft) => {
                      const item =
                        draft.baseProfile.professional.projects[index];
                      if (item === undefined) return;

                      let canonicalSkill =
                        draft.baseProfile.professional.skills.find(
                          (skill) =>
                            skill.name.trim().toLowerCase() ===
                            skillName.toLowerCase(),
                        );
                      if (canonicalSkill === undefined) {
                        canonicalSkill = {
                          id: createProfileItemId(),
                          name: skillName,
                          level: skillLevel,
                          yearsExperience: null,
                        };
                        draft.baseProfile.professional.skills.push(
                          canonicalSkill,
                        );
                      } else if (skillLevel !== '') {
                        canonicalSkill.level = skillLevel;
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
                        draft.baseProfile.professional.projects[index];
                      if (item === undefined) return;
                      item.skills = (item.skills ?? []).filter(
                        (value) =>
                          value.trim().toLowerCase() !== skillName.toLowerCase(),
                      );
                    })
                  }
                />
                <TextareaField
                  label="Description"
                  placeholder="Use one project result per line."
                  value={project.description}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item =
                        draft.baseProfile.professional.projects[index];
                      if (item !== undefined)
                        item.description = event.target.value;
                    })
                  }
                />
                {descriptionPreview(project.description)}
              </div>
            </CollapsibleRecord>
          ))}
        </div>
      )}
    </Subsection>
  );
}
