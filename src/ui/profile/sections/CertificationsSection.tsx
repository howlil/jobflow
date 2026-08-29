import { Plus, Trash2 } from 'lucide-react';

import {
  Button,
  EmptyState,
  FieldGrid,
  Subsection,
  TextField,
} from '../../design-system/primitives';
import { createProfileItemId, dateInputProps } from './profile-section-helpers';
import type { ProfileSectionProps } from './profile-section-types';

type CertificationsSectionProps = Pick<
  ProfileSectionProps,
  'changeProfile' | 'profile'
>;

export function CertificationsSection({
  changeProfile,
  profile,
}: CertificationsSectionProps) {
  return (
    <Subsection
      title="Certifications"
      action={
        <Button
          onClick={() =>
            changeProfile((draft) =>
              draft.baseProfile.professional.certifications.push({
                id: createProfileItemId(),
                name: '',
                issuer: '',
                issueDate: '',
                expiryDate: '',
                credentialId: '',
                url: '',
              }),
            )
          }
        >
          <Plus aria-hidden="true" size={16} />
          Add certification
        </Button>
      }
    >
      {profile.baseProfile.professional.certifications.length === 0 ? (
        <EmptyState>No certifications added yet.</EmptyState>
      ) : (
        <div className="grid gap-3">
          {profile.baseProfile.professional.certifications.map(
            (certification, index) => (
              <article
                className="grid gap-4 rounded-app border border-app-border bg-app-muted p-4"
                key={certification.id}
              >
                <FieldGrid columns={3}>
                  <TextField
                    label="Certification"
                    value={certification.name}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.certifications[index];
                        if (item !== undefined) item.name = event.target.value;
                      })
                    }
                  />
                  <TextField
                    label="Issuer"
                    value={certification.issuer}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.certifications[index];
                        if (item !== undefined)
                          item.issuer = event.target.value;
                      })
                    }
                  />
                  <TextField
                    label="Credential URL"
                    value={certification.url}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.certifications[index];
                        if (item !== undefined) item.url = event.target.value;
                      })
                    }
                  />
                  <TextField
                    label="Issue date"
                    {...dateInputProps(certification.issueDate)}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.certifications[index];
                        if (item !== undefined)
                          item.issueDate = event.target.value;
                      })
                    }
                  />
                  <TextField
                    className="lg:col-span-2"
                    label="Expiry date"
                    {...dateInputProps(certification.expiryDate)}
                    onChange={(event) =>
                      changeProfile((draft) => {
                        const item =
                          draft.baseProfile.professional.certifications[index];
                        if (item !== undefined)
                          item.expiryDate = event.target.value;
                      })
                    }
                  />
                </FieldGrid>
                <Button
                  className="justify-self-start"
                  variant="danger"
                  onClick={() =>
                    changeProfile((draft) =>
                      draft.baseProfile.professional.certifications.splice(
                        index,
                        1,
                      ),
                    )
                  }
                >
                  <Trash2 aria-hidden="true" size={16} />
                  Remove certification
                </Button>
              </article>
            ),
          )}
        </div>
      )}
    </Subsection>
  );
}
