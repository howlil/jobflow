import { Plus, Trash2 } from 'lucide-react';

import {
  Button,
  EmptyState,
  FieldGrid,
  SelectField,
  Subsection,
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
        <Button
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
        </Button>
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
              <summary className="record-summary">
                <span>{project.name || 'Untitled project'}</span>
                <span className="record-summary-meta">
                  {project.role ||
                    dateRangeSummary(project.startDate, project.endDate) ||
                    `Project ${index + 1}`}
                </span>
              </summary>
              <FieldGrid columns={3}>
                <TextField
                  label="Project"
                  value={project.name}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item = draft.baseProfile.professional.projects[index];
                      if (item !== undefined) item.name = event.target.value;
                    })
                  }
                />
                <TextField
                  label="Role"
                  value={project.role}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item = draft.baseProfile.professional.projects[index];
                      if (item !== undefined) item.role = event.target.value;
                    })
                  }
                />
                <TextField
                  label="URL"
                  value={project.url}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item = draft.baseProfile.professional.projects[index];
                      if (item !== undefined) item.url = event.target.value;
                    })
                  }
                />
                <TextField
                  label="Start date"
                  {...dateInputProps(project.startDate)}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item = draft.baseProfile.professional.projects[index];
                      if (item !== undefined) item.startDate = event.target.value;
                    })
                  }
                />
                <TextField
                  label="End date"
                  {...dateInputProps(project.endDate)}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item = draft.baseProfile.professional.projects[index];
                      if (item !== undefined) item.endDate = event.target.value;
                    })
                  }
                />
                <TextField
                  label="Skills, comma separated"
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
              </FieldGrid>
              {skillNames(profile).length > 0 ? (
                <SelectField
                  label="Add existing skill"
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
                </SelectField>
              ) : null}
              <TextareaField
                label="Description"
                placeholder="Use one project result per line."
                value={project.description}
                onChange={(event) =>
                  changeProfile((draft) => {
                    const item = draft.baseProfile.professional.projects[index];
                    if (item !== undefined) item.description = event.target.value;
                  })
                }
              />
              {descriptionPreview(project.description)}
              <Button
                className="justify-self-start"
                variant="danger"
                onClick={() =>
                  changeProfile((draft) =>
                    draft.baseProfile.professional.projects.splice(index, 1),
                  )
                }
              >
                <Trash2 aria-hidden="true" size={16} />
                Remove project
              </Button>
            </CollapsibleRecord>
          ))}
        </div>
      )}
    </Subsection>
  );
}
