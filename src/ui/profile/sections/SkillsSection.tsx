import { Plus, Trash2 } from 'lucide-react';

import {
  Button,
  EmptyState,
  FieldGrid,
  Section,
  SectionHeader,
  TextField,
} from '../../design-system/primitives';
import {
  createProfileItemId,
  parseNullableNumber,
} from './profile-section-helpers';
import type { ProfileSectionProps } from './profile-section-types';

export function SkillsSection({
  activeSection,
  changeProfile,
  profile,
}: ProfileSectionProps) {
  return (
    <Section hidden={activeSection !== 'skills'}>
      <SectionHeader
        title="Skills"
        action={
          <Button
            onClick={() =>
              changeProfile((draft) => {
                draft.baseProfile.professional.skills.push({
                  id: createProfileItemId(),
                  name: '',
                  level: '',
                  yearsExperience: null,
                });
              })
            }
          >
            <Plus aria-hidden="true" size={16} />
            Add skill
          </Button>
        }
      />
      {profile.baseProfile.professional.skills.length === 0 ? (
        <EmptyState>No skills added yet.</EmptyState>
      ) : (
        <div className="grid gap-3">
          {profile.baseProfile.professional.skills.map((skill, index) => (
            <article
              className="grid gap-4 rounded-app border border-app-border bg-app-muted p-4"
              key={skill.id}
            >
              <FieldGrid columns={3}>
                <TextField
                  label="Skill"
                  value={skill.name}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item = draft.baseProfile.professional.skills[index];
                      if (item !== undefined) item.name = event.target.value;
                    })
                  }
                />
                <TextField
                  label="Level"
                  value={skill.level}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item = draft.baseProfile.professional.skills[index];
                      if (item !== undefined) item.level = event.target.value;
                    })
                  }
                />
                <TextField
                  inputMode="decimal"
                  label="Years experience"
                  value={skill.yearsExperience ?? ''}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item = draft.baseProfile.professional.skills[index];
                      if (item !== undefined)
                        item.yearsExperience = parseNullableNumber(
                          event.target.value,
                        );
                    })
                  }
                />
              </FieldGrid>
              <Button
                className="justify-self-start"
                variant="danger"
                onClick={() =>
                  changeProfile((draft) => {
                    draft.baseProfile.professional.skills.splice(index, 1);
                  })
                }
              >
                <Trash2 aria-hidden="true" size={16} />
                Remove skill {index + 1}
              </Button>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
