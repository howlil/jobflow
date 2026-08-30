# Job Flow Visual Design System

This file is the visual source of truth for Job Flow. External design references are inspiration only, not templates. `.agent/system-design.md` owns software architecture.

## Design principles

1. **Utility before decoration.** Job Flow is a work tool. Prefer legibility, speed, and obvious actions over expressive SaaS styling.
2. **Dashboard shell, structured editing.** Use a stable sidebar/topbar/main application shell. Major editable workspace sections use restrained flat bordered collapsible cards so long forms are scannable; avoid decorative or arbitrary nested card soup.
3. **Monochrome by default.** Product actions use near-black, white, and neutral surfaces. Semantic colors are reserved for warning, success, and danger states.
4. **Compact controls, clear hierarchy.** Form controls are dense enough for long career profiles without becoming cramped.
5. **One workspace, not a wizard.** Career data uses non-linear section navigation with one focused category visible at a time. Users can switch categories freely without a forced sequence.
6. **Use the correct surface.** Profile, CV, documents, variants, vault, corrections, and backup live in a normal browser tab. Job-page assistance stays on the current webpage.
7. **Contextual extension UI.** On websites, Job Flow defaults to a small launcher docked to the right viewport edge. Clicking it opens a fixed right slide panel over the page.
8. **Motion is functional.** Short opacity/transform transitions only; respect `prefers-reduced-motion`.
9. **No AI aesthetic noise.** No decorative gradients, glowing blobs, glassmorphism, excessive pills, repeated marketing copy, or arbitrary rounded cards.
10. **Accessible by default.** Visible focus, practical touch targets, semantic labels, keyboard Escape close, and strong contrast.

## Foundations

### Color

The implementation source is `tailwind.config.ts`. Keep documentation and runtime tokens aligned.

```text
canvas          #FAFAFA
surface         #FFFFFF
surface-subtle  #F7F7F7
surface-strong  #171717
text            #171717
text-secondary  #525252
text-tertiary   #737373
border          #E5E5E5
border-strong   #D4D4D4
focus           #171717
accent          #171717
accent-hover    #000000
accent-soft     #F7F7F7
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
h1       18–20 / ~1.25  weight 600   shell/page title
h2       18 / 1.2       weight 600   section title
h3       14–16 / 1.3    weight 600
body     13–14 / 1.5    weight 400
small    11–12 / 1.4    weight 500
label    11–12 / 1.35   weight 600
```

The workspace should not use oversized marketing typography. Extension panels stay compact.

### Spacing

Use the Tailwind 4px base grid.

```text
1  4
2  8
3  12
4  16
5  20
6  24
8  32
10 40
12 48
16 64
20 80
```

### Radius

```text
control  6
surface  8
round    999  status-only when genuinely useful
```

Use the surface radius for real section and record boundaries. Do not turn arbitrary text groups into rounded containers.

### Shadows

```text
launcher  subtle floating shadow
panel     subtle left-facing shadow
record    very subtle shadow for repeated editable object cards
```

Workspace section cards remain shadowless. A repeatable record may use a very subtle shadow together with a neutral border when the boundary helps scanning and editing.

## Surface model

Job Flow has two primary surfaces and they must not be mixed.

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

The options HTML file is only the application mount document. Product layout belongs in reusable React components, not hard-coded HTML chrome.

Desktop shell:

```text
┌──────────────────┬────────────────────────────────────────────┐
│ sidebar 224px    │ sticky topbar                              │
│                  ├────────────────────────────────────────────┤
│ section nav      │ fluid main content                         │
│                  │ responsive gutters                         │
│                  │                                            │
└──────────────────┴────────────────────────────────────────────┘
```

Responsive gutters:

```text
wide desktop  40px
desktop       32px
tablet        24px
mobile        16px
```

The main workspace does not stop expanding at an arbitrary desktop max width. On wide monitors, short-field grids may use the additional horizontal space while long text remains readable through field-level composition rather than a global page-width cap.

Responsive field grids:

```text
wide desktop  up to three columns for short fields
tablet        two columns where useful
mobile        one column
```

Long text, addresses, summaries, and record descriptions span the useful content width.

### Workspace navigation

Desktop navigation lives in the persistent left sidebar. The topbar shows the active workspace title and lightweight context. Mobile uses a compact native section selector before the content instead of forcing the desktop rail into a narrow viewport.

