# Fillio Iteration State

This file is the single current-state tracker for Fillio.

## Current phase

- Iteration 15 is integrated on `master` at `9bb2080687ddb345f14805942758b8b74e834f68`.
- Post-Iteration-15 workspace/navigation refinements are integrated on `master` at `e7ab8d5b26442bdeee5fdb1942157e6e8e40ea7d`.
- Iteration 16 — MyPaas design-system convergence is active on `feat/iteration-16-mypaas-design-system`.
- The active slice aligns Fillio's tokens and career-workspace visual grammar with `howlil/MyPaas` without changing runtime behavior or safety boundaries.
- React/WXT remains the UI runtime for Iteration 16. Svelte migration is explicitly not part of this iteration because no measured runtime, bundle, or maintainability problem currently justifies a framework rewrite.
- Tailwind is also deferred for this iteration. The transferable MyPaas design rules are being extracted into Fillio's existing token/primitive CSS layer first; Tailwind requires separate evidence that utility composition would materially improve maintainability.
- Browser visual/E2E verification is required before Iteration 16 is marked complete.
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

## Iteration 16 — MyPaas design-system convergence

Status: active.

Problem being solved:

- the current career workspace under-uses wide screens
- the navigation rail reads as a detached card instead of application chrome
- spacing, surfaces, controls, and hierarchy are not yet driven by one consistent primitive grammar
- the supplied MyPaas frontend provides a concrete visual reference for a denser, flatter production UI

Implemented on the active branch so far:

- MyPaas-derived neutral palette: `#fafafa` background, white surfaces, neutral-200 borders, neutral-900 ink
- 6–8px surface/control radii and restrained elevation
- responsive wide page shell with compact gutters
- integrated left navigation rail with flat active-state treatment
- denser typography, buttons, fields, readiness surface, editable sections, record cards, and document dropzones
- coarse-pointer 44px target preservation and visible keyboard focus behavior
- no storage, permission, autofill, vault, messaging, document, or security behavior changes

Framework decision:

- keep React/WXT for this iteration
- do not rewrite the component tree to Svelte for stylistic reasons
- reconsider Svelte only if measured bundle/startup/runtime cost or component-maintenance evidence establishes a concrete problem

Styling-tool decision:

- do not add Tailwind in the same change as the visual migration
- first converge tokens/primitives and prove the visual system
- reconsider Tailwind separately if repeated utility composition becomes a demonstrated maintenance cost

Required verification before completion:

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

Browser visual/E2E validation must also inspect the current options workspace on desktop and mobile before the iteration is marked complete.

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

Finish Iteration 16 visual verification and integration before opening another UI refactor. After integration, prioritize real application use, compatibility failures, and trusted-beta feedback. Do not add automatic submission, automatic attachment, backend sync, AI, ATS-specific adapters, Svelte, or Tailwind without concrete evidence and an explicit scope decision.
