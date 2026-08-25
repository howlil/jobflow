# Fillio Privacy

Fillio is a local-first Chromium extension for career-form assistance.

## Data processed

Fillio may process locally in the browser:

- career profile fields entered by the user
- application variants
- page/form field labels and structural context needed for deterministic matching
- exact site/form/field correction metadata
- optional sensitive profile values stored in the encrypted Sensitive Data Vault
- document metadata such as a configured resume label and file name

## Data storage

Normal profile data, variants, corrections, and settings are stored in extension-local browser storage.

Sensitive values are stored separately as an authenticated encrypted vault envelope. The vault passphrase is not persisted. The unlocked key/session is memory-only and expires after inactivity or may disappear sooner when the browser suspends the extension background worker.

## Network transmission

The current product has no Fillio account, backend, cloud sync, analytics service, advertising integration, or AI service dependency. Fillio does not intentionally transmit career profile values, form values, page content, or sensitive identifiers to a Fillio-operated service.

Normal browser behavior and the job site itself are outside Fillio's control. When the user explicitly fills a field, the value becomes part of the current web page and may then be processed by that site's own application form according to the site's policies.

## Sensitive disclosure

Unlocking the vault does not grant blanket permission to disclose sensitive data. Sensitive values require a separate approval for the current site/fill operation. Fillio requests only the sensitive field paths needed for the detected controls.

## Automatic actions

Fillio does not automatically click Apply, Submit, Next, or file-upload controls. File selection and final submission remain user actions.

## Permissions

Fillio follows least privilege. Any future permission increase must correspond to a concrete feature, pass manifest verification, and be reflected in this document and store disclosure before release.

## Backups

Profile backup export contains the normal versioned career profile and application variants. It does not export Sensitive Data Vault values as plaintext.

## Future changes

Features that introduce a backend, cloud sync, analytics, AI/network processing, or additional browser permissions require an explicit architecture/privacy review and user-visible disclosure before release.
