# Fillio Design System

The shared design system is intentionally small. `tokens.css` owns the visual
values used by Fillio UI, while `primitives.css` provides reusable states for
buttons, chips, status messages, section headings, and empty rows.

## Tokens

Use the `--fillio-*` custom properties instead of repeating shared values:

- Colors: `bg`, `surface`, `surface-subtle`, `text`, `muted`, `border`,
  `border-strong`, `focus`, `text-hover`, `danger`, `danger-bg`,
  `danger-hover`, `success`, `success-bg`, `warning`, and `warning-bg`
- Radius: `radius-sm`, `radius-md`, and `radius-lg`
- Shadow: `shadow-panel`
- Spacing: `space-1` through `space-8`

## Primitives

Apply `.fillio-button` to interactive buttons, then add one of
`.fillio-button-primary`, `.fillio-button-secondary`, or
`.fillio-button-danger` for the action hierarchy. Buttons keep a 40px minimum
height, support disabled styling, and expose a visible `:focus-visible` ring.

Use `.fillio-chip` for compact labels and add `.fillio-chip-strong` when the
label needs stronger emphasis. Use `.fillio-status` for inline feedback with
`.fillio-status-success` or `.fillio-status-danger` for semantic states.

Use `.fillio-section-heading` for a heading and adjacent action, and
`.fillio-empty-row` for compact empty modules. These classes are presentation
primitives only; product behavior and data access remain in their owning UI
components.
