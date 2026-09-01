# Jobflow Project

## Purpose

Jobflow reduces repetitive data entry and operational friction during job applications. The user owns one canonical local career profile; Jobflow detects application forms, maps fields deterministically, recommends an application variant, and fills approved safe data without taking over submission.

The product succeeds by being reliably useful, conservative when uncertain, and explicit about sensitive disclosure. Supporting every ATS is not the goal.

## Intended user

A job seeker using Chromium desktop who wants a local-first workspace for reusable career data, safe form autofill, documents, sensitive data, and application tracking.

## Committed product behavior

### Career profile

- One canonical reusable career profile is the source of truth for reusable facts.
- Application variants are lightweight overrides, not duplicated full profiles.
- Experience and Projects are the user-facing skill-authoring sources.
- The active skill inventory is the case-insensitive unique union of skills linked from Experience and Projects.
- Skill proficiency/level and years-of-experience are not part of the current user-facing skill model.
- A persisted professional skill registry may exist only as a compatibility/stable-ID index; registry-only entries are not active career skills.
- CV import must not create standalone active skills or fabricate skill-to-Experience/Project relationships.

### Autofill

- Chromium desktop first.
- Generic deterministic form handling comes before ATS-specific adapters.
- The core matcher is deterministic; AI/LLM behavior is not required for core autofill.
- The user explicitly triggers fill.
- Matching evidence does not itself authorize DOM mutation; execution goes through an explicit fill plan.
- Unknown or low-confidence fields remain untouched.
- The user can review ambiguous mappings and corrections.
- Jobflow never automatically clicks Apply, Submit, Next, or equivalent navigation.
- File attachment remains explicit for the specific detected field.

### Sensitive data

- Sensitive data is separate from the normal career profile.
- Sensitive values are stored locally behind encrypted vault handling.
- Unlocking the vault is not blanket authorization to disclose values.
- Sensitive disclosure requires explicit approval for the current site/fill action.
- No profile, form-value, sensitive-data, or career telemetry is part of the current product.

### Documents

- Documents/resumes are stored locally by the extension.
- CV text extraction is local and review-before-import.
- Selecting a CV for import does not overwrite the profile without review.
- Detecting a document field does not authorize automatic attachment.

### Application pipeline

- Reviewed opportunities are stored locally in versioned application persistence.
- Pipeline is the operational home for application work.
- Application Detail is the focused execution surface for one opportunity.
- The pipeline supports create/read/update/delete, priority, next-action tracking, deadlines, explicit stage changes, and terminal outcomes.
- Job capture remains user-reviewed; Jobflow is not a job-discovery platform.

## Primary product surfaces

- Full-tab career/workspace surface for profile, documents, pipeline, variants, vault, corrections, and backup/recovery.
- In-page assistant for current-site analysis, fill review, explicit attachment, and sensitive disclosure.
- Browser-action popup as a compact entry surface.

Interaction and visual authority for these surfaces lives in `.agents/DESIGN.md`.

## Data ownership and trust boundaries

- Canonical career facts: local versioned base profile.
- Application-specific differences: lightweight local variant overrides.
- Application pipeline: versioned local application storage.
- Document binaries: extension-owned local document storage.
- Sensitive data: encrypted local vault with separate unlock/session handling.
- Page analysis: ephemeral per-page state.
- Host pages do not own Jobflow career data.

## Product invariants

The following are locked unless the user explicitly changes product scope or security behavior:

- local-first; no account/backend/cloud sync requirement
- deterministic core before AI
- generic engine before speculative ATS adapters
- explicit user-triggered fill
- no automatic submit/navigation
- no automatic file attachment
- unknown/unsupported behavior fails closed
- sensitive data requires encrypted vault handling plus explicit current-site disclosure approval
- persisted data remains versioned and validated
- least browser permissions
- no career/profile/form-value telemetry

## Deferred / non-goals

Until explicitly authorized, do not introduce:

- backend, account system, or cloud sync
- AI/LLM dependency for core autofill
- job discovery or recommendation platform
- automatic submission/navigation
- automatic file attachment
- global collaborative mapping learning
- speculative ATS adapters without a reproducible generic-engine failure
- analytics containing applicant/profile/form data
- framework rewrites without current measured need

## Material open decisions

No unresolved material product decision is recorded here. New product-scope, public-contract, data-ownership, permission, privacy, or security decisions require explicit user approval before being treated as committed.