import { Plus, Trash2 } from 'lucide-react';

import { deriveActiveSkillNames } from '../../../domain/profile/derived-skills';
import {
  EmptyState,
  FieldGrid,
  IconButton,
  TextareaField,
  TextField,
} from '../../ui';
import { WorkspaceSubsection } from '../../layout';
import { LinkedSkillEditor } from '../LinkedSkillEditor';
import {
  addLinkedSkill,
  CollapsibleRecord,
  createProfileItemId,
  dateRangeSummary,
  monthInputProps,
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
  const skillSuggestions = [
    ...profile.baseProfile.professional.skills.map((skill) => skill.name),
    ...deriveActiveSkillNames(profile.baseProfile),
  ];

  return (
    <WorkspaceSubsection
      title="Projects"
      help="Add career-relevant projects. Skills added here contribute to your unique active skill inventory."
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
        <div className="grid gap-3">
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
              <div className="grid gap-3 border-t border-app-border pt-3">
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
                    {...monthInputProps(project.startDate)}
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
                    {...monthInputProps(project.endDate)}
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
                  skills={skillSuggestions}
                  onAdd={(skillName) =>
                    changeProfile((draft) => {
                      const item =
                        draft.baseProfile.professional.projects[index];
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
                        draft.baseProfile.professional.projects[index];
                      if (item === undefined) return;
                      item.skills = (item.skills ?? []).filter(
                        (value) =>
                          value.trim().toLowerCase() !==
                          skillName.toLowerCase(),
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
              </div>
            </CollapsibleRecord>
          ))}
        </div>
      )}
    </WorkspaceSubsection>
  );
}
