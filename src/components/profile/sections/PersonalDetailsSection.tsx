import type { StoredProfileEnvelope } from '../../../domain/profile/profile-schema';
import { FieldGrid, TextareaField, TextField } from '../../ui';
import { WorkspaceSection, WorkspaceSectionHeader } from '../../layout';
import type { WorkspaceSection as WorkspaceSectionId } from '../workspace-sections';
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

function isPersonalSurface(activeSection: WorkspaceSectionId): boolean {
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
    <div className="grid gap-3">
      <WorkspaceSection id="basic-info" hidden={hidden}>
        <WorkspaceSectionHeader
          title="Basic information"
          description="Your canonical identity, preferred name, headline, and professional summary used across application forms."
        />
        <FieldGrid columns={3}>
          <TextField
            label="First name"
            value={profile.baseProfile.personal.legalName.first}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.personal.legalName.first = event.target.value;
              })
            }
          />
          <TextField
            label="Middle name"
            value={profile.baseProfile.personal.legalName.middle}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.personal.legalName.middle =
                  event.target.value;
              })
            }
          />
          <TextField
            label="Last name"
            value={profile.baseProfile.personal.legalName.last}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.personal.legalName.last = event.target.value;
              })
            }
          />
          <TextField
            label="Preferred name"
            value={profile.baseProfile.personal.preferredName}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.personal.preferredName = event.target.value;
              })
            }
          />
          <TextField
            className="sm:col-span-2 lg:col-span-2"
            label="Professional headline"
            value={profile.baseProfile.professional.headline}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.professional.headline = event.target.value;
              })
            }
          />
        </FieldGrid>
        <TextareaField
          label="Professional summary"
          value={profile.baseProfile.professional.summary}
          onChange={(event) =>
            changeProfile((draft) => {
              draft.baseProfile.professional.summary = event.target.value;
            })
          }
        />
      </WorkspaceSection>

      <WorkspaceSection hidden={hidden}>
        <WorkspaceSectionHeader
          title="Contact"
          description="Contact details Job Flow can map to ordinary job-application fields."
        />
        <FieldGrid>
          <TextField
            type="email"
            label="Primary email"
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
          <TextField
            label="Primary phone"
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
          <TextField
            label="WhatsApp"
            value={profile.baseProfile.contact.whatsapp}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.contact.whatsapp = event.target.value;
              })
            }
          />
          <TextField
            label="Address line"
            value={profile.baseProfile.contact.address.line1}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.contact.address.line1 = event.target.value;
              })
            }
          />
          <TextField
            label="City"
            value={profile.baseProfile.contact.address.city}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.contact.address.city = event.target.value;
              })
            }
          />
          <TextField
            label="State / province"
            value={profile.baseProfile.contact.address.state}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.contact.address.state = event.target.value;
              })
            }
          />
          <TextField
            label="Country"
            value={profile.baseProfile.contact.address.country}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.contact.address.country = event.target.value;
              })
            }
          />
          <TextField
            label="Postal code"
            value={profile.baseProfile.contact.address.postalCode}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.contact.address.postalCode =
                  event.target.value;
              })
            }
          />
        </FieldGrid>
      </WorkspaceSection>

      <WorkspaceSection hidden={hidden}>
        <WorkspaceSectionHeader
          title="Links"
          description="Professional profile, source-code, and portfolio links used in applications."
        />
        <FieldGrid columns={3}>
          <TextField
            label="LinkedIn"
            value={profile.baseProfile.links.linkedin}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.links.linkedin = event.target.value;
              })
            }
          />
          <TextField
            label="GitHub"
            value={profile.baseProfile.links.github}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.links.github = event.target.value;
              })
            }
          />
          <TextField
            label="Portfolio"
            value={profile.baseProfile.links.portfolio}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.links.portfolio = event.target.value;
              })
            }
          />
        </FieldGrid>
      </WorkspaceSection>
    </div>
  );
}
