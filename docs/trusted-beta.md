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
- explicit Fill works on safe fields
- non-empty user values are not silently overwritten
- sensitive fields remain gated by the vault and site approval
- document fields remain manual-only
- no Next/Apply/Submit is triggered
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
- minimal reproduction steps
- whether dynamic rendering was involved

## Promotion gate

A beta build is healthy enough for broader distribution when:

- mandatory CI remains green
- compatibility evidence has no unresolved safety regression
- false Ready for sensitive/file inputs remains zero in maintained fixtures
- no known automatic navigation/submission/file-upload behavior exists
- repeated live failures have either a generic fix or an explicitly documented adapter decision

Chrome Web Store publication is intentionally outside this workflow.
