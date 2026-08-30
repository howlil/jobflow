import { Plus, Trash2 } from 'lucide-react';

import {
  EmptyState,
  FieldGrid,
  IconButton,
  RecordCard,
  RecordHeader,
  Subsection,
  TextField,
} from '../../design-system/primitives';
import { createProfileItemId } from './profile-section-helpers';
import type { ProfileSectionProps } from './profile-section-types';

type LanguagesSectionProps = Pick<
  ProfileSectionProps,
  'changeProfile' | 'profile'
>;

export function LanguagesSection({
  changeProfile,
  profile,
}: LanguagesSectionProps) {
  return (
    <Subsection
      title="Languages"
      action={
        <IconButton
          size="sm"
          aria-label="Add language"
          title="Add language"
          onClick={() =>
            changeProfile((draft) =>
              draft.baseProfile.professional.languages.push({
                id: createProfileItemId(),
                name: '',
                proficiency: '',
              }),
            )
          }
        >
          <Plus aria-hidden="true" size={16} />
        </IconButton>
      }
    >
      {profile.baseProfile.professional.languages.length === 0 ? (
        <EmptyState>No languages added yet.</EmptyState>
      ) : (
        <div className="grid gap-4">
          {profile.baseProfile.professional.languages.map((language, index) => (
            <RecordCard
              key={language.id}
              action={
                <IconButton
                  size="xs"
                  tone="danger"
                  aria-label={`Remove language ${index + 1}`}
                  title={`Remove language ${index + 1}`}
                  onClick={() =>
                    changeProfile((draft) =>
                      draft.baseProfile.professional.languages.splice(index, 1),
                    )
                  }
                >
                  <Trash2 aria-hidden="true" size={14} />
                </IconButton>
              }
            >
              <RecordHeader
                title={language.name || `Language ${index + 1}`}
                context={language.proficiency || 'Language proficiency'}
              />
              <FieldGrid>
                <TextField
                  label="Language"
                  value={language.name}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item =
                        draft.baseProfile.professional.languages[index];
                      if (item !== undefined) item.name = event.target.value;
                    })
                  }
                />
                <TextField
                  label="Proficiency"
                  value={language.proficiency}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item =
                        draft.baseProfile.professional.languages[index];
                      if (item !== undefined)
                        item.proficiency = event.target.value;
                    })
                  }
                />
              </FieldGrid>
            </RecordCard>
          ))}
        </div>
      )}
    </Subsection>
  );
}
