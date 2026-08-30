# Design Cleanup Plan

Goal: make the UI follow `DESIGN.md` with a cleaner component structure, consistent spacing, polished controls, Lucide icons, and no component dumping.

## Direction

Use a simple component split:

```text
src/components/ui
  button
  icon-button
  field
  select
  checkbox
  chip
  status-message
  surface
  record-card
  empty-state

src/components/layout
  workspace-frame
  workspace-section

src/components/profile
src/components/applications
src/components/documents
src/components/vault
src/components/corrections
src/components/floating
src/components/popup
```

Rules:

- `components/ui` is only for small reusable UI building blocks.
- Combined components live at component/domain level, not inside `ui`.
- Domain components own product wording, data shape, and interaction flow.
- UI components own size, spacing, visual states, focus, icons, and accessibility.
- Delete obsolete compatibility paths once callers are migrated.

## Work plan

1. Create `src/components/ui` and move the current shared primitives into small files.
2. Move workspace shell/section components into `src/components/layout`.
3. Delete the old compatibility folder after callers move.
4. Improve base UI quality: button, select, field, surface, record card, empty state, status, and icon button.
5. Convert each domain screen to reuse those components: profile, documents, applications, vault, corrections, popup, floating assistant.
6. Add headless/custom controls only where native controls look or behave poorly.
7. Run typecheck, lint, focused tests, build, and browser visual checks before calling it release-ready.

## First implementation slice

Do this first:

1. Split `primitives.tsx` into `components/ui/*`.
2. Add `components/ui/index.ts`.
3. Add `components/layout/*`.
4. Migrate callers to the new component paths.
5. Delete the old design-system compatibility files.
6. Run `pnpm typecheck`, focused UI tests, `pnpm lint`, and `pnpm build`.
