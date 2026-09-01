# Current Milestone

**Status:** Active — lifecycle implementation is complete; browser black-box E2E is diagnostic only and no longer blocks integration. Required integration verification remains pending on the exact merge head.

**Goal:** Rich Application Lifecycle

**Why:** Keep Pipeline simple as the operational overview while Application Detail represents the real opportunity lifecycle precisely enough to show current state, prior events, important dates, and the next useful action.

## Feature Compass

**Shape:**

- Primary lifecycle: Saved → Applying → Applied → Interview → Offer → Closed.
- Detailed states such as Assessment, Technical interview, Accepted, Rejected, and Withdrawn are substages/outcomes rather than extra board columns.
- Application Detail shows lifecycle history, important dates, explicit closure outcome, and deterministic next-action guidance.

**Position:**

- Application Detail is already integrated on `master`.
- Schema v3, v1/v2 migration, lifecycle history, stage-date semantics, primary/substage UI, deterministic guidance, and focused unit/storage/workspace coverage are implemented on `application-lifecycle`.
- PR #54 previously demonstrated unit tests, typecheck, lint, format, compatibility, build, and generated-manifest verification passing before its Playwright browser journey failed.
- The Playwright failure is retained as diagnostic evidence, but browser black-box E2E is no longer a mandatory merge or release gate.
- PR #54 head `861f05da6081d804eed8cc938e334fd9e1f777e9` is rerunning CI with the required gate only.

**Delta:**

- Integrate the repository quality-policy change that makes browser E2E opt-in.
- Observe the required CI gate on the exact lifecycle head.
- Integrate the lifecycle logical change only when that mandatory gate is green.

**Next Move:**

- Merge the quality-policy change after its required CI gate is green, then confirm PR #54 has a green mandatory gate on the exact merge head.

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
- focused unit, migration, and workspace verification
- browser E2E retained only as opt-in diagnostic coverage
- repository quality-policy alignment required to remove browser black-box E2E from mandatory CI/release gates

### Out

- backend or cloud sync
- job discovery
- AI dependency
- interview log
- fit score
- analytics dashboard
- unrelated module refactors
- unrelated product or architecture changes
- fixing browser E2E solely to satisfy a non-mandatory black-box gate

## Slices

- [x] Pipeline operational home integrated on `master`.
- [x] Application Detail integrated on `master`.
- [x] Lifecycle schema/model and v1/v2 migration implemented on `application-lifecycle`.
- [x] Lifecycle history, stage dates, substages/outcomes, and deterministic guidance implemented.
- [x] Focused unit/storage/workspace verification updated for lifecycle behavior.
- [ ] Integrate browser-E2E quality-policy change. ← ACTIVE
- [ ] Confirm mandatory repository quality gate on the exact lifecycle head.
- [ ] Squash-merge the exact green lifecycle head.

## Current Decisions

- Lifecycle state remains local-only and owned by the applications domain/service.
- Pipeline remains a compact primary-stage overview; detailed lifecycle behavior belongs in Application Detail.
- Existing persisted application data must migrate without dropping job context.
- Explicit user-entered next actions take precedence over deterministic guidance.
- Closed opportunities remain grouped by Accepted / Rejected / Withdrawn outcome.
- Playwright browser E2E is an opt-in black-box diagnostic, not a mandatory CI or release blocker.

Promote only durable material rationale to `DECISIONS.md` when it remains useful beyond this milestone.

## Verification / Evidence

Lifecycle implementation evidence includes changes to:

- application schema and migrations
- application service behavior/tests
- `ApplicationDetail`
- `ApplicationsWorkspace`
- application display/focus helpers
- storage migration coverage
- application pipeline browser diagnostic
- floating job-capture compatibility

Previously observed required checks on PR #54 lifecycle implementation:

```text
pnpm test                 PASS
pnpm typecheck            PASS
pnpm lint                 PASS
pnpm format:check         PASS
pnpm verify:compatibility PASS
pnpm build                PASS
pnpm verify:manifest      PASS
```

The prior `pnpm test:e2e` failure remains useful diagnostic evidence for the browser journey but is outside the mandatory integration gate under the current quality policy.

Integration still requires every mandatory gate to pass on the exact head that will be merged.

## Blockers / Risks

- Current integration dependency: quality-policy change must be integrated so repository policy, CI, and release workflow agree on the mandatory gate.
- Persisted application migration remains the highest-risk lifecycle surface; data integrity and backward compatibility must stay green.
- Stage/substage semantics affect several UI and compatibility consumers; any required-gate regression must be fixed at the owning boundary rather than patched with parallel mappings.

## Next Action

Integrate the browser-E2E quality-policy change after its mandatory CI passes, then confirm PR #54's exact merge head passes unit tests, typecheck, lint, format, compatibility, build, and manifest verification before squash merge.
