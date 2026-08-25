# Fillio Iteration State

This file is the single current-state tracker for Fillio.

## Current phase

- Iteration 15 is integrated on `master` at `9bb2080687ddb345f14805942758b8b74e834f68`.
- Post-Iteration-15 workspace/navigation refinements are integrated on `master` at `e7ab8d5b26442bdeee5fdb1942157e6e8e40ea7d`.
- Iteration 16 — MyPaas design-system convergence is active on `feat/iteration-16-mypaas-design-system` through draft PR #10.
- The active slice refactors the options/career-profile surface into reusable React composition and migrates document-level React surfaces to Tailwind using the concrete design grammar extracted from `howlil/MyPaas`.
- React/WXT remains the UI runtime. Svelte migration is not part of Iteration 16.
- Tailwind is the canonical document-level styling system for options/profile and popup surfaces. The previous token/primitive/profile/popup CSS stack is retired rather than maintained in parallel.
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
- `options.html` reduced to the browser-extension mount document; the workspace is composed in React
- popup surface migrated from standalone CSS to React + Tailwind utilities using the same MyPaas-derived theme
- Tailwind source of truth in `tailwind.config.ts` and `src/ui/design-system/tailwind.css`
- legacy `tokens.css`, `primitives.css`, `profile-compact.css`, `popup.css`, and temporary MyPaas adaptation CSS removed
- existing `ProfilePage` behavior preserved while its legacy stylesheet is reduced to a no-op compatibility shim; visual styling comes from Tailwind component rules
- coarse-pointer 44px target preservation and visible keyboard focus behavior
- no storage, permission, autofill, vault, messaging, document, or security behavior changes

Framework decision:

- keep React/WXT
- options HTML remains only the browser-extension mount document; the application surface is React
- reusable composition is preferred over a framework rewrite
- do not rewrite the component tree to Svelte without measured runtime, bundle, or maintenance evidence

Styling decision:

- Tailwind is canonical for document-level React surfaces in this iteration
- do not recreate a parallel token/primitive CSS implementation
- content-script assistant remains a special case because it is mounted inside Shadow DOM; document-level Tailwind output does not cross that boundary automatically. Its injected style bundle must remain isolated unless migrated through a Shadow-DOM-specific Tailwind delivery mechanism and verified independently.

Verification evidence observed during the active engineering loop:

- frozen-lockfile installation succeeds after Tailwind lockfile synchronization
- 41 test files / 189 tests passed on the popup-Tailwind branch state
- TypeScript passed on the same observed run
- ESLint passed on the same observed run
- the next observed blocker was formatting of the migrated popup file; Prettier was then applied automatically and the temporary formatting workflow removed
- the latest post-format branch head still requires a complete CI run before build, manifest, browser smoke, or package success is claimed

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

Browser visual/E2E validation must also inspect the current options workspace and popup on desktop/mobile where applicable before the iteration is marked complete.

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
