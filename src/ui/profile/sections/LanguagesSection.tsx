import { Plus, Trash2 } from 'lucide-react';

import {
  Button,
  EmptyState,
  FieldGrid,
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
        <Button
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
          Add language
        </Button>
      }
    >
      {profile.baseProfile.professional.languages.length === 0 ? (
        <EmptyState>No languages added yet.</EmptyState>
      ) : (
        <div className="grid gap-3">
          {profile.baseProfile.professional.languages.map((language, index) => (
            <article
              className="grid gap-4 rounded-app border border-app-border bg-app-muted p-4"
              key={language.id}
            >
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
              <Button
                className="justify-self-start"
                variant="danger"
                onClick={() =>
                  changeProfile((draft) =>
                    draft.baseProfile.professional.languages.splice(index, 1),
                  )
                }
              >
                <Trash2 aria-hidden="true" size={16} />
                Remove language
              </Button>
            </article>
          ))}
        </div>
      )}
    </Subsection>
  );
}
