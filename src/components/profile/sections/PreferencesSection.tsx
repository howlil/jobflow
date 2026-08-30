import { FieldGrid, TextField } from '../../ui';
import { WorkspaceSection, WorkspaceSectionHeader } from '../../layout';
import {
  dateInputProps,
  listValue,
  parseList,
} from './profile-section-helpers';
import type { ProfileSectionProps } from './profile-section-types';

export function PreferencesSection({
  activeSection,
  changeProfile,
  profile,
}: ProfileSectionProps) {
  return (
    <WorkspaceSection hidden={activeSection !== 'preferences'}>
      <WorkspaceSectionHeader
        title="Job preferences"
        description="Keep application targeting preferences separate from your factual career profile."
      />
      <FieldGrid>
        <TextField
          label="Desired roles, comma separated"
          value={listValue(profile.baseProfile.jobPreferences.desiredRoles)}
          onChange={(event) =>
            changeProfile((draft) => {
              draft.baseProfile.jobPreferences.desiredRoles = parseList(
                event.target.value,
              );
            })
          }
        />
        <TextField
          label="Employment types"
          value={listValue(profile.baseProfile.jobPreferences.employmentTypes)}
          onChange={(event) =>
            changeProfile((draft) => {
              draft.baseProfile.jobPreferences.employmentTypes = parseList(
                event.target.value,
              );
            })
          }
        />
        <TextField
          label="Work arrangements"
          value={listValue(profile.baseProfile.jobPreferences.workArrangements)}
          onChange={(event) =>
            changeProfile((draft) => {
              draft.baseProfile.jobPreferences.workArrangements = parseList(
                event.target.value,
              );
            })
          }
        />
        <TextField
          label="Preferred locations"
          value={listValue(
            profile.baseProfile.jobPreferences.preferredLocations,
          )}
          onChange={(event) =>
            changeProfile((draft) => {
              draft.baseProfile.jobPreferences.preferredLocations = parseList(
                event.target.value,
              );
            })
          }
        />
        <TextField
          label="Availability date"
          {...dateInputProps(
            profile.baseProfile.jobPreferences.availabilityDate,
          )}
          onChange={(event) =>
            changeProfile((draft) => {
              draft.baseProfile.jobPreferences.availabilityDate =
                event.target.value;
            })
          }
        />
        <TextField
          label="Notice period"
          value={profile.baseProfile.jobPreferences.noticePeriod}
          onChange={(event) =>
            changeProfile((draft) => {
              draft.baseProfile.jobPreferences.noticePeriod =
                event.target.value;
            })
          }
        />
      </FieldGrid>
    </WorkspaceSection>
  );
}
