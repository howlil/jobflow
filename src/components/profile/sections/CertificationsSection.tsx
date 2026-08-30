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
    <WorkspaceSubsection
      title="Certifications"
      help="Add professional certifications and credential dates used by application forms."
      action={
        <IconButton
          size="sm"
          aria-label="Add certification"
          title="Add certification"
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
        </IconButton>
      }
    >
      {profile.baseProfile.professional.certifications.length === 0 ? (
        <EmptyState>No certifications added yet.</EmptyState>
      ) : (
        <div className="grid gap-3">
          {profile.baseProfile.professional.certifications.map(
            (certification, index) => (
              <RecordCard
                key={certification.id}
                action={
                  <IconButton
                    size="xs"
                    tone="danger"
                    aria-label={`Remove certification ${index + 1}`}
                    title={`Remove certification ${index + 1}`}
                    onClick={() =>
                      changeProfile((draft) =>
                        draft.baseProfile.professional.certifications.splice(
                          index,
                          1,
                        ),
                      )
                    }
                  >
                    <Trash2 aria-hidden="true" size={14} />
                  </IconButton>
                }
              >
                <RecordHeader
                  title={certification.name || `Certification ${index + 1}`}
                  context={certification.issuer || 'Certification details'}
                />
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
              </RecordCard>
            ),
          )}
        </div>
      )}
    </WorkspaceSubsection>
  );
}
