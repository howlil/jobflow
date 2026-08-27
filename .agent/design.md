# Visual Design Router

The visual source of truth is [`/DESIGN.md`](../DESIGN.md). Use it for layout, typography, spacing, color, responsive behavior, interaction states, floating-assistant interaction, CV import UX, and component appearance.

Runtime/software architecture lives in [`system-design.md`](./system-design.md).

Maintain **one canonical styling system per UI surface**. When a styling system is replaced, migrate callers and remove the superseded CSS/tokens/shims in the same logical change rather than keeping parallel implementations.

For React extension surfaces, map approved design decisions into `tailwind.config.ts`, `src/ui/design-system/tailwind.css`, and reusable React primitives/components. Do not recreate the retired `tokens.css` / `primitives.css` stack or introduce feature-local design tokens.

The content-script assistant is rendered in Shadow DOM. Its styles require a surface-specific bundle/injection strategy; do not assume document-level Tailwind CSS crosses the shadow boundary.
