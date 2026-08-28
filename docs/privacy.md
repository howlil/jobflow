# Job Flow Privacy

Job Flow is a local-first Chromium extension for career-form assistance.

## Data processed

Job Flow may process locally in the browser:

- career profile fields entered by the user
- application variants
- page/form field labels and structural context needed for deterministic matching
- exact site/form/field correction metadata
- optional sensitive profile values stored in the encrypted Sensitive Data Vault
- document metadata such as configured resume labels and file names
- CV/document bytes that the user explicitly chooses to store locally
- text extracted locally from a selected text-based PDF, DOCX, or TXT CV for reviewed profile import

## Data storage

Normal profile data, variants, corrections, document metadata, and settings are stored in extension-local browser storage.

CV/document binaries are stored separately in extension-origin IndexedDB. They are not embedded into the canonical profile envelope or normal profile backups.

Sensitive values are stored separately as an authenticated encrypted vault envelope. The vault passphrase is not persisted. The unlocked key/session is memory-only and expires after inactivity or may disappear sooner when the browser suspends the extension background worker.

## Network transmission

The current product has no Job Flow account, backend, cloud sync, analytics service, advertising integration, or AI service dependency. Job Flow does not intentionally transmit career profile values, CV contents, form values, page content, or sensitive identifiers to a Job Flow-operated service.

Normal browser behavior and the job site itself are outside Job Flow's control. When the user explicitly fills a field or explicitly attaches a stored document, that value/file becomes part of the current web page and may then be processed by that site's own application form according to the site's policies.

## CV import

Choosing a CV does not modify the profile automatically. Job Flow extracts supported text locally, builds deterministic candidate fields, shows conflicts with existing profile values, and applies only groups the user explicitly selects.

Image-only/scanned PDFs are not OCR'd in the current product. They fail with an actionable local error instead of being sent to a remote service.

## Sensitive disclosure

Unlocking the vault does not grant blanket permission to disclose sensitive data. Sensitive values require a separate approval for the current site/fill operation. Job Flow requests only the sensitive field paths needed for the detected controls.

## Automatic actions

Job Flow does not automatically click Apply, Submit, Next, or file-upload controls. A recognized stored document may be assigned to one detected native file input only after the user presses **Attach** in Job Flow's page assistant. Attachment does not trigger submission or navigation. Unsupported custom upload widgets remain manual.

## Permissions

Job Flow follows least privilege. Any future permission increase must correspond to a concrete feature, pass manifest verification, and be reflected in this document and store disclosure before release.

## Backups

Profile backup export contains the normal versioned career profile, document metadata, and application variants. It does not export Sensitive Data Vault values or stored document binaries as plaintext.

## Future changes

Features that introduce a backend, cloud sync, analytics, AI/network processing, OCR service, or additional browser permissions require an explicit architecture/privacy review and user-visible disclosure before release.
