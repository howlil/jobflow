# Fillio Iteration State

This file is the single current-state tracker for Fillio.

## Current phase

- Iteration 15 is integrated on `master` at `9bb2080687ddb345f14805942758b8b74e834f68`.
- Post-Iteration-15 workspace/navigation refinements are integrated on `master` at `e7ab8d5b26442bdeee5fdb1942157e6e8e40ea7d`.
- No Iteration 16 is open. The next product iteration must start from a concrete user, compatibility, reliability, or release-readiness problem rather than speculative scope.
- Browser E2E remains outstanding before release readiness can be claimed.
- Chrome Web Store publishing and a tagged release remain explicit future release actions.

## Locked product boundaries

- Chromium desktop first.
- Local-first; no account/backend/cloud sync required for the current product.
- Deterministic behavior before AI.
- Never automatically click Apply, Submit, Next, or equivalent navigation controls.
- Stored documents may be attached only after an explicit user action on the specific detected file field.
- Automatic file attachment remains forbidden.
- Generic form engine first; ATS adapters require a reproducible generic-engine failure.
- Sensitive values remain behind the encrypted vault and explicit site-specific disclosure/fill approval.
- Host-page DOM/text is untrusted input.
- No career/profile/form-data telemetry.
- Persisted schemas remain versioned and validated.

## Integrated product state through Iteration 15

Delivered:

- canonical versioned career profile and application variants
- local profile persistence and responsive career workspace
- deterministic generic form analysis and safe autofill
- Ready / Review / Unknown / Sensitive planning
- correction memory and dynamic-form re-analysis
- encrypted Sensitive Data Vault with explicit disclosure approval
- deterministic job-context and variant recommendation
- document field-intent classification and recommendation
- local PDF/DOCX/TXT CV extraction with review-before-import
- document binaries stored locally in extension-owned IndexedDB
- explicit user-triggered native file attachment
- local backup/recovery and compatibility evidence tooling
- career workspace opened as a normal browser tab
- compact right-edge launcher with fixed right slide panel on application pages
- compact monochrome utility-first visual system
- non-linear workspace section navigation with a desktop left rail and mobile section selector
- profile state preserved across workspace section changes
- explicit workspace opening through the extension background runtime

## Iteration 15 — Surface refactor

Status: completed and integrated.

Integrated behavior:

- career workspace opens as a normal full browser tab rather than a constrained embedded options dialog
- collapsed assistant is docked to the right viewport edge
- expanded assistant is a fixed top-to-bottom right slide panel over the current job page
- workspace removes duplicated marketing hierarchy
- visual system is compact, monochrome, utility-first, and uses fewer pills/cards
- existing fill, document, correction, and sensitive-data safety boundaries remain unchanged

Fast deterministic merge gates were observed as passed for the Iteration 15 merge:

```text
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm verify:compatibility
pnpm build
pnpm verify:manifest
```

Browser E2E was explicitly deferred/non-blocking for the development merge and remains required before release readiness is claimed.

## Post-Iteration-15 refinement

Status: integrated on `master`.

The workspace was refined without opening a new product iteration:

- continuous-page anchor navigation was replaced with non-linear section navigation
- desktop uses a sticky left navigation rail
- mobile uses a compact section selector
- one workspace category is visible at a time without wizard semantics
- unsaved profile state remains mounted across category changes
- document, correction, and backup surfaces render only in their relevant workspace sections
- popup/content-script workspace actions open the workspace through the background runtime
- visual acceptance/E2E fixtures were adjusted to the current surface model

These changes are refinements of the Iteration 15 surface model, not evidence of a separate Iteration 16.

## Release-readiness gap

Do not describe the product as release-ready until current browser E2E is run successfully against the integrated `master` behavior and any failures are resolved.

Release-readiness evidence should include at minimum:

```text
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm verify:compatibility
pnpm build
pnpm verify:manifest
pnpm test:e2e
pnpm zip
```

A tagged release or Chrome Web Store publishing remains a separate explicit action after verification.

## Next-state rule

Prioritize real application use, browser E2E, recorded compatibility failures, and trusted-beta feedback before adding another feature iteration. Open Iteration 16 only when there is a concrete problem and explicit acceptance criteria. Do not add automatic submission, automatic attachment, backend sync, AI, or ATS-specific adapters without new evidence and an explicit scope decision.
