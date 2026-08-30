---
name: frontend-extension-ui
description: Use when building or changing Job Flow popup, options/profile screens, floating in-page controls, form editing UX, accessibility, or React component/state boundaries.
---

# Frontend Extension UI

## Core principle

Keep the UI thin: render application state, collect user intent, and delegate policy. The UI may be visually polished, but it must not become the home for persistence, matching, or crypto logic.

## Surfaces

- Popup: current-page summary, variant choice, Fill/Review, vault state.
- Options/profile page: canonical profile editing, variants, additional/sensitive sections.
- Floating UI: small page-local action/status surface only.

Do not audit or change only `options.html`. A UI change must identify every affected product surface and its styling/runtime boundary.

## UI implementation workflow

For a bounded UI change:

```text
user task
  -> identify affected surfaces
  -> inspect existing primitive and visual grammar
  -> reuse the existing primitive when it owns the concept
  -> if no owner exists, ask whether the concept is repeated + stable
       -> yes: introduce the smallest reusable primitive
       -> no: keep the composition local
  -> define spacing and responsive behavior explicitly
  -> implement the feature/surface change
  -> migrate affected duplicate callers in the same logical change
  -> remove superseded styling when safe
  -> verify representative widths and interaction states
  -> run behavior/quality gates
  -> stop
```

Prefer semantic ownership over selector reuse. Do not reuse a class named for another feature merely because it currently looks similar.

## Primitive boundary

Shared workspace/popup primitives live in `src/components/ui/*`. Reusable shell and section layout lives in `src/components/layout/*`.

Prefer shared primitives for repeated concepts such as:

- buttons and icon actions
- labeled text/select/textarea/checkbox fields
- file selection
- field grids
- section headers/subsections
- action rows
- status, chips, and empty states

Keep local layout in feature components. Do not create generic `Box`, `Flex`, `Grid`, `Stack`, or `Card` wrappers solely to hide Tailwind utilities.

The in-page assistant is a Shadow-DOM runtime boundary. It follows the same semantic design grammar but keeps surface-local CSS/primitives so host styles cannot interfere.

## Spacing and layout

Use the 4px design grid. Prefer the established relationship rhythm rather than arbitrary gaps:

- label to control: 8px
- field to field: 16px
- inline actions: 8px
- record internal groups: 16px
- subsection separation: 24px
- major surface separation: 32px

Field grids must be chosen from information relationships, not DOM position. Do not use `:first-of-type` or similar selectors to infer that a form should have more columns. Avoid accidental trailing empty cells by choosing the correct grid or explicit field span.

## State

Start with React local state and focused hooks. Persisted state belongs in repositories. Do not add Redux/Zustand or a generic form framework until current complexity demonstrates the need.

Do not mirror the entire profile in multiple independent stores.

## Progressive disclosure

Prioritize frequently used sections first:

```text
Basic
Contact
Experience
Education
Skills
Links
Job Preferences
```

Keep uncommon/sensitive data in explicit additional sections. Complete schema does not mean one giant onboarding form.

Do not add a second disclosure control inside an already selected primary workspace category unless the contained object itself benefits from collapse/expand behavior.

## Floating UI

Prefer an isolated mount/shadow root so host CSS cannot break Job Flow. Keep it compact until the user opens Review. Do not cover application controls or steal focus unexpectedly.

## Autofill states

Present semantic states, not raw matcher scores:

- Ready
- Needs review
- Unknown
- Sensitive

Never communicate state by color alone. A Review flow must let the user accept, remap, or skip.

## Sensitive UX

When disclosure is requested, show:

- current site/origin
- sensitive categories/fields about to be filled
- clear Fill/Skip action

Do not display sensitive values longer than necessary. Vault reset requires explicit destructive confirmation.

## Component rule

A component should not directly call:

- `chrome.storage`
- `crypto.subtle`
- matcher rules
- DOM scanner/filler logic

Use a feature/application hook or adapter instead.

## Accessibility

- keyboard reachable controls
- visible focus
- semantic buttons/labels
- no color-only status
- no unexpected focus capture
- meaningful accessible names for icon buttons
- native semantic controls may remain native when the product design explicitly calls for them

## Visual verification

Check representative surfaces that are affected by the change:

- workspace at 1440px
- workspace at 1024px
- workspace at 390px
- popup
- collapsed launcher
- expanded assistant desktop
- expanded assistant narrow viewport

Do not run every visual width as ritual when the changed surface cannot affect it, but do not claim cross-surface consistency after checking only one mount point.

## Common mistakes

- giant `App.tsx` containing domain rules
- global state added before it is needed
- duplicate base profile state per variant
- floating UI styled by host-page CSS
- showing fake numeric confidence percentages
- asking for every possible profile field during first-run
- duplicated popup/workspace button or field class strings
- positional form-grid selectors
- exposed native file controls when a styled file-selection primitive already exists
- semantic CSS leaks such as using a readiness-list class for unrelated data
