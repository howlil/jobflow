# Current Milestone

**Status:** Active — implementation complete on `application-lifecycle`; quality gate and integration pending.

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
- The branch is ahead of `master`; repository quality gates and integration remain pending.

**Delta:**
- Verify the implemented lifecycle change on its exact head.
- Fix only evidence-backed failures.
- Integrate the green logical change without expanding scope.

**Next Move:**
- Run the full repository quality gate on `application-lifecycle`, then squash-merge the exact green head.

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
- [ ] Full repository quality gate on exact `application-lifecycle` head. ← ACTIVE
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

Required quality gate before integration:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm verify:compatibility
pnpm build
pnpm verify:manifest
pnpm test:e2e
```

Do not record a gate as passed until it is actually observed on the exact integration head.

## Blockers / Risks

- Persisted application migration is the highest-risk part of the current logical change; data integrity and backward compatibility must remain green.
- Stage/substage semantics affect several UI and compatibility consumers; failures must be fixed at the owning boundary rather than patched with parallel mappings.
- The `.agents` normalization is an independent repository-maintenance logical change and must not silently expand the lifecycle product scope.

## Next Action

Run the full repository quality gate on `application-lifecycle`, fix only evidence-backed failures, then squash-merge the exact green head.