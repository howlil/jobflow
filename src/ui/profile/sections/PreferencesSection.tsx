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
    <details
      className="profile-section"
      open
      hidden={activeSection !== 'preferences'}
    >
      <summary>Job preferences</summary>
      <div className="form-grid">
        <label>
          Desired roles, comma separated
          <input
            value={listValue(profile.baseProfile.jobPreferences.desiredRoles)}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.jobPreferences.desiredRoles = parseList(
                  event.target.value,
                );
              })
            }
          />
        </label>
        <label>
          Employment types
          <input
            value={listValue(
              profile.baseProfile.jobPreferences.employmentTypes,
            )}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.jobPreferences.employmentTypes = parseList(
                  event.target.value,
                );
              })
            }
          />
        </label>
        <label>
          Work arrangements
          <input
            value={listValue(
              profile.baseProfile.jobPreferences.workArrangements,
            )}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.jobPreferences.workArrangements = parseList(
                  event.target.value,
                );
              })
            }
          />
        </label>
        <label>
          Preferred locations
          <input
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
        </label>
        <label>
          Availability date
          <input
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
        </label>
        <label>
          Notice period
          <input
            value={profile.baseProfile.jobPreferences.noticePeriod}
            onChange={(event) =>
              changeProfile((draft) => {
                draft.baseProfile.jobPreferences.noticePeriod =
                  event.target.value;
              })
            }
          />
        </label>
      </div>
    </details>
  );
}