Top-level sections:

- Personal
- Experience
- Education
- Documents
- Preferences
- Variants
- Sensitive
- Corrections
- Backup

`Personal` contains identity, contact, and links as internal groups; Contact and Links are not separate top-level navigation items. Skills are authored contextually from Experience and Projects rather than through a standalone navigation section.

Navigation changes the active workspace category. Profile state stays mounted where needed so draft edits survive category changes.

### Tailwind composition rule

For the options/profile surface:

```text
tailwind.config.ts              shared tokens
src/ui/design-system/tailwind.css
                                Tailwind directives + base + compatibility grammar
src/ui/design-system/primitives.tsx
                                reusable control and record contracts
src/ui/design-system/WorkspaceSectionCard.tsx
                                reusable section-card/help/collapse contract
React feature components        data ownership + local composition only
```

Do not use `@apply` to recreate a parallel BEM component library for page shells or navigation. Prefer shared React primitives for repeated controls and object patterns, and direct utilities only for feature-specific composition.

When a repeated concept already has a primitive or record contract, callers must reuse it instead of reproducing its border, radius, spacing, action placement, or focus behavior locally.

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

The content-script assistant is mounted in Shadow DOM. Its isolated styling is an intentional runtime boundary and must not be deleted merely because the options surface uses Tailwind.

## Job-page information hierarchy

Home view should be operational, not dashboard-card-heavy:

```text
Job Flow
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

### Icon actions

CRUD actions for repeatable records use compact icon buttons:

```text
section-level add      + icon, accessible label/title required
record-level remove    trash icon, danger tone on hover/focus
```

Use the shared icon-button size contract instead of caller-specific `!h-*` / `!w-*` overrides. Text danger buttons remain appropriate for broader destructive workflows such as resetting all learned mappings or deleting the encrypted vault, where explicit wording reduces risk.

### Input

Workspace controls target roughly 38–44px height. Labels sit above controls. Placeholder text is never used as a label.

Use native input semantics for dates:

```text
exact calendar date  -> input type="date"
career date range    -> input type="month"
```

Persist native edited values in ISO-compatible `YYYY-MM-DD` or `YYYY-MM` form. Legacy display formats may be normalized at the input boundary without inventing missing day precision.

### Section

A major editable workspace section uses one restrained section-card contract:

```text
white surface
neutral border
8px surface radius
no shadow
header: title + contextual ? help + local action + collapse affordance
body: direct form/operational content
```

Sections are expanded by default and can be collapsed without mutating profile data. Collapse state is interface state, not persisted career-profile data. Contextual help explains what belongs in the section without permanently filling the page with helper paragraphs.

Do not add an extra card around arbitrary text. Nested bordered surfaces are appropriate only when they represent a real repeated record or a distinct operational region such as CV review.

### Repeatable record

Repeatable editable objects such as experience, education, languages, certifications, projects, application variants, and reusable answers share one visual contract:

```text
white surface
neutral border
8px surface radius
very subtle shadow
16px internal spacing
summary/context at top when useful
local remove action in the top-right
```

Collapsible records and always-open records may differ in behavior, but not in surface grammar or CRUD action placement.

### Linked skills

Experience and Project are the user-facing skill-authoring sources. They use the same linked-skill editor pattern:

```text
single skill input + autosuggest + add icon
Enter/comma -> removable skill chip
```

Do not expose skill level or years-of-experience in the current workspace. The active skill inventory is the case-insensitive unique union of Experience and Project skill links. A persisted canonical skill registry may remain as an internal compatibility index for stable IDs and autosuggest, but registry-only entries are not active skills.

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

Standalone CV skills are not imported into the active skill inventory because Job Flow cannot safely infer which Experience or Project owns them. Skill links remain explicitly authored in their career-record context.

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

- 2560 wide desktop workspace tab
- 1920 desktop workspace tab
- 1440 desktop workspace tab
- 1024 tablet workspace tab
- 390 mobile workspace tab
- collapsed right-edge launcher
- expanded right slide panel desktop
- expanded right slide panel narrow viewport

Standard quality gates remain unit tests, typecheck, lint, format check, compatibility verification, production build, generated-manifest verification, Chromium browser validation, and package build. Browser E2E may be explicitly deferred for a development merge, but it remains required before release readiness is claimed.
