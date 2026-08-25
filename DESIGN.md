# Fillio Visual Design System

This file is the visual source of truth for Fillio. External design references are inspiration only, not templates. `.agent/system-design.md` owns software architecture.

## Design principles

1. **Utility before decoration.** Fillio is a work tool. Prefer legibility, speed, and obvious actions over expressive SaaS styling.
2. **Editorial before dashboard.** Prefer typography, whitespace, separators, and clear grouping over card soup.
3. **Monochrome by default.** Product actions use near-black, white, and warm neutrals. Semantic colors are reserved for warning, success, and danger states.
4. **Compact controls, clear hierarchy.** Form controls are dense enough for long career profiles without becoming cramped.
5. **One workspace, not a wizard.** Career data is edited on one continuous responsive page with sticky anchor navigation.
6. **Use the correct surface.** Profile, CV, documents, variants, vault, corrections, and backup live in a normal browser tab. Job-page assistance stays on the current webpage.
7. **Contextual extension UI.** On websites, Fillio defaults to a small launcher docked to the right viewport edge. Clicking it opens a fixed right slide panel over the page.
8. **Motion is functional.** Short opacity/transform transitions only; respect `prefers-reduced-motion`.
9. **No AI aesthetic noise.** No decorative gradients, glowing blobs, glassmorphism, excessive pills, repeated marketing copy, or arbitrary rounded cards.
10. **Accessible by default.** Visible focus, practical touch targets, semantic labels, keyboard Escape close, and strong contrast.

## Foundations

### Color

```text
canvas          #F6F6F3
surface         #FFFFFF
surface-subtle  #F1F1EE
surface-strong  #111111
text            #111111
text-hover      #292927
text-secondary  #62625D
text-tertiary   #808079
border          #DEDED8
border-strong   #BDBDB5
focus           #111111
accent          #111111
accent-hover    #292927
accent-soft     #EEEEEA
success         #176448
success-soft    #EEF7F2
warning         #85510F
warning-soft    #FAF3E7
danger          #A61B12
danger-soft     #FFF2F0
```

Do not add decorative product colors. Semantic colors communicate state only.

### Typography

Use the system sans stack; do not ship a font file only for branding.

```text
h1       30–38 / ~1.05  weight 700
h2       20 / 1.15      weight 680
h3       16 / 1.3       weight 650
body     13–14 / 1.5    weight 400
small    11–12 / 1.4    weight 500
label    11–12 / 1.35   weight 650
```

The workspace should not use oversized marketing typography. Extension panels stay compact.

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
sm     6
md     8
lg     10
xl     12
round  999  status-only when genuinely useful
```

Do not round every container. Large sections are open layouts separated by rules.

### Shadows

```text
launcher  subtle floating shadow only
panel     subtle left-facing shadow only
```

Ordinary workspace sections have no shadow.

## Surface model

Fillio has two primary surfaces and they must not be mixed.

### 1. Career workspace — normal browser tab

Used for:

- profile data
- CV import
- stored documents
- application variants
- sensitive vault setup
- correction memory
- backup and recovery

The WXT options page sets `manifest.open_in_tab`, so browser extension settings open as a full tab rather than a constrained embedded options dialog.

```text
max-width: 1180px
page gutter desktop: 40px
page gutter tablet: 28px
page gutter mobile: 16px
```

Responsive field grids:

```text
wide desktop  up to three columns for short fields
tablet        two columns where useful
mobile        one column
```

Long text, addresses, summaries, and record descriptions span the useful content width.

### Workspace navigation

Sticky horizontal anchor navigation below the Fillio top bar.

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

Navigation scrolls the existing one-page document; it is not a wizard or route switcher.

### 2. Job-page assistant — fixed right slide panel

The assistant is injected into the job page and overlays the viewport. It must not become part of the website layout or push/reflow application content.

Collapsed launcher:

```text
position: fixed
right: 0
top: 50%
approx. 42x56 desktop
vertically centered edge tab
highest extension z-index
```

Expanded panel:

```text
position: fixed
top: 0
right: 0
bottom: 0
width: min(392px, 100vw)
height: 100dvh
border-left only
internal scroll
```

On narrow viewports the panel may occupy the full viewport width. It remains an overlay, not a page-layout column.

The collapsed launcher is the only persistent UI when the assistant is closed.

## Job-page information hierarchy

Home view should be operational, not dashboard-like:

```text
Fillio
Application / variant context
site host

3 ready
2 review · 1 sensitive
4 unrecognized

[ Fill ready fields ]

Documents
Resume                         [ Attach ]

Needs attention
Review ambiguous fields             2
Sensitive fields                    1

Open profile workspace              ↗
```

Avoid four equal status cards or badge rows. Counts are supporting information, not the product itself.

## Components

### Button

Primary: near-black fill; one dominant action per local surface.
Secondary: white/transparent with a clear border.
Ghost: transparent for navigation or low-emphasis controls.
Danger: semantic danger styling only for destructive actions.

### Input

Workspace controls target roughly 44px height. Labels sit above controls. Placeholder text is never used as a label.

### Section

Default workspace section is open:

```text
section heading
short supporting text only when necessary
content
1px divider
```

Use a bordered container only when the object benefits from a real boundary, such as an experience record or sensitive/destructive operation.

### Status

Prefer compact text and counts. Pills are reserved for actual statuses, filters, or concise metadata. Missing profile essentials should not become a row of decorative pills.

### Empty state

One sentence plus one direct action. No illustration and no marketing paragraph.

## CV import UX

The import flow is local-first:

```text
Choose PDF/DOCX/TXT
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

## Sensitive data UX

Sensitive values are never displayed merely because a matching field was detected.

```text
detect sensitive field
  -> show field label/count only
  -> user opens Sensitive view
  -> unlock vault if needed
  -> require explicit site-specific fill action
```

Unlocking the vault is not authorization to fill a site.

## Copy style

Use short operational copy.

Good:

- `8 fields ready`
- `Review ambiguous fields`
- `Attach backend-cv.pdf`
- `Import selected data`
- `Open profile workspace`

Avoid:

- marketing claims inside utility surfaces
- repeated explanations of local-first behavior
- generic AI-assistant language
- paragraphs when a label or status line is enough

## Validation

Representative visual widths:

- 1440 desktop workspace tab
- 1024 tablet workspace tab
- 390 mobile workspace tab
- collapsed right-edge launcher
- expanded right slide panel desktop
- expanded right slide panel narrow viewport

Standard quality gates remain unit tests, typecheck, lint, format check, compatibility verification, production build, generated-manifest verification, Chromium browser validation, and package build. Browser E2E may be explicitly deferred for a development merge, but it remains required before release readiness is claimed.
