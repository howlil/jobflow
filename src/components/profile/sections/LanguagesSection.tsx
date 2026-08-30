import { Plus, Trash2 } from 'lucide-react';

import {
  EmptyState,
  FieldGrid,
  IconButton,
  RecordCard,
  RecordHeader,
  TextField,
} from '../../ui';
import { WorkspaceSubsection } from '../../layout';
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
    <WorkspaceSubsection
      title="Languages"
      help="Add languages and proficiency information that Job Flow can use when application forms ask for it."
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
        <div className="grid gap-3">
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
    </WorkspaceSubsection>
  );
}
