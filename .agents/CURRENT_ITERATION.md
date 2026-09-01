# Current Milestone

**Status:** Active — Rich Application Lifecycle implementation is complete. Before lifecycle integration and the next product milestone, an explicitly authorized repository-cleanup logical change is removing verification/process ceremony that does not provide proportional evidence.

**Goal:** Rich Application Lifecycle

**Why:** Keep Pipeline simple as the operational overview while Application Detail represents the real opportunity lifecycle precisely enough to show current state, prior events, important dates, and the next useful action.

## Feature Compass

**Shape:**

- Primary lifecycle: Saved → Applying → Applied → Interview → Offer → Closed.
- Detailed states such as Assessment, Technical interview, Accepted, Rejected, and Withdrawn are substages/outcomes rather than extra board columns.
- Application Detail shows lifecycle history, important dates, explicit closure outcome, and deterministic next-action guidance.

**Position:**

- Application Detail is integrated on `master`.
- Schema v3, v1/v2 migration, lifecycle history, stage-date semantics, primary/substage UI, deterministic guidance, and focused unit/storage/workspace coverage are implemented on `application-lifecycle`.
- PR #54 has already passed the lean mandatory CI gate after browser black-box E2E became opt-in.
- PR #56 now owns the independent pre-next-milestone cleanup: remove browser E2E from mandatory gates, remove synthetic compatibility-status gating, remove the custom affected-preflight wrapper, remove duplicate WXT preparation, and remove duplicate/stale documentation.

**Delta:**

- Finish the bounded repository-cleanup change and observe its mandatory CI gate on the exact head.
- Integrate the cleanup policy so `master`, release workflow, and canonical docs agree.
- Rebase/update lifecycle integration only if required by the cleanup merge, then integrate the exact green lifecycle head.

**Next Move:**

- Complete and verify PR #56 cleanup; integrate it before starting another product milestone.

## Scope

### In

Lifecycle milestone:
- primary lifecycle state model
- substages / terminal outcomes
- schema v3 with explicit v1/v2 migration
- lifecycle history and stage dates
- deterministic next-action guidance
- Pipeline/Application Detail lifecycle presentation
- focused lifecycle verification

Authorized cleanup before next milestone:
- browser E2E remains opt-in rather than mandatory
- remove custom affected-preflight orchestration
- remove metadata-only compatibility verification from CI/release gates
- keep compatibility validation risk-based and evidence-backed
- remove duplicate WXT preparation script
- remove stale/duplicate documentation whose authority already lives in `.agents/*`

### Out

- backend or cloud sync
- job discovery
- AI dependency
- interview log
- fit score
- analytics dashboard
- unrelated architecture refactors
- deleting supported persistence migrations
- deleting Playwright/E2E diagnostics entirely
- changing observable product UX as part of repository cleanup

## Slices

- [x] Pipeline operational home integrated on `master`.
- [x] Application Detail integrated on `master`.
- [x] Lifecycle schema/model and v1/v2 migration implemented.
- [x] Lifecycle history, stage dates, substages/outcomes, and deterministic guidance implemented.
- [x] Focused lifecycle verification implemented.
- [ ] Integrate lean quality/cleanup policy in PR #56. ← ACTIVE
- [ ] Integrate exact green lifecycle head from PR #54.
- [ ] Close Rich Application Lifecycle milestone and activate the next approved milestone.

## Current Decisions

- Lifecycle state remains local-only and owned by the applications domain/service.
- Pipeline remains a compact primary-stage overview; detailed lifecycle behavior belongs in Application Detail.
- Existing persisted application data must migrate without dropping job context.
- Explicit user-entered next actions take precedence over deterministic guidance.
- Closed opportunities remain grouped by Accepted / Rejected / Withdrawn outcome.
- Playwright browser E2E is an opt-in diagnostic, not a mandatory CI/release blocker.
- Mandatory repository gates are direct executable checks; metadata/status bookkeeping is not treated as runtime verification.

## Verification / Evidence

Mandatory integration gate:

```text
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm verify:manifest
```

Risk-specific evidence remains required when a change touches persistence, permissions, privacy/security, autofill compatibility, or browser-runtime behavior. Browser E2E and live compatibility validation are selective diagnostics rather than unconditional ceremony.

## Blockers / Risks

- PR #56 must pass the mandatory gate on its final exact cleanup head before integration.
- Persisted application migration remains the highest-risk lifecycle surface and must remain supported; migration code is not cleanup debt.
- Cleanup must not silently remove runtime behavior or widen product/architecture scope.

## Next Action

Finish the bounded cleanup in PR #56, observe the exact-head mandatory gate, integrate the cleanup, then integrate PR #54 before activating the next product milestone.
