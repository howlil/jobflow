# Product Contract

## Product job

Job Flow reduces repetitive data entry in job applications. The user owns one canonical local career profile; Job Flow detects application forms, maps fields deterministically, recommends an application variant, and fills approved safe data without taking over submission.

MVP/product success is not "support every ATS". It is reliable useful autofill with explicit user control, conservative failure behavior, and no silent disclosure of sensitive data.

## Locked product invariants

- Chromium desktop first.
- Local-first: the current product does not require an account/backend/cloud sync.
- Deterministic core behavior before AI.
- Generic form engine before ATS-specific adapters.
- User explicitly triggers fill.
- Never automatically click Apply, Submit, Next, or equivalent navigation.
- File attachment remains explicit for the specific detected field.
- Unknown/low-confidence fields remain untouched.
- Sensitive data remains behind encrypted vault handling and explicit current-site disclosure approval.
- Persisted data is versioned and validated.
- No career/profile/form-value telemetry.

## Current product capabilities

The codebase currently includes:

- canonical career profile + lightweight application variants
- local profile persistence
- generic form detection/extraction/matching/fill planning/filling
- Ready / Review / Unknown / Sensitive handling
- correction memory and dynamic-form re-analysis
- encrypted local Sensitive Data Vault
- deterministic context/variant recommendation
- local document metadata/storage, CV text extraction with review-before-import, and explicit attachment flow
- local backup/recovery and compatibility evidence
- options workspace, popup, and in-page assistant surfaces

This section describes current capability, not a promise to preserve every current implementation detail.

## Requirement format for every change

Do not write a mini-PRD for routine work. A change needs only:

```text
Problem:
User/engineering outcome:
Acceptance criteria: 3-5 observable bullets
Non-goals:
Risk flags: none | runtime | storage/schema | permission | privacy/security | release
```

If acceptance requires multiple independently useful outcomes, split the work item.

## Product metrics

Because Job Flow is local-first and avoids applicant-data telemetry, prefer privacy-safe fixture/compatibility evidence and opt-in trusted-beta observations.

Track or sample:

- **safe fill coverage** — supported safe fields that reach Ready and can be filled on maintained representative forms
- **fill execution success** — approved fill instructions successfully applied without aborting unrelated fields
- **review/unknown rate** — eligible discovered fields that still need review or remain unknown
- **correction rate** — recognized mappings that users must correct in validation/beta sessions
- **compatibility pass rate** — maintained ATS/custom-form journeys passing the expected invariants
- **regression rate** — previously supported journeys broken by a change
- **safety incidents** — automatic submission, automatic attachment, or sensitive disclosure without approval; target is always zero
- **task friction** — manually sampled steps/time needed to configure a profile and complete a representative form journey

Do not add invasive telemetry to obtain these numbers. Establish a baseline before creating numeric performance targets.

## Explicit non-goals until evidence changes the contract

- backend/account/cloud sync
- AI/LLM dependency for core autofill
- job discovery/recommendation platform
- application tracker
- automatic submission/navigation
- automatic file attachment
- global collaborative mapping learning
- speculative ATS adapters without a reproducible failure
- analytics platform containing applicant/profile/form data
- framework rewrites without measured runtime/maintenance evidence

When a non-goal becomes necessary, update this contract in the same logical change and state the evidence that justified it.
