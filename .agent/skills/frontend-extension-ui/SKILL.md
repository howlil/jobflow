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

## Common mistakes

- giant `App.tsx` containing domain rules
- global state added before it is needed
- duplicate base profile state per variant
- floating UI styled by host-page CSS
- showing fake numeric confidence percentages
- asking for every possible profile field during first-run
