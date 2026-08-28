# Job Flow UI Design System

The options/career-profile workspace uses **React + Tailwind**.

## Source of truth

- `tailwind.config.ts` — MyPaas-derived design tokens and theme values.
- `src/ui/design-system/tailwind.css` — base rules and reusable component grammar.
- `src/ui/design-system/WorkspaceFrame.tsx` — reusable options application shell.
- React components may use Tailwind utilities directly when the composition is local to that component.

## Visual grammar

The workspace intentionally follows the production UI grammar extracted from `howlil/MyPaas`:

- neutral monochrome product chrome
- `#fafafa` app background, white surfaces, `#f7f7f7` muted surfaces
- `#e5e5e5` borders and `#171717` primary ink
- 6–8px radii
- flat surfaces and restrained elevation
- dense controls with visible keyboard focus
- 44px minimum target for coarse pointers
- responsive wide page shell
- semantic color only for actual status meaning

Do not rebuild a parallel token/primitives CSS stack for the options workspace. Add or extend Tailwind theme/component rules instead.

Popup and content-script Shadow-DOM styling are separate surfaces and require surface-specific verification because global Tailwind utilities do not automatically cross Shadow DOM boundaries.
