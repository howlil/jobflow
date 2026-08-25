# Fillio Visual Design System

Reference direction: Superdesign `ai-builder-club` design system and the current AI Builder Club product surface.

This file is the visual source of truth for Fillio. `.agent/system-design.md` owns software architecture.

## Design principles

1. **Editorial before dashboard.** Prefer typography, whitespace, separators, and clear grouping over card soup.
2. **High-contrast, quiet surfaces.** Black/near-black text on white and warm-neutral backgrounds; use one electric blue-violet accent for focus/action only.
3. **Large hierarchy, compact controls.** Headings can be expressive; form controls remain dense and practical.
4. **One workspace, not a wizard.** Career data is edited on one continuous responsive page with sticky anchor navigation.
5. **Contextual extension UI.** On websites, Fillio defaults to a 48px launcher. Expanded UI appears only after explicit user interaction.
6. **Motion is functional.** Short opacity/transform transitions only; respect `prefers-reduced-motion`.
7. **No AI aesthetic noise.** No decorative gradients, glowing blobs, excessive pills, random glassmorphism, or repeated marketing copy.
8. **Accessible by default.** Visible focus, 44px touch targets for primary actions, semantic labels, keyboard Escape close, and WCAG-level contrast.

## Foundations

### Color

```text
canvas          #F7F7F5
surface         #FFFFFF
surface-raised  #FCFCFB
surface-strong  #111111
text            #111111
text-secondary  #5C5C58
text-tertiary   #7C7C76
border          #E2E2DE
border-strong   #C7C7C1
accent          #5B4FF7
accent-hover    #493DDE
accent-soft     #F0EEFF
success         #087A55
success-soft    #ECF8F3
warning         #A45A12
warning-soft    #FFF5E8
danger          #B42318
danger-soft     #FFF0EE
focus           #5B4FF7
```

Do not introduce additional product colors without updating this file.

### Typography

Use the system sans stack; do not ship a font file just for branding.

```text
display  48/1.02  weight 700  desktop only
h1       36/1.08  weight 700
h2       24/1.15  weight 680
h3       17/1.3   weight 650
body     14/1.55  weight 400
small    12/1.45  weight 500
label    12/1.35  weight 650
```

Desktop workspace page titles may use 36–48px. Extension flyouts stay at 13–17px.

### Spacing

4px base grid.

```text
1  4
2  8
3  12
4  16
5  20
6  24
7  32
8  40
9  48
10 64
11 80
```

### Radius

```text
sm     8
md     12
lg     16
xl     22
round  999
```

Do not round every container. Large sections should usually be open layouts separated by rules.

### Shadows

```text
launcher  0 8px 24px rgba(17,17,17,.16)
panel     0 20px 60px rgba(17,17,17,.18)
```

No shadow on ordinary profile sections.

## Layout

### Career workspace

```text
max-width: 1280px
page gutter desktop: 40px
page gutter tablet: 28px
page gutter mobile: 16px
```

Responsive field grids:

```text
>=1180px  12-column semantic grid; short fields may use 4 columns each
720–1179  two columns where useful
<720      one column
```

Long text, addresses, summaries, and record descriptions span full width.

### Workspace navigation

Sticky below browser chrome, one horizontal scroll row on narrow widths.

Sections:

- Overview
- Personal
- Experience
- Education
- Skills
- Documents
- Preferences
- Variants
- Sensitive
- Corrections
- Backup

The navigation scrolls the existing one-page document; it is not a wizard or route switcher.

### Floating assistant

Collapsed launcher:

```text
48x48 desktop
44x44 narrow viewport
right: 20px
bottom: 20px
fixed to viewport
z-index: 2147483647
```

Expanded desktop flyout:

```text
width: min(390px, calc(100vw - 24px))
max-height: min(680px, 76vh)
position: anchored above launcher
scroll internal content only
```

On <=560px, expanded content becomes a bottom sheet with viewport-safe gutters.

## Components

### Button

Primary: near-black or accent fill; one primary action per local surface.
Secondary: white with strong border.
Ghost: transparent, low-emphasis navigation.
Danger: danger text/border; destructive confirmation remains explicit.

### Input

48px preferred height in the workspace, 40px minimum in compact extension UI. Labels sit above controls. Placeholder text is never used as a label.

### Section

Default workspace section is open, not a card:

```text
section heading
short supporting text when needed
content
1px divider
```

Use a bordered card only for an independently movable object: experience record, imported CV candidate, stored document, or destructive/sensitive boundary.

### Status

Use compact text + count. Pills are reserved for status, filters, or concise metadata; do not turn every label into a pill.

### Empty state

One sentence plus one direct action. No illustration or long explainer.

## CV import UX

The import flow is local-first:

```text
Choose PDF/DOCX
  -> local text extraction
  -> deterministic parser
  -> review extracted draft/conflicts
  -> explicit Apply selected data
```

Choosing a file never overwrites the profile.

The import review distinguishes:

- new extracted value
- existing value is identical
- conflict with existing value
- unsupported/unparsed content

CV file storage is a separate explicit action from profile extraction.

## Document attachment UX

Detection is not authorization.

```text
detected resume input
  -> recommend stored resume
  -> user clicks Attach
  -> set that one file input
```

Never automatically attach a file, click Apply/Next/Submit, or chain file attachment into submission.

## Copy style

Use short operational copy.

Good:

- `8 fields ready`
- `Review 2 fields`
- `Attach backend-cv.pdf`
- `Import selected data`

Avoid:

- marketing claims inside utility surfaces
- repeated explanations of local-first behavior
- paragraphs when a label or status line is enough

## Validation

Any UI refactor is incomplete until verified at these representative widths:

- 1440 desktop options page
- 1024 tablet options page
- 390 mobile options page
- floating launcher collapsed
- floating assistant expanded desktop
- floating assistant expanded <=560px

Required quality gates remain unit tests, typecheck, lint, format check, production build, manifest verification, compatibility verification, Chromium E2E, and package build.
