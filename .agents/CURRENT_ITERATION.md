# Current Iteration

**Status:** Idle — no product milestone is currently active.

## Current Product Position

The last completed milestone was **Unified Job Application Workflow**. Jobflow now exposes two coherent user-facing product surfaces instead of three overlapping ones:

- **In-page Assistant** owns current-application execution: page analysis, Application Profile recommendation/selection, explicit fill, unresolved review, document attachment, sensitive disclosure, and application capture.
- **Workspace** owns Pipeline, career/profile data, documents, Application Profiles, preferences, Privacy & Sensitive Data, Autofill Memory, and Backup & Recovery.
- The browser toolbar action is a context-aware launcher: it opens the Assistant when the active page has supported application fields and otherwise opens Workspace. The separate browser-action popup surface and its legacy ownership have been removed.

The milestone preserved existing trust and architecture boundaries: no automatic Submit/Next, no automatic document attachment, no persisted profile/application schema migration, no ATS-specific runtime branch, and no backend/cloud/AI/telemetry dependency.

## Verification Evidence

The release-ready PR gate passed the repository's required deterministic checks, including behavior tests, typecheck, lint, format check, production build, and generated-manifest verification. The extension smoke journey was updated to cover popup-free assistant launching and preserve explicit-fill/no-submit assertions for targeted browser diagnostics.

Detailed completed work and verification history live in Git/PR records rather than this file.

## Active Milestone

None.

There is no authorized product outcome, vertical slice, or logical change currently in progress.

## Next Move

When the user requests the next product/engineering direction:

1. inspect the current product gap against `.agents/PROJECT.md`, architecture/security boundaries, and actual code state;
2. shape one bounded high-value core milestone with a meaningful complete outcome rather than a collection of micro-slices or nice-to-have polish;
3. define demonstrable vertical slices only where they help execute the complete outcome;
4. once authorized, execute those slices continuously until the milestone outcome is release-ready, unless a material stop condition is reached;
5. use accumulated proportional verification evidence at the milestone gate instead of restarting a full verification ceremony after every small change.

Do not reactivate historical sprint plans or infer new product scope from completed work.

## State Discipline

While work is active, keep this file limited to:

- milestone outcome and boundaries
- current vertical slice/logical change
- material blockers or unresolved decisions
- verification evidence that still matters to the active outcome
- the single next meaningful action

Remove completed slice detail once it no longer helps execute the active milestone. Durable history belongs in Git; durable material decisions belong in `.agents/DECISIONS.md`.
