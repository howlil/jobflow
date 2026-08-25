# Fillio Iteration State

This file is the single current-state tracker for Fillio.

## Current phase

- Iteration 15 is integrated on `master` at `9bb2080687ddb345f14805942758b8b74e834f68`.
- Post-Iteration-15 workspace/navigation refinements are integrated on `master` at `e7ab8d5b26442bdeee5fdb1942157e6e8e40ea7d`.
- Iteration 16 — MyPaas design-system convergence is active on `feat/iteration-16-mypaas-design-system` through draft PR #10.
- The active slice refactors the options/career-profile surface into reusable React composition and migrates its visual layer to Tailwind using the concrete design grammar extracted from `howlil/MyPaas`.
- React/WXT remains the UI runtime. Svelte migration is not part of Iteration 16.
- Tailwind is now an explicit Iteration 16 implementation decision following the user's scope change; the previous CSS token/primitive workspace layer is being retired rather than maintained in parallel.
- CI and browser visual/E2E verification remain required before Iteration 16 is marked complete or merged.
- Chrome Web Store publishing and a tagged release remain separate future release actions.

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

Status: active; implementation and verification in progress.

Problem being solved:

- the current career workspace under-uses wide screens
- the navigation rail reads as a detached card instead of application chrome
- options/profile markup and visual concerns are too coupled to large CSS files
- spacing, surfaces, controls, and hierarchy need one reusable production UI grammar
- the supplied MyPaas frontend provides a concrete reference for a denser, flatter production UI

Implemented on the active branch so far:

- MyPaas-derived Tailwind theme: `#fafafa` app background, white surfaces, `#f7f7f7` muted surfaces, `#e5e5e5` borders, `#171717` primary ink, restrained semantic colors
- 6–8px surface/control radii, neutral 1px borders, and elevation reserved for overlays
- responsive wide page shell and compact gutters
- reusable React `WorkspaceFrame` for options application chrome
- reusable responsive React `WorkspaceNavigation` with desktop rail and mobile selector
- options workspace composed from React surfaces rather than repeated top-level HTML structure
- Tailwind source-of-truth in `src/ui/design-system/tailwind.css` plus direct utility classes in reusable React shell/navigation components
- legacy options/profile token, primitive, compact, and MyPaas-adaptation CSS layers retired to prevent two styling systems from drifting
- existing ProfilePage behavior preserved while its compatibility CSS import is reduced to a no-op shim; further section extraction can happen incrementally without another visual system
- coarse-pointer 44px target preservation and visible keyboard focus behavior
- no storage, permission, autofill, vault, messaging, document, or security behavior changes

Framework decision:

- keep React/WXT
- options HTML remains only the browser-extension mount document; the application surface is React
- do not rewrite the component tree to Svelte for stylistic reasons

Styling decision:

- Tailwind is the canonical styling system for the options/profile workspace in Iteration 16
- do not maintain a second token/primitive CSS implementation for the same workspace
- popup CSS and content-script Shadow-DOM injected styles are separate extension surfaces; migrate them only with surface-specific verification because global Tailwind utilities do not automatically cross Shadow DOM boundaries

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

Do not describe the product as release-ready until current browser E2E is run successfully against the integrated behavior and any failures are resolved.

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

Finish Iteration 16 CI, browser visual validation, and integration before opening another UI refactor. After integration, prioritize real application use, compatibility failures, and trusted-beta feedback. Do not add automatic submission, automatic attachment, backend sync, AI, ATS-specific adapters, or a framework rewrite without concrete evidence and an explicit scope decision.
