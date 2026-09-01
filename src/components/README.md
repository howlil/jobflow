# Job Flow UI Design System

The options/career workspace and popup use **React + Tailwind**. The in-page assistant keeps an isolated Shadow-DOM stylesheet while following the same semantic visual grammar.

## Source of truth

- `.agents/DESIGN.md` — canonical visual and interaction authority.
- `tailwind.config.ts` — runtime design tokens and theme values.
- `src/components/ui/*` — stable repeated React primitives for controls, fields, status, spacing, surfaces, records, and file selection.
- `src/components/layout/*` — reusable workspace shell and section layout components.
- `src/components/ui/tailwind.css` — Tailwind directives, base rules, and compatibility grammar for call sites that have not yet moved to React primitives.
- React feature components use Tailwind utilities directly for local layout, responsive composition, and feature-specific presentation.

Do not add a parallel BEM/component stylesheet merely to hide utility strings behind `@apply`. Prefer a React primitive when the interface concept is stable and repeated across surfaces. Add new low-level UI to `src/components/ui`; add composed domain UI to `src/components/<domain>` or the existing domain module, not to `ui`.

## Reuse rule

For new or changed UI:

```text
existing primitive?
  yes -> reuse it
  no  -> is the concept repeated and stable?
           yes -> add the smallest primitive
           no  -> keep the composition local
```

Current stable primitives cover:

- Button / IconButton
- FieldFrame / TextField / TextareaField / SelectField / CheckboxField
- FilePicker
- FieldGrid
- Section / SectionHeader / Subsection
- ActionRow
- Chip / StatusMessage / EmptyState

Do not create generic `Box`, `Flex`, `Grid`, `Stack`, or `Card` wrappers just to avoid Tailwind utilities.

## Visual grammar

- neutral glass product chrome
- `#fafafa` app background, white/glass surfaces, `#f7f7f7` muted surfaces
- `#e5e5e5` borders and `#171717` primary ink
- 6–8px radii
- compact surfaces, soft shadows, and restrained elevation
- dense controls with visible keyboard focus
- 44px minimum target for coarse pointers
- responsive dashboard shell with a stable sidebar/topbar/main hierarchy
- semantic color only for actual status meaning
- `lucide-react` for interface icons

## Spacing rhythm

Use the canonical 4px grid and prefer a small relationship vocabulary:

```text
label -> control          8px
field -> field           16px
inline actions            8px
record internal groups   16px
subsection -> subsection 24px
major surface groups     32px
```

Do not introduce 14px/18px layout gaps when an existing 4px-grid step expresses the relationship.

For the current `.agents/DESIGN.md` direction, use:

```text
section gap       16px compact default, 24px for major separation
record/list gap   12-16px
toolbar gap       8px
popover padding   12px
modal padding     16-20px
```

## Field layout

Field grids are semantic, not positional. Choose two or three columns based on the actual information group and use explicit spans when necessary. Do not style `first-of-type` forms differently or rely on DOM position to infer layout.

Long text, summaries, descriptions, and controls with strongly related context should span the useful width. Do not stretch the final short field merely to hide an otherwise valid empty grid cell.

## Tailwind rules

- Prefer reusable React primitives for stable repeated interface concepts.
- Prefer utilities in JSX/TSX for local layout and one-off composition.
- Use `@layer components` only for compatibility grammar or a stable CSS-only runtime boundary.
- When a styling path is replaced, migrate affected callers and delete the superseded shim in the same logical change when safe.
- Do not recreate the retired `tokens.css` / `primitives.css` stack or introduce feature-local design tokens.

Popup shares these React primitives because it already loads the same Tailwind bundle. Content-script Shadow-DOM styling remains separate because document-level Tailwind utilities do not cross the runtime boundary.
