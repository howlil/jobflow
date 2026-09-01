---
name: frontend-extension-ui
description: Use when building or changing Jobflow popup, full-tab workspace, floating in-page controls, form editing UX, accessibility, or React component/state boundaries.
---

# Frontend Extension UI

## Core principle

Keep UI thin: render application state, collect user intent, and delegate policy. UI must not become the owner of persistence, matching, or cryptography.

## Surfaces

- Full-tab workspace: profile, documents, pipeline/detail, variants/preferences, vault, corrections, backup/recovery.
- Popup: compact browser-action entry surface.
- In-page assistant: page-local action/review surface in Shadow DOM.

## Implementation pattern

```text
user task
 -> identify affected surface(s)
 -> inspect existing primitive and visual grammar
 -> reuse current owner when it fits
 -> introduce a shared primitive only for a repeated stable concept
 -> implement domain composition locally
 -> migrate affected duplicate callers when replacement is intentional
 -> remove superseded styling/path
 -> verify affected widths/states
```

## Ownership

- `src/components/ui/*`: repeated low-level controls and surface primitives.
- `src/components/layout/*`: reusable shell and section layout.
- `src/components/<domain>/*`: product wording, data shape, interaction flow, local composition.
- Shadow-DOM assistant: isolated styling boundary using the same semantic design grammar without depending on document-level CSS.

Do not create generic layout wrappers solely to hide Tailwind utilities.

## State

Start with local React state and focused hooks. Persisted state belongs in repository/application owners. Do not add a global UI store or generic form framework without current demonstrated need.

Do not mirror the canonical profile into multiple independent writable stores.

## Autofill states

Present semantic states:

- Ready
- Needs review
- Unknown
- Sensitive

Do not expose raw matcher scores as probabilities and do not communicate state by color alone.

## Sensitive UX

For disclosure, show the current origin and sensitive category/field context, then require explicit fill/skip action. Do not keep sensitive values visible longer than necessary. Vault reset requires explicit destructive confirmation.

## Component boundary

A React component must not directly own:

- `chrome.storage`
- `crypto.subtle`
- matcher policy
- DOM scanner/filler logic

Delegate through application hooks/services/adapters.

## Accessibility

- keyboard-reachable controls
- visible focus
- semantic labels/buttons
- meaningful accessible names for icon-only controls
- no color-only status
- no unexpected focus capture
- Escape closes relevant overlays

## Visual verification

Use `.agents/DESIGN.md` as authority. Verify only representative surfaces/widths affected by the change; do not claim cross-surface consistency after checking only one mount point.

## Common mistakes

- giant React components that contain domain rules
- premature global state
- duplicated popup/workspace primitive styling
- host-page CSS controlling the in-page assistant
- raw numeric confidence UI
- feature-local design tokens
- positional selectors used to infer semantic form layout
- duplicate native/file controls when an owned primitive already exists