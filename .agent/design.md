# Visual Design Guidance

The visual source of truth for Fillio is [`/DESIGN.md`](../DESIGN.md). Iteration 16 uses the restrained production UI grammar extracted from `howlil/MyPaas` as the concrete implementation reference.

Use `DESIGN.md` for layout, typography, color, spacing, responsive behavior, floating-assistant interaction, CV import UX, and component appearance. Software/runtime architecture remains in [`system-design.md`](./system-design.md).

For React extension surfaces, map approved design decisions into `tailwind.config.ts`, `src/ui/design-system/tailwind.css`, and reusable React primitives/components. Do not recreate the retired `tokens.css` / `primitives.css` stack or introduce feature-local design tokens.

The content-script assistant is rendered in Shadow DOM. Its styles require a surface-specific bundle/injection strategy; do not assume document-level Tailwind CSS crosses the shadow boundary.
