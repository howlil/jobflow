# ATS Live Validation Protocol

This protocol turns real application-form failures into reproducible generic-engine evidence without collecting applicant data.

## Scope

Target families:

- Greenhouse
- Lever
- Workday
- Ashby
- SmartRecruiters
- custom employer forms

The presence of an ATS family in this document is not a support claim. `docs/compatibility-evidence.json` is the machine-checked source of truth for fixture and live status.

## Safety rules

1. Use a test profile containing synthetic values only.
2. Never include government IDs, compensation, references, family data, candidate tokens, passwords, private resume contents, or real application answers in evidence.
3. Never submit an application during validation.
4. Never automate Next, Apply, Submit, file selection, or file upload.
5. Test file fields only for deterministic intent classification and manual guidance.
6. Redact screenshots before attaching them to an issue.
7. Prefer a minimal DOM fixture over a copied full page when reproducing a failure.

## Validation journey

For each representative form:

1. Record browser version, Fillio commit/release, hostname, and ATS family if known.
2. Open the form with a synthetic Fillio profile.
3. Inspect the Fillio page summary before filling.
4. Verify normal Ready mappings against the visible label/intent.
5. Verify ambiguous fields remain Review/Unknown.
6. Verify sensitive fields never enter normal Ready.
7. Verify file inputs remain manual-only and document intent fails closed when ambiguous.
8. Trigger explicit Fill only for safe synthetic fields.
9. Verify supported controls receive the expected value and page-compatible input/change events.
10. Verify Fillio does not navigate, submit, click Next, or upload files.
11. If the page dynamically changes, verify re-analysis occurs without automatic filling.

## Recording evidence

Update `docs/compatibility-evidence.json` only when evidence is reproducible.

A family may move from `liveStatus: pending` to `verified` only with a non-empty `liveEvidence` reference describing the tested journey. A failure should record the smallest safe reproduction in a GitHub issue and, where possible, a sanitized fixture committed with its regression test.

Do not mark an ATS adapter as `candidate` or `implemented` unless `reproducibleFailure` is non-empty. CI enforces this gate.

## Failure triage

Classify failures by the lowest generic layer that explains them:

1. extraction/context loss
2. matching ambiguity/collision
3. fill-plan safety
4. DOM setter/event compatibility
5. dynamic re-analysis/fingerprinting
6. correction-memory behavior
7. sensitive disclosure behavior
8. document intent classification

Fix the generic layer first. Add a vendor-specific adapter only when the same reproducible failure cannot be fixed generically without broader regressions or unreasonable complexity.
