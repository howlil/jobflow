import { Plus, Trash2 } from 'lucide-react';

import {
  createProfileItemId,
  dateInputProps,
} from './profile-section-helpers';
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
    <>
      <div className="jobflow-section-heading">
        <h3>Certifications</h3>
        <button
          className="jobflow-button"
          type="button"
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
        </button>
      </div>
      {profile.baseProfile.professional.certifications.map(
        (certification, index) => (
          <article className="record-card" key={certification.id}>
            <div className="form-grid">
              <label>
                Certification
                <input
                  value={certification.name}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item =
                        draft.baseProfile.professional.certifications[index];
                      if (item !== undefined) item.name = event.target.value;
                    })
                  }
                />
              </label>
              <label>
                Issuer
                <input
                  value={certification.issuer}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item =
                        draft.baseProfile.professional.certifications[index];
                      if (item !== undefined) item.issuer = event.target.value;
                    })
                  }
                />
              </label>
              <label>
                Credential URL
                <input
                  value={certification.url}
                  onChange={(event) =>
                    changeProfile((draft) => {
                      const item =
                        draft.baseProfile.professional.certifications[index];
                      if (item !== undefined) item.url = event.target.value;
                    })
                  }
                />
              </label>
              <label>
                Issue date
                <input
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
              </label>
              <label>
                Expiry date
                <input
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
              </label>
            </div>
            <button
              className="jobflow-button"
              type="button"
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
              Remove
            </button>
          </article>
        ),
      )}
    </>
  );
}
