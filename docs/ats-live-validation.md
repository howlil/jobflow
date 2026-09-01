# ATS Live Validation Protocol

This protocol turns real application-form failures into reproducible generic-engine evidence without collecting applicant data. It is a diagnostic protocol, not a support matrix or mandatory release ritual.

## Scope

Representative families may include:

- Greenhouse
- Lever
- Workday
- Ashby
- SmartRecruiters
- custom employer forms

The presence of a family here is not a support claim. Live compatibility exists only to the extent demonstrated by an observed, reproducible validation record.

## Safety rules

1. Use a test profile containing synthetic values only.
2. Never include government IDs, compensation, references, family data, candidate tokens, passwords, private resume contents, or real application answers in evidence.
3. Never submit an application during validation.
4. Never automate Next, Apply, Submit, or file attachment.
5. A stored synthetic document may be attached only after an explicit tester click on Job Flow's **Attach** action for that detected file field.
6. If a custom upload widget rejects direct native-file assignment, record the incompatibility and use the site's manual picker instead of bypassing the widget.
7. Redact screenshots before attaching them to an issue.
8. Prefer a minimal DOM fixture over a copied full page when reproducing a failure.

## Validation journey

For a representative form:

1. Record browser version, Job Flow commit/release, hostname, and ATS family if known.
2. Open the form with a synthetic Job Flow profile.
3. Inspect the collapsed Job Flow launcher before opening its assistant.
4. Verify normal Ready mappings against the visible label/intent.
5. Verify ambiguous fields remain Review/Unknown.
6. Verify sensitive fields never enter normal Ready.
7. Verify file inputs receive deterministic document intent and never receive a file before an explicit **Attach** click.
8. Trigger explicit Fill only for safe synthetic fields.
9. Verify supported controls receive the expected value and page-compatible input/change events.
10. When testing a native file input, explicitly click **Attach**, verify only the requested stored synthetic document is assigned, and verify no navigation or submission occurs.
11. For unsupported custom upload widgets, verify Job Flow reports/falls back to manual file selection rather than silently claiming success.
12. Verify Job Flow does not navigate, submit, or click Next/Apply/Submit.
13. If the page dynamically changes, verify re-analysis occurs without automatic filling or attachment.

## Recording evidence

Record a live result only when it is reproducible and useful. Prefer:

- a sanitized focused fixture plus regression test for a generic-engine defect;
- a redacted GitHub compatibility report when the failure depends on real browser/site behavior;
- a short PR/release note when a compatibility fix materially changes supported behavior.

Do not maintain a parallel family-status JSON or promote adapter states through metadata. An adapter candidate must point directly to the reproducible failure that justifies it.

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
