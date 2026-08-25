# Fillio Iteration State

This file is the single current-state tracker for Fillio.

## Current phase

- Iteration 14 is integrated on `master` at `7aa8c613559326f63776c48fe75df198b3c083a5`.
- Iteration 15 surface refactor is implemented on `feat/iteration-15-surface-refactor` and is awaiting fast-gate verification/merge.
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

## Integrated product state through Iteration 14

Delivered:

- canonical versioned career profile and application variants
- local profile persistence and responsive profile workspace
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
- compact injected application assistant

## Iteration 15 — Surface refactor

Target state:

- career workspace opens as a normal full browser tab rather than a constrained embedded options dialog
- collapsed assistant is docked to the right viewport edge
- expanded assistant is a fixed top-to-bottom right slide panel over the current job page
- workspace removes duplicated marketing hierarchy
- visual system is compact, monochrome, utility-first, and uses fewer pills/cards
- existing fill, document, correction, and sensitive-data safety boundaries remain unchanged

## Verification policy for Iteration 15

Browser E2E is explicitly deferred/non-blocking for this development merge. Merge requires:

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

Browser E2E remains in the repository and is still required before release readiness is claimed.

## Next-state rule

Finish Iteration 15 verification and integration before adding another visual surface. After integration, prioritize real application use and recorded compatibility failures over speculative features. Do not add automatic submission, automatic attachment, backend sync, AI, or ATS-specific adapters without new evidence and an explicit scope decision.
