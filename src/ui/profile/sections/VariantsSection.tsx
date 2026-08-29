import { Plus, Trash2 } from 'lucide-react';

import {
  Button,
  EmptyState,
  FieldGrid,
  Section,
  SectionHeader,
  SelectField,
  TextField,
} from '../../design-system/primitives';
import {
  createProfileItemId,
  listValue,
  parseList,
} from './profile-section-helpers';
import type { ProfileSectionProps } from './profile-section-types';

export function VariantsSection({
  activeSection,
  changeProfile,
  profile,
}: ProfileSectionProps) {
  return (
    <Section hidden={activeSection !== 'variants'}>
      <SectionHeader
        title="Application variants"
        description="Keep factual data in the base profile; variants store only role-specific overrides and preferred documents."
        action={
          <Button
            onClick={() =>
              changeProfile((draft) => {
                const id = createProfileItemId();
                draft.variants.push({ id, name: '', targetRoles: [] });
                draft.preferences.defaultVariantId ??= id;
              })
            }
          >
            <Plus aria-hidden="true" size={16} />
            Add variant
          </Button>
        }
      />

      {profile.variants.length > 0 ? (
        <SelectField
          className="max-w-md"
          label="Default variant"
          value={profile.preferences.defaultVariantId ?? ''}
          onChange={(event) =>
            changeProfile((draft) => {
              draft.preferences.defaultVariantId = event.target.value || null;
            })
          }
        >
          <option value="">None</option>
          {profile.variants.map((variant) => (
            <option value={variant.id} key={variant.id}>
              {variant.name || 'Untitled variant'}
            </option>
          ))}
        </SelectField>
      ) : null}

      {profile.variants.length === 0 ? (
        <EmptyState>No application variants added yet.</EmptyState>
      ) : (
        <div className="grid gap-3">
          {profile.variants.map((variant, index) => (
            <article
              className="grid gap-4 rounded-app border border-app-border bg-app-muted p-4"
              key={variant.id}
            >
              <FieldGrid>
                <TextField
                  label="Variant name"
                  value={variant.name}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item = draft.variants[index];
                      if (item !== undefined) item.name = event.target.value;
                    })
                  }
                />
                <TextField
                  label="Target roles, comma separated"
                  value={listValue(variant.targetRoles)}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item = draft.variants[index];
                      if (item !== undefined)
                        item.targetRoles = parseList(event.target.value);
                    })
                  }
                />
                <TextField
                  label="Variant headline"
                  value={variant.headlineOverride ?? ''}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item = draft.variants[index];
                      if (item !== undefined)
                        item.headlineOverride = event.target.value;
                    })
                  }
                />
                <SelectField
                  label="Preferred resume"
                  value={variant.preferredResumeId ?? ''}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item = draft.variants[index];
                      if (item !== undefined)
                        item.preferredResumeId = event.target.value || null;
                    })
                  }
                >
                  <option value="">Use first configured resume</option>
                  {profile.baseProfile.documents.resumes.map((resume) => (
                    <option value={resume.id} key={resume.id}>
                      {resume.label || resume.fileName || 'Untitled resume'}
                    </option>
                  ))}
                </SelectField>
              </FieldGrid>
              <Button
                className="justify-self-start"
                variant="danger"
                onClick={() =>
                  changeProfile((draft) => {
                    const removed = draft.variants[index];
                    draft.variants.splice(index, 1);
                    if (
                      removed !== undefined &&
                      draft.preferences.defaultVariantId === removed.id
                    ) {
                      draft.preferences.defaultVariantId =
                        draft.variants[0]?.id ?? null;
                    }
                  })
                }
              >
                <Trash2 aria-hidden="true" size={16} />
                Remove variant {index + 1}
              </Button>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
