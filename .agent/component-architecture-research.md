# Component Architecture Research

This note records the frontend direction for the next design implementation pass. It is based on current repo inspection plus current public guidance from React, Atomic Design, Tailwind, WAI-ARIA APG, Radix UI, React Aria, Headless UI, and shadcn/ui.

## Research summary

The current problem is not only visual styling. The design-system shape needs to change from one large mixed `primitives.tsx` file into small owned UI components plus domain-level composed components.

Good frontend structure for Job Flow should use:

- design tokens as the base source of visual consistency
- small `components/ui/*` files for reusable controls
- `components/layout/*` for reusable shell and section layout
- `components/<domain>/*` for composed product components
- domain modules for product meaning, interaction flow, and data ownership
- headless accessible primitives for complex widgets where native controls look poor or behavior is hard to implement correctly

## Source findings

- React's component model starts by breaking UI into a component hierarchy and then deciding where state belongs. For Job Flow, this means visual controls should not own profile, vault, document, or application business state.
- Atomic Design is useful as a reminder to compose small pieces into larger UI, but the repo does not need formal atom/molecule/organism folders.
- Tailwind recommends extracting repeated styles into framework components when reuse crosses files. For this repo, repeated surfaces should be React components, while one-off domain layout can remain local Tailwind utilities.
- WAI-ARIA APG should guide non-native interaction patterns such as disclosure, dialog, menu button, combobox, tabs, popover, and listbox. Replacing native controls is acceptable only when the replacement preserves keyboard behavior, names, focus, and state.
- Radix UI, React Aria Components, and Headless UI all support the same strategic direction: use unstyled/headless behavior for accessible complex interactions, then style them with Job Flow's own tokens.
- shadcn/ui is useful as a reference architecture, not as a visual style to copy wholesale: keep component code owned in the repo, theme through Tailwind tokens, and use headless primitives underneath where they reduce accessibility risk.

## Recommended direction

Use a plain owned component structure:

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
  index.ts

src/components/layout
  workspace-frame
  workspace-section
  index.ts

src/components/profile
src/components/applications
src/components/documents
src/components/vault
src/components/corrections
src/components/floating
src/components/popup
```

`components/ui` is only for reusable low-level UI. If a component combines several UI pieces into a product concept, it belongs in `components/<domain>` or `components/layout`, not in `components/ui`.

## Native controls policy

Native controls are not automatically good enough. Use this decision rule:

```text
simple text/date/month/file input
  -> native behavior wrapped in Job Flow atom

select with short stable options
  -> native select wrapped in styled atom for now

combobox/autocomplete, searchable select, custom listbox, dialog, popover,
tabs, menu button, tooltip, drawer, modal, command-like picker
  -> use a headless accessible primitive or APG-conformant implementation
```

Avoid replacing date, month, and file inputs with custom controls unless there is a real UX failure. Those controls have important platform behavior and accessibility expectations.

## Dependency recommendation

Do not add a full opinionated component library. The best fit is:

1. Keep Tailwind and owned components as the visual layer.
2. Use `lucide-react` for icons.
3. Add a headless primitive library only for complex components.
4. Prefer a small proof of concept before committing to a dependency.

Candidate:

- `@radix-ui/react-*` for Dialog, Popover, Tooltip, Select/Listbox-like interactions, Tabs, and Disclosure-like primitives.

Alternative:

- React Aria Components if the app needs richer internationalized interactions, complex comboboxes, or advanced collection behavior.

Lower priority:

- Headless UI if the app wants a smaller Tailwind-oriented set, but verify React 19 and extension bundle behavior before adopting.

## What should change next

1. Split `primitives.tsx` into `src/components/ui/*`.
2. Move workspace shell and section components into `src/components/layout/*`.
3. Delete old compatibility exports after callers migrate.
4. Keep `WorkspaceNavigation` domain-owned unless it becomes generic.
5. Replace text-symbol UI with Lucide icons.
6. Polish `button`, `field`, `select`, `surface`, `record-card`, `status-message`, and `empty-state` before redesigning every form.
7. Add custom/headless Select or Combobox only after choosing Radix or React Aria through a small POC.
8. Convert domain modules gradually: profile records, CV import, pipeline, vault, corrections, popup, floating assistant.

## Sources

- React Thinking in React: https://react.dev/learn/thinking-in-react
- Atomic Design: https://atomicdesign.bradfrost.com/chapter-2/
- Tailwind styling with utility classes: https://tailwindcss.com/docs/styling-with-utility-classes
- Tailwind reusing styles: https://v3.tailwindcss.com/docs/reusing-styles
- WAI-ARIA APG patterns: https://www.w3.org/WAI/ARIA/apg/patterns/
- WAI-ARIA APG disclosure pattern: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
- Radix UI primitives: https://www.radix-ui.com/primitives
- React Aria Components: https://react-aria.adobe.com/
- Headless UI: https://headlessui.com/
- shadcn/ui: https://ui.shadcn.com/
