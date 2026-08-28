# Job Flow UI Design System

The options/career workspace uses **React + Tailwind**.

## Source of truth

- `tailwind.config.ts` — design tokens and theme values.
- `src/ui/design-system/tailwind.css` — Tailwind directives, base rules, and a deliberately small set of stable shared primitives/form grammar.
- `src/ui/design-system/WorkspaceFrame.tsx` — reusable options dashboard shell: sidebar, topbar, and main content region.
- React components use Tailwind utilities directly for page layout, responsive composition, spacing, and component-local presentation.

`tailwind.css` is not a parallel BEM/component stylesheet. Do not add page-shell, navigation-layout, or feature-local classes there merely to hide utility strings behind `@apply`.

## Visual grammar

The workspace intentionally follows the production UI grammar extracted from `howlil/MyPaas`:

- neutral monochrome product chrome
- `#fafafa` app background, white surfaces, `#f7f7f7` muted surfaces
- `#e5e5e5` borders and `#171717` primary ink
- 6–8px radii
- flat surfaces and restrained elevation
- dense controls with visible keyboard focus
- 44px minimum target for coarse pointers
- responsive dashboard shell with a stable sidebar/topbar/main hierarchy
- semantic color only for actual status meaning

## Tailwind rules

- Prefer utilities in JSX/TSX for layout and one-off composition.
- Use `@layer components` only for a stable repeated primitive or form grammar shared by several call sites.
- Reuse React components before introducing another CSS abstraction.
- When a styling path is replaced, migrate callers and delete the superseded CSS/shim in the same logical change.
- Do not recreate the retired `tokens.css` / `primitives.css` stack or introduce feature-local design tokens.

Popup and content-script Shadow-DOM styling are separate surfaces and require surface-specific verification because document-level Tailwind utilities do not automatically cross Shadow DOM boundaries.
