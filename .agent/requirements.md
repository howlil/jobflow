# Product Contract

## Product authority

The user owns product decisions: WHY, WHAT, product scope/boundaries, product semantics, and final direction. The agent may surface evidence, risks, alternatives, and recommendations, but must not silently expand scope or convert a recommendation into a product decision.

When the user's request is clear, the agent may derive concise observable acceptance criteria and execute ordinary local engineering decisions without asking for approval.

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
- local job application pipeline with create/read/update/delete, user-reviewed current-page capture, and explicit stage changes
- local backup/recovery and compatibility evidence
- options workspace, popup, and in-page assistant surfaces

This section describes current capability, not a promise to preserve every current implementation detail.

## Career skill ownership

- Skills are authored through Experience and Projects; there is no standalone Skills workspace.
- The active skill inventory is the case-insensitive unique union of `Experience.skills` and `Project.skills`.
- Skill proficiency/level and years-of-experience are not part of the current user-facing skill model.
- The persisted professional skill registry may remain as a compatibility index for stable internal IDs, but an unlinked registry entry is not an active career skill.
- CV import must not create standalone active skills or fabricate skill-to-experience/project relationships.

## Requirement discipline

Specify only what is needed to remove ambiguity for the current logical change.

For a routine bounded task, explicit user intent plus directly derived observable acceptance criteria is enough. Do not require a mini-PRD, fixed acceptance-criteria count, roadmap, metrics section, or planning artifact.

When a short requirement note is useful, prefer:

```text
Problem / request:
Expected observable outcome:
Acceptance criteria: only what is needed
Material non-goals or boundaries: only when relevant
Risk flags: only when they change verification/design
```

If the unresolved ambiguity would change product scope, product semantics, destructive behavior, privacy posture, permission surface, or a material architecture decision, surface that decision rather than silently inventing it.

If the request contains multiple independently useful outcomes, split only when doing so materially reduces risk or batch size; do not split mechanically when one coherent change is simpler.

## Product evidence and metrics

Product evidence exists to answer a current product question, not to satisfy process ceremony.

Possible privacy-safe measures include:

- safe fill coverage
- fill execution success
- review/unknown rate
- correction rate
- compatibility pass rate
- regression rate
- safety incidents
- task friction

These are reference measures, **not mandatory instrumentation or deliverables for every change**. Use only the evidence needed for the current decision. Prefer existing fixtures, compatibility evidence, direct observation, or opt-in trusted-beta feedback when sufficient.

Do not add invasive telemetry to obtain these numbers. Before a meaningful release, decide whether new instrumentation is actually necessary to evaluate the expected outcome; default to none when it adds little decision value.

## Explicit non-goals until the user changes the contract

- backend/account/cloud sync
- AI/LLM dependency for core autofill
- job discovery/recommendation platform
- automatic submission/navigation
- automatic file attachment
- global collaborative mapping learning
- speculative ATS adapters without a reproducible failure
- analytics platform containing applicant/profile/form data
- framework rewrites without measured runtime/maintenance evidence

Evidence may justify recommending a change to a non-goal, but evidence alone does **not** authorize the agent to expand the product contract. If the user decides to change scope, update this contract in the same logical change that implements the approved decision.
