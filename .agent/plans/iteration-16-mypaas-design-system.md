# Iteration 16 — MyPaas design-system convergence

## Problem

The current Fillio workspace is functionally correct but visually under-uses wide screens, over-isolates the navigation rail, and does not yet have a consistent primitive grammar across surfaces. The user supplied the MyPaas frontend as the design reference and asked that Fillio adopt its product UI language, especially for the career-profile workspace.

## Goal

Adopt the transferable MyPaas design system without introducing a high-risk framework rewrite.

## Design source

Reference repository: `howlil/MyPaas`, especially:

- neutral application tokens from `frontend/src/app.css`
- dense 36–40px controls and restrained button variants
- flat 1px bordered surfaces with 6–8px radii
- shadow reserved for overlays rather than normal product chrome
- wide page-shell sizing with responsive horizontal gutters
- muted typography hierarchy and semantic color only for real status meaning

## Decisions

### Keep React/WXT for this iteration

Do not migrate Fillio from React to Svelte merely because MyPaas uses Svelte.

Reasons:

- Fillio already has React/WXT entrypoints, tests, messaging UI, and component contracts.
- A framework rewrite would touch most UI files while delivering almost no user-visible capability that cannot be delivered through tokens and primitives.
- Bundle/runtime weight is not the current measured bottleneck.
- WXT supports both frameworks, but changing framework is a migration project, not a visual refactor.

A Svelte migration requires separate evidence such as measured bundle/startup/runtime pressure or a maintainability problem that cannot be solved locally.

### Do not add Tailwind yet

MyPaas uses Tailwind, but the useful design rules are extracted into Fillio's existing CSS design-system layer first. Adding Tailwind now would require build-chain, dependency, lockfile, lint/format, and test changes while duplicating an existing token/primitive system.

Tailwind may be reconsidered separately if utility-class composition becomes a demonstrated maintenance problem.

## Implemented slice

- align Fillio neutral tokens with the MyPaas palette
- widen the workspace page shell and make gutters responsive
- convert the left navigation from a boxed card to integrated application chrome
- use compact, restrained active navigation treatment
- reduce heading/control scale to MyPaas-like production density
- turn readiness and editable sections into consistent flat bordered surfaces
- normalize fields, buttons, cards, dropzones, spacing, and focus behavior
- keep mobile/coarse-pointer accessibility behavior
- preserve all local-first, explicit-action, vault, document, and autofill safety boundaries

## Acceptance criteria

- career-profile workspace uses the MyPaas visual grammar on desktop and mobile
- wide-screen layout uses available width without creating a floating narrow island
- navigation reads as application chrome, not a detached card
- normal surfaces use 1px neutral borders and restrained 6–8px radii
- normal product chrome does not use decorative shadows or gradients
- controls remain keyboard-visible and coarse-pointer targets remain at least 44px
- no behavior, storage schema, permissions, autofill logic, vault logic, or document logic changes

## Verification

Required before merge:

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

Browser visual/E2E validation should compare the options workspace at desktop and mobile sizes before the iteration is marked complete.
