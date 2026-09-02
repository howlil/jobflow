# Current Iteration

**Status:** Active — Core Autofill Coverage & Verified Fill implementation complete; milestone verification pending.

## Milestone

**Goal:** Core Autofill Coverage & Verified Fill

**Why:** Jobflow stores richer reusable career data than the generic autofill engine can currently use, and normal Fill execution does not surface whether every requested DOM mutation actually succeeded.

**Desired outcome:** Existing safe profile facts and reusable application answers flow deterministically through FieldContext → MatchResult → FillPlan → explicit DOM fill, while every explicit Fill reports observed success/partial failure without weakening fail-closed behavior.

## Slices

### Slice 1 — Safe scalar coverage

- Add bounded factual intents for address line 1/2, professional summary, and notice period.
- Keep repeated experience/education/project entities out of automatic matching.

### Slice 2 — Reusable answer intent

- Match non-empty reusable answers deterministically from exact question/tag evidence.
- Similar but non-identical questions remain Review; unrelated questions remain Unknown.
- Sensitive classification always outranks reusable answers.
- Active application variants can override reusable answers by stable canonical intent.

### Slice 3 — Teach Unknown

- Allow site/form/field-scoped correction memory to target an existing reusable answer.
- Persist correction schema v2 and migrate supported v1 entries without loss.
- Do not create global learning or remote training behavior.

### Slice 4 — Deterministic choice controls

- Preserve exact value / normalized visible-label selection for select/radio.
- Allow explicit yes/no reusable answers to resolve native checkboxes deterministically.
- Unsupported options fail locally instead of guessing.

### Slice 5 — Verified Fill

- Return filled / not-found / unsupported for every requested instruction.
- Show concise success or partial-failure outcome in the in-page assistant.
- Independent instructions continue after one local failure.

### Slice 6 — Compatibility evidence

- Add focused corpus coverage for new scalar intents, reusable answers, correction migration, choice resolution, disappeared controls, partial failure, and user-visible fill outcome.
- Browser E2E remains targeted runtime evidence, not a mandatory CI ceremony.

## Scope Boundaries

Out of scope:

- ATS-specific production adapters without reproducible generic-engine failure
- AI/LLM matching or generated answers
- experience/education repeated-record autofill
- automatic Submit / Apply / Next
- automatic document attachment
- backend/cloud sync, analytics, job discovery, Action Queue work
- browser permission expansion

## Verification

Required milestone gate:

```text
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm verify:manifest
```

Targeted browser evidence for the changed explicit-fill runtime:

```text
pnpm test:e2e
```

## Current Position

Implementation for all six slices is on `core-autofill-coverage`. Focused regression coverage has been added. Required integration verification and targeted browser runtime verification are pending on the exact branch head.

## Next Action

Run milestone verification, fix only evidence-backed failures, then merge the verified milestone and close this iteration.
