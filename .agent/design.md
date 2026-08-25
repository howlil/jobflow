# Visual Design Router

The visual source of truth is [`/DESIGN.md`](../DESIGN.md). Use it for layout, typography, spacing, color, responsive behavior, interaction states, and component appearance.

Runtime/software architecture lives in [`system-design.md`](./system-design.md).

Maintain **one canonical styling system per UI surface**. When a styling system is replaced, migrate callers and remove the superseded CSS/tokens/shims in the same logical change rather than keeping parallel implementations.
