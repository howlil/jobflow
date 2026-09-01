# Current Milestone

**Status:** Active — Rich Application Lifecycle is integration-ready on top of the cleaned repository baseline.

**Goal:** Rich Application Lifecycle

**Why:** Keep Pipeline simple as the operational overview while Application Detail represents the real opportunity lifecycle precisely enough to show current state, prior events, important dates, and the next useful action.

## Feature Compass

**Shape:**

- Primary lifecycle: Saved → Applying → Applied → Interview → Offer → Closed.
- Detailed states such as Assessment, Technical interview, Accepted, Rejected, and Withdrawn are substages/outcomes rather than extra board columns.
- Application Detail shows lifecycle history, important dates, explicit closure outcome, and deterministic next-action guidance.

**Position:**

- Repository cleanup PR #56 is integrated on `master`.
- Popup simplification PR #57 is integrated on `master`.
- Lifecycle implementation exists in PR #54 and is being reapplied on top of the cleaned `master` baseline without restoring removed CI/process ceremony.

**Delta:**

- Verify the lifecycle implementation against the current cleaned `master`.
- Integrate the exact green lifecycle head.
- Close this milestone before activating another product milestone.

**Next Move:**

- Run the mandatory repository gate on the clean lifecycle integration head, merge it when green, then close Rich Application Lifecycle.

## Scope

### In

- primary lifecycle state model
- substages / terminal outcomes
- schema v3 with explicit v1/v2 migration
- lifecycle history and stage dates
- deterministic next-action guidance
- Pipeline/Application Detail lifecycle presentation
- focused lifecycle verification

### Out

- backend or cloud sync
- job discovery
- AI dependency
- interview log
- fit score
- analytics dashboard
- unrelated architecture refactors
- deleting supported persistence migrations
- reintroducing removed CI/process ceremony

## Slices

- [x] Pipeline operational home integrated on `master`.
- [x] Application Detail integrated on `master`.
- [x] Lifecycle schema/model and v1/v2 migration implemented.
- [x] Lifecycle history, stage dates, substages/outcomes, and deterministic guidance implemented.
- [x] Focused lifecycle verification implemented.
- [x] Lean repository cleanup integrated.
- [x] Popup product ceremony cleanup integrated.
- [ ] Verify lifecycle on current cleaned `master`. ← ACTIVE
- [ ] Integrate exact green lifecycle head.
- [ ] Close Rich Application Lifecycle milestone.

## Current Decisions

- Lifecycle state remains local-only and owned by the applications domain/service.
- Pipeline remains a compact primary-stage overview; detailed lifecycle behavior belongs in Application Detail.
- Existing persisted application data must migrate without dropping job context.
- Explicit user-entered next actions take precedence over deterministic guidance.
- Closed opportunities remain grouped by Accepted / Rejected / Withdrawn outcome.
- Playwright browser E2E is an opt-in diagnostic, not a mandatory CI/release blocker.
- Mandatory repository gates are direct executable checks; metadata/status bookkeeping is not treated as runtime verification.
- Popup remains a compact current-page entry surface; lifecycle changes must not restore its removed dashboard ceremony.

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

- Persisted application migration remains the highest-risk lifecycle surface and must remain supported; migration code is not cleanup debt.
- Lifecycle integration must preserve the cleaned CI/release policy and compact popup behavior already on `master`.

## Next Action

Verify the clean lifecycle integration head against current `master`, merge it when the required gate is green, then close Rich Application Lifecycle before planning the next milestone.
