import type { StoredProfileEnvelope } from '../../../domain/profile/profile-schema';
import type { WorkspaceSection } from '../workspace-sections';
import { createProfileItemId } from './profile-section-helpers';
import type { ProfileSectionProps } from './profile-section-types';

type ContactItem =
  StoredProfileEnvelope['baseProfile']['contact']['emails'][number];

function primaryContactValue(items: ContactItem[]): string {
  return items.find((item) => item.primary)?.value ?? items[0]?.value ?? '';
}

function updatePrimaryContact(
  items: ContactItem[],
  value: string,
): ContactItem[] {
  const primaryIndex = items.findIndex((item) => item.primary);
  if (primaryIndex === -1) {
    return [
      { id: createProfileItemId(), label: 'Primary', value, primary: true },
      ...items,
    ];
  }
  return items.map((item, index) =>
    index === primaryIndex ? { ...item, value } : item,
  );
}

function isPersonalSurface(activeSection: WorkspaceSection): boolean {
  return (
    activeSection === 'personal' ||
    activeSection === 'contact' ||
    activeSection === 'links'
  );
}

export function PersonalDetailsSection({
  activeSection,
  changeProfile,
  profile,
}: ProfileSectionProps) {
  const hidden = !isPersonalSurface(activeSection);

  return (
    <>
      <section className="profile-section" id="basic-info" hidden={hidden}>
        <h2>Basic information</h2>
        <div className="form-grid">
          <label>
            First name
            <input
              value={profile.baseProfile.personal.legalName.first}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.personal.legalName.first =
                    event.target.value;
                })
              }
            />
          </label>
          <label>
            Middle name
            <input
              value={profile.baseProfile.personal.legalName.middle}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.personal.legalName.middle =
                    event.target.value;
                })
              }
            />
          </label>
          <label>
            Last name
            <input
              value={profile.baseProfile.personal.legalName.last}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.personal.legalName.last =
                    event.target.value;
                })
              }
            />
          </label>
          <label>
            Preferred name
            <input
              value={profile.baseProfile.personal.preferredName}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.personal.preferredName = event.target.value;
                })
              }
            />
          </label>
          <label>
            Professional headline
            <input
              value={profile.baseProfile.professional.headline}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.professional.headline = event.target.value;
                })
              }
            />
          </label>
        </div>
        <label>
          Professional summary
          <textarea
            value={profile.baseProfile.professional.summary}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.professional.summary = event.target.value;
              })
            }
          />
        </label>
      </section>

      <section className="profile-section" hidden={hidden}>
        <h2>Contact</h2>
        <div className="form-grid">
          <label>
            Primary email
            <input
              type="email"
              value={primaryContactValue(profile.baseProfile.contact.emails)}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.contact.emails = updatePrimaryContact(
                    draft.baseProfile.contact.emails,
                    event.target.value,
                  );
                })
              }
            />
          </label>
          <label>
            Primary phone
            <input
              value={primaryContactValue(profile.baseProfile.contact.phones)}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.contact.phones = updatePrimaryContact(
                    draft.baseProfile.contact.phones,
                    event.target.value,
                  );
                })
              }
            />
          </label>
          <label>
            WhatsApp
            <input
              value={profile.baseProfile.contact.whatsapp}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.contact.whatsapp = event.target.value;
                })
              }
            />
          </label>
          <label>
            Address line
            <input
              value={profile.baseProfile.contact.address.line1}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.contact.address.line1 = event.target.value;
                })
              }
            />
          </label>
          <label>
            City
            <input
              value={profile.baseProfile.contact.address.city}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.contact.address.city = event.target.value;
                })
              }
            />
          </label>
          <label>
            State / province
            <input
              value={profile.baseProfile.contact.address.state}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.contact.address.state = event.target.value;
                })
              }
            />
          </label>
          <label>
            Country
            <input
              value={profile.baseProfile.contact.address.country}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.contact.address.country =
                    event.target.value;
                })
              }
            />
          </label>
          <label>
            Postal code
            <input
              value={profile.baseProfile.contact.address.postalCode}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.contact.address.postalCode =
                    event.target.value;
                })
              }
            />
          </label>
        </div>
      </section>

      <section className="profile-section" hidden={hidden}>
        <h2>Links</h2>
        <div className="form-grid">
          <label>
            LinkedIn
            <input
              value={profile.baseProfile.links.linkedin}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.links.linkedin = event.target.value;
                })
              }
            />
          </label>
          <label>
            GitHub
            <input
              value={profile.baseProfile.links.github}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.links.github = event.target.value;
                })
              }
            />
          </label>
          <label>
            Portfolio
            <input
              value={profile.baseProfile.links.portfolio}
              onChange={(event) =>
                changeProfile((draft) => {
                  draft.baseProfile.links.portfolio = event.target.value;
                })
              }
            />
          </label>
        </div>
      </section>
    </>
  );
}
