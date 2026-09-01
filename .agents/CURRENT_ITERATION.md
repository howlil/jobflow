# Current Milestone

**Status:** Active — implementation complete on `application-lifecycle`; browser acceptance is failing and integration is blocked.

**Goal:** Rich Application Lifecycle

**Why:** Keep Pipeline simple as the operational overview while Application Detail represents the real opportunity lifecycle precisely enough to show current state, prior events, important dates, and the next useful action.

## Feature Compass

**Shape:**
- Primary lifecycle: Saved → Applying → Applied → Interview → Offer → Closed.
- Detailed states such as Assessment, Technical interview, Accepted, Rejected, and Withdrawn are substages/outcomes rather than extra board columns.
- Application Detail shows lifecycle history, important dates, explicit closure outcome, and deterministic next-action guidance.

**Position:**
- Application Detail is already integrated on `master`.
- Schema v3, v1/v2 migration, lifecycle history, stage-date semantics, primary/substage UI, deterministic guidance, and updated unit/browser acceptance are implemented on branch `application-lifecycle`.
- PR #54 head `75deaea8823226e2d1f65f1d0ee3da8a70a95f89` completed CI run 634 with unit tests, typecheck, lint, format, compatibility, build, and generated-manifest verification green.
- The same exact head failed the Browser acceptance step, so the lifecycle logical change is not integration-ready.

**Delta:**
- Reproduce/inspect the browser-acceptance failure on the exact lifecycle head.
- Fix only the evidence-backed failure without expanding lifecycle scope.
- Re-run the required gate and integrate only the exact green head.

**Next Move:**
- Diagnose and fix the PR #54 Browser acceptance failure, then re-run the full required gate.

## Scope

### In

- primary lifecycle state model
- substages / terminal outcomes
- schema v3 with explicit v1/v2 migration
- lifecycle history
- stage-date capture
- deterministic next-action guidance
- Pipeline/Application Detail presentation required for that lifecycle
- compatibility update for floating job capture
- focused unit, migration, workspace, and browser acceptance coverage
- evidence-backed fix required to make the approved lifecycle slice pass its existing browser acceptance

### Out

- backend or cloud sync
- job discovery
- AI dependency
- interview log
- fit score
- analytics dashboard
- unrelated module refactors
- unrelated product or architecture changes

## Slices

- [x] Pipeline operational home integrated on `master`.
- [x] Application Detail integrated on `master`.
- [x] Lifecycle schema/model and v1/v2 migration implemented on `application-lifecycle`.
- [x] Lifecycle history, stage dates, substages/outcomes, and deterministic guidance implemented.
- [x] Unit/storage/workspace/browser acceptance coverage updated for the lifecycle behavior.
- [ ] Fix failing browser acceptance on exact lifecycle behavior. ← ACTIVE
- [ ] Re-run full repository quality gate on the resulting exact head.
- [ ] Squash-merge the exact green lifecycle head.

## Current Decisions

- Lifecycle state remains local-only and owned by the applications domain/service.
- Pipeline remains a compact primary-stage overview; detailed lifecycle behavior belongs in Application Detail.
- Existing persisted application data must migrate without dropping job context.
- Explicit user-entered next actions take precedence over deterministic guidance.
- Closed opportunities remain grouped by Accepted / Rejected / Withdrawn outcome.

These are current milestone decisions. Promote only durable material rationale to `DECISIONS.md` after integration when it remains useful beyond this milestone.

## Verification / Evidence

Implemented branch evidence currently includes changes to:

- application schema and migrations
- application service behavior/tests
- `ApplicationDetail`
- `ApplicationsWorkspace`
- application display/focus helpers
- storage migration coverage
- application pipeline browser acceptance
- floating job-capture compatibility

Observed on PR #54 head `75deaea8823226e2d1f65f1d0ee3da8a70a95f89`, CI run 634:

```text
pnpm test                 PASS
pnpm typecheck            PASS
pnpm lint                 PASS
pnpm format:check         PASS
pnpm verify:compatibility PASS
pnpm build                PASS
pnpm verify:manifest      PASS
pnpm test:e2e             FAIL (Browser acceptance step)
```

Integration requires the complete gate to pass on the exact head that will be merged.

## Blockers / Risks

- Current blocker: PR #54 Browser acceptance failure on CI run 634.
- Persisted application migration is the highest-risk part of the logical change; data integrity and backward compatibility must remain green.
- Stage/substage semantics affect several UI and compatibility consumers; failures must be fixed at the owning boundary rather than patched with parallel mappings.
- The `.agents` normalization is an independent repository-maintenance logical change and must not silently expand the lifecycle product scope.

## Next Action

Reproduce or inspect the PR #54 Browser acceptance failure, make the smallest evidence-backed fix, then re-run the full required gate and squash-merge only the exact green lifecycle head.