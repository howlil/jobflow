# Trusted Beta Workflow

This beta path deliberately does not require Chrome Web Store publishing.

## Distribution

1. Start from a verified `master` commit.
2. Use the existing fail-closed tag release workflow to produce the extension ZIP and SHA-256 checksum.
3. Share the immutable GitHub Release with a small trusted tester group.
4. Testers verify the checksum before unpacking/loading the extension in Chromium developer mode.
5. Collect compatibility evidence through the repository issue template rather than telemetry.

Do not distribute arbitrary branch builds as beta releases.

## Tester acceptance

Each tester should validate:

- install/reload succeeds
- profile persists after browser restart
- career workspace remains usable at desktop, tablet, and narrow widths
- detected forms show only the small Fillio launcher until explicitly opened
- explicit Fill works on safe fields
- non-empty user values are not silently overwritten
- sensitive fields remain gated by the vault and site approval
- PDF/DOCX/TXT CV import produces a review draft without silent profile overwrite
- stored CV binaries remain local and can be removed
- recognized native file inputs receive a stored document only after an explicit **Attach** click
- unsupported custom upload widgets fall back to manual file selection rather than claiming success
- no Next/Apply/Submit is triggered by fill or attachment
- dynamic forms re-analyze without automatic action
- backup export/inspection/recovery behaves as documented
- learned corrections can be inspected and removed

## Feedback rules

Use the compatibility report issue form. Reports must not contain:

- real government IDs
- compensation values
- passwords or vault passphrases
- private application answers
- candidate/session tokens in URLs
- resume or cover-letter contents
- unredacted screenshots containing personal information

Useful evidence includes:

- Fillio release/commit
- browser version
- sanitized hostname
- ATS family if known
- visible field label without the applicant's entered value
- expected classification
- observed classification
- whether explicit native-file attachment worked or required manual fallback
- minimal reproduction steps
- whether dynamic rendering was involved

## Promotion gate

A beta build is healthy enough for broader distribution when:

- mandatory CI remains green
- compatibility evidence has no unresolved safety regression
- false Ready for sensitive/file inputs remains zero in maintained fixtures
- no known automatic navigation, submission, or file-attachment behavior exists
- explicit attachment never causes submission/navigation and fails closed on unsupported widgets
- repeated live failures have either a generic fix or an explicitly documented adapter decision

Chrome Web Store publication is intentionally outside this workflow.
