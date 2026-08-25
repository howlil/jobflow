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
4. Never automate Next, Apply, Submit, or file attachment.
5. A stored synthetic document may be attached only after an explicit tester click on Fillio's **Attach** action for that detected file field.
6. If a custom upload widget rejects direct native-file assignment, record the incompatibility and use the site's manual picker instead of bypassing the widget.
7. Redact screenshots before attaching them to an issue.
8. Prefer a minimal DOM fixture over a copied full page when reproducing a failure.

## Validation journey

For each representative form:

1. Record browser version, Fillio commit/release, hostname, and ATS family if known.
2. Open the form with a synthetic Fillio profile.
3. Inspect the collapsed Fillio launcher before opening its assistant.
4. Verify normal Ready mappings against the visible label/intent.
5. Verify ambiguous fields remain Review/Unknown.
6. Verify sensitive fields never enter normal Ready.
7. Verify file inputs receive deterministic document intent and never receive a file before an explicit **Attach** click.
8. Trigger explicit Fill only for safe synthetic fields.
9. Verify supported controls receive the expected value and page-compatible input/change events.
10. When testing a native file input, explicitly click **Attach**, verify only the requested stored synthetic document is assigned, and verify no navigation or submission occurs.
11. For unsupported custom upload widgets, verify Fillio reports/falls back to manual file selection rather than silently claiming success.
12. Verify Fillio does not navigate, submit, or click Next/Apply/Submit.
13. If the page dynamically changes, verify re-analysis occurs without automatic filling or attachment.

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
9. explicit document attachment compatibility

Fix the generic layer first. Add a vendor-specific adapter only when the same reproducible failure cannot be fixed generically without broader regressions or unreasonable complexity.
