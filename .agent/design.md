# Visual Design Router

The visual source of truth is [`/DESIGN.md`](../DESIGN.md). Use it for layout, typography, spacing, color, responsive behavior, interaction states, floating-assistant interaction, CV import UX, and component appearance.

Runtime/software architecture lives in [`system-design.md`](./system-design.md).

Maintain **one canonical styling system per UI surface**. When a styling system is replaced, migrate callers and remove the superseded CSS/tokens/shims in the same logical change rather than keeping parallel implementations.

For React extension surfaces:

- define shared theme values in `tailwind.config.ts`
- keep `src/ui/design-system/tailwind.css` limited to Tailwind directives, base rules, and stable repeated primitives/form grammar
- compose page shells, navigation, spacing, and responsive layout with Tailwind utilities in React components
- prefer reusable React components over hiding one-off layout behind new `@apply` classes

Do not recreate the retired `tokens.css` / `primitives.css` stack or introduce feature-local design tokens.

The content-script assistant is rendered in Shadow DOM. Its styles require a surface-specific bundle/injection strategy; do not assume document-level Tailwind CSS crosses the shadow boundary.
