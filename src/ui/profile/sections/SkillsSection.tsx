import { Plus, Trash2 } from 'lucide-react';

import {
  EmptyState,
  FieldGrid,
  IconButton,
  RecordCard,
  RecordHeader,
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
          <IconButton
            size="sm"
            aria-label="Add skill"
            title="Add skill"
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
          </IconButton>
        }
      />
      {profile.baseProfile.professional.skills.length === 0 ? (
        <EmptyState>No skills added yet.</EmptyState>
      ) : (
        <div className="grid gap-4">
          {profile.baseProfile.professional.skills.map((skill, index) => (
            <RecordCard
              key={skill.id}
              action={
                <IconButton
                  size="xs"
                  tone="danger"
                  aria-label={`Remove skill ${index + 1}`}
                  title={`Remove skill ${index + 1}`}
                  onClick={() =>
                    changeProfile((draft) => {
                      draft.baseProfile.professional.skills.splice(index, 1);
                    })
                  }
                >
                  <Trash2 aria-hidden="true" size={14} />
                </IconButton>
              }
            >
              <RecordHeader
                title={skill.name || `Skill ${index + 1}`}
                context={skill.level || 'Skill details'}
                meta={
                  skill.yearsExperience === null
                    ? undefined
                    : `${skill.yearsExperience} years`
                }
              />
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
            </RecordCard>
          ))}
        </div>
      )}
    </Section>
  );
}
