# Job Flow Visual Design System

This file is the visual source of truth for Job Flow. External design references are inspiration only, not templates. `.agent/system-design.md` owns software architecture.

## Design principles

1. **Utility before decoration.** Job Flow is a work tool. Prefer legibility, speed, and obvious actions over expressive SaaS styling.
2. **Dashboard shell, structured editing.** Use a stable sidebar/topbar/main application shell. Major editable workspace sections use compact, clean glass-like bordered surfaces so long forms are scannable; avoid decorative or arbitrary nested card soup.
3. **Neutral glass, not visual noise.** Product actions use near-black, white, translucent neutral surfaces, and soft shadows. Semantic colors are reserved for warning, success, and danger states.
4. **Compact controls, clear hierarchy.** Form controls default to a compact desktop density, with enough height and focus area to remain usable. Density comes from consistent spacing, proximity, and restrained chrome, not from tiny text.
5. **One workspace, not a wizard.** Career data uses non-linear section navigation with one focused category visible at a time. Users can switch categories freely without a forced sequence.
6. **Use the correct surface.** Profile, CV, documents, variants, vault, corrections, and backup live in a normal browser tab. Job-page assistance stays on the current webpage.
7. **Contextual extension UI.** On websites, Job Flow defaults to a small launcher docked to the right viewport edge. Clicking it opens a fixed right slide panel over the page.
8. **Motion is functional.** Short opacity/transform transitions only; respect `prefers-reduced-motion`.
9. **Polished restraint.** Use clean glassmorphism only where it improves hierarchy or fixed-shell depth. No decorative gradients, glowing blobs, excessive pills, repeated marketing copy, or arbitrary rounded cards.
10. **Accessible by default.** Visible focus, practical touch targets, semantic labels, keyboard Escape close, and strong contrast.
11. **Reusable first.** Repeated UI belongs in shared primitives and domain-owned components before feature-local markup. Do not duplicate button, icon button, field, card, empty-state, status, modal, popover, or record patterns.
12. **Lucide icons only.** Use `lucide-react` for interface icons whenever an icon is needed. Do not use text symbols, handcrafted SVG icons, emoji, or mixed icon packs for product UI.

## Foundations

### Color

The implementation source is `tailwind.config.ts`. Keep documentation and runtime tokens aligned.

```text
canvas          #FAFAFA
surface         #FFFFFF
surface-glass   rgb(255 255 255 / 0.82)
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

Do not add decorative product colors. Semantic colors communicate state only. Glass surfaces stay neutral and readable; translucency must never reduce contrast or make text depend on the page behind it.

### Typography

Use the system sans stack; do not ship a font file only for branding.

```text
h1       16–18 / ~1.25  weight 600   shell/page title
h2       16 / 1.25      weight 600   section title
h3       14 / 1.3       weight 600
body     13–14 / 1.5    weight 400
small    11–12 / 1.4    weight 500
label    11–12 / 1.35   weight 600
```

The workspace should not use oversized marketing typography. Extension panels stay compact.

### Spacing

Use the Tailwind 4px base grid. Compact does not mean inconsistent: repeated sections, records, forms, navigation groups, toolbars, and popovers should reuse the same spacing rhythm.

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

Workspace rhythm:

```text
shell gutters     16 mobile / 20 tablet / 24 desktop / 32 wide
section gap       12 compact default, 20 for major page separation
record gap        12 internal compact groups
toolbar gap       8 between controls
field gap         6 label-to-control, 12 between fields
list gap          8 compact rows, 12 for record lists
popover padding   10–12
modal padding     16 mobile / 20 desktop
```

Never fix a cramped layout by adding one-off margins. Promote the spacing to the relevant primitive or domain layout when more than one caller needs it.

Compact UI rules:

- Default desktop control height is 36px. Use 40–44px only for primary page actions, coarse pointer targets, or constrained extension-panel actions that need stronger tap support.
- A card or section should usually use 12px padding. Use 16px only when the content is dense enough to need a stronger boundary.
- Keep label, input, hint, and error in the same field group. Do not create large gaps between a label and the control it names.
- Use extra white space to separate domain groups, not every row. If everything has large space, nothing has hierarchy.
- Avoid global max-width for the workspace. Let short-field grids use available width while long prose stays readable at field level.

### Radius

```text
control  6
surface  8
round    999  status-only when genuinely useful
```

Use the surface radius for real section and record boundaries. Do not turn arbitrary text groups into rounded containers.

### Shadows

```text
shell-glass    0 1px 0 rgb(255 255 255 / 0.72) inset
topbar         0 1px 12px rgb(23 23 23 / 0.045)
launcher       subtle floating shadow
panel          subtle left-facing shadow
record         very subtle shadow for repeated editable object cards
popover        soft elevation, never heavy
modal          medium elevation over dimmed backdrop
```

Workspace section cards may use a very soft shadow only when paired with a neutral glass surface and border. A repeatable record may use a very subtle shadow together with a neutral border when the boundary helps scanning and editing. Avoid stacked heavy shadows; the result should feel smooth, not glossy or loud.

### Glass treatment

Glassmorphism in Job Flow is an interface material, not decoration.

Use it for:

- sticky topbar and fixed assistant panel chrome
- sidebar/header shell surfaces
- popovers, dropdowns, modals, and floating launchers
- focused records or operational regions that need depth

Avoid it for:

- text-only helper blocks
- every nested group in a form
- long reading surfaces where translucency hurts legibility
- status colors, destructive actions, or sensitive-data reveals

Contract:

```text
background     white/78-92 with backdrop blur
border         1px neutral border with slight alpha
shadow         soft and low contrast
radius         8px surface, 6px controls
contrast       text remains readable without relying on backdrop
motion         opacity/translate only, short duration
```

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
│ sidebar 208px    │ sticky topbar                              │
│                  ├────────────────────────────────────────────┤
│ section nav      │ fluid main content                         │
│                  │ responsive gutters                         │
│                  │                                            │
└──────────────────┴────────────────────────────────────────────┘
```

Responsive gutters:

```text
wide desktop  32px
desktop       24px
tablet        20px
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

Navigation density:

- Sidebar width is 208px on desktop.
- Navigation rows use 36px minimum height with 8px icon-to-label spacing.
- Group gaps use 16px; group label to first item uses 4px.
- The active state should be visible by background/border, not by making the row much larger.

Navigation is grouped by domain:

```text
Profile
  Personal
  Experience
  Education

Application
  Documents
  Pipeline
  Preferences
  Variants

Privacy & data
  Sensitive
  Corrections
  Backup
```

`Personal` contains identity, contact, and links as internal groups; Contact and Links are not separate top-level navigation items. Skills are authored contextually from Experience and Projects rather than through a standalone navigation section.

Navigation changes the active workspace category. Profile state stays mounted where needed so draft edits survive category changes.

### Tailwind composition rule

For the options/profile surface:

```text
tailwind.config.ts              shared tokens
src/components/ui/tailwind.css
                                Tailwind directives + base + compatibility grammar
src/components/ui/*
                                reusable control and record contracts
src/components/layout/workspace-section.tsx
                                reusable section-card/help/collapse contract
src/components/layout/workspace-frame.tsx
                                reusable shell/sidebar/topbar/main contract
React feature components        data ownership + local composition only
```

Do not use `@apply` to recreate a parallel BEM component library for page shells or navigation. Prefer shared React primitives for repeated controls and object patterns, and direct utilities only for feature-specific composition.

When a repeated concept already has a primitive or record contract, callers must reuse it instead of reproducing its border, radius, spacing, action placement, or focus behavior locally.

Reusable UI components must cover:

- button variants and loading/disabled states
- icon buttons with size and tone contracts
- text, textarea, select, checkbox, date, and month fields
- field grids and section layouts
- collapsible workspace sections and subsections
- record cards, record headers, record action placement
- chips, status messages, empty states, and inline alerts
- file picker controls
- popovers, dropdowns, drawers, dialogs, and confirmation flows when introduced
- domain navigation and compact mobile selectors

Feature components own data and domain wording. Shared primitives own visual rhythm, focus behavior, sizing, spacing, icon placement, and disabled/error/read-only states.

### Domain module grouping

UI modules should be organized by the domain the user understands, with shared visual primitives separated from product-domain ownership.

```text
src/components
  shared primitives, shell, section cards, tokens, reusable interaction surfaces

src/components/profile
  personal identity, contact, links, experience, education, projects, languages,
  certifications, preferences, variants, profile import/review composition

src/components/applications
  saved opportunities, pipeline board, needs-action list, closed outcomes,
  application detail and contextual editing

src/components/documents
  stored resumes/documents, document metadata, explicit attachment readiness

src/components/vault
  sensitive values, unlock state, explicit disclosure/fill flows

src/components/corrections
  learned field corrections, stale mapping review, reset flows

src/components/floating
  job-page launcher, assistant panel, fill plan review, document attachment,
  sensitive-field prompts

src/components/popup
  browser-action entry surface only
```

Do not group modules by generic page size, component type, or implementation convenience when a clear product domain exists. Cross-domain shared code belongs in `src/components/ui` or `src/components/layout` only when at least two domains currently need the same behavior.

### Component structure

The design system must not become one large component dump file. Keep the structure plain:

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

src/components/layout
  workspace-frame
  workspace-section

src/components/profile
src/components/applications
src/components/documents
src/components/vault
src/components/corrections
src/components/floating
src/components/popup
```

Rules:

- `components/ui` is only for small reusable controls and surface primitives
- `components/layout` owns reusable shell, page frame, and section layout
- `components/<domain>` owns composed product components and user flows
- UI components own size, spacing, visual states, focus, icons, and accessibility
- domain components own wording, data shape, state, and product behavior
- a shared component must have a clear current reuse case, not hypothetical future reuse
- when one file starts mixing low-level UI, layout, and domain knowledge, split it before adding more behavior
- delete superseded compatibility exports after callers migrate to `src/components`

### Native and headless control policy

Native browser controls are acceptable when their behavior is better than a custom replacement, but "native" is not the visual design. Every native control used in Job Flow must be wrapped in a styled atom or molecule.

Use native wrapped controls for:

- text, email, URL, password, number, date, month, checkbox, textarea, and file input
- short stable selects when native platform behavior is sufficient

Use a headless accessible primitive or APG-conformant custom component for:

- custom select/listbox where native styling blocks the intended quality
- searchable select or combobox
- dialog, drawer, popover, tooltip, tabs, menu button, and command-like picker
- any component requiring focus trapping, roving focus, typeahead, positioning, or Escape behavior

Do not add a full visual component library. If a dependency is needed, prefer an unstyled/headless behavior primitive and style it with Job Flow tokens. Test the dependency in one proof of concept before migrating broad UI.

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
width: min(368px, 100vw)
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

Buttons use Lucide icons only when the icon improves scan speed or disambiguates an action. Keep one dominant primary action per local surface. Loading and disabled states must preserve button dimensions.

### Icon actions

CRUD actions for repeatable records use compact icon buttons:

```text
section-level add      + icon, accessible label/title required
record-level remove    trash icon, danger tone on hover/focus
```

Use the shared icon-button size contract instead of caller-specific `!h-*` / `!w-*` overrides. Text danger buttons remain appropriate for broader destructive workflows such as resetting all learned mappings or deleting the encrypted vault, where explicit wording reduces risk.

All icon actions must use `lucide-react`. Common mappings:

```text
add/create        Plus
remove/delete     Trash2
edit              Pencil
save              Save
import/upload     Upload
attach file       Paperclip
open external     ExternalLink
collapse/expand   ChevronDown / ChevronRight
search            Search
settings          Settings
shield/vault      ShieldCheck / Lock
history           History
documents         FileText / FileArchive
pipeline          ClipboardList
profile           UserRound
work              BriefcaseBusiness
education         GraduationCap
```

Every icon-only button requires an accessible label and visible focus state.

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
white/glass surface
neutral border
8px surface radius
soft or no shadow depending on hierarchy
header: title + contextual help icon + local action + collapse affordance
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

Record lists should stay compact and readable:

```text
record list gap      12-16
record header        title, context/meta, local actions
record body          field grid first, long text full width
record footer        secondary actions or status only when needed
```

Do not put cards inside cards just to create visual depth. A nested boundary must represent a real repeated entity, review region, or confirmation surface.

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

### Flow and interaction checks

Every workspace or assistant flow should be inspectable against this checklist before release readiness is claimed:

```text
entry point        user can identify where to start
primary action     one obvious next action per surface
state preservation draft edits survive navigation where expected
feedback           save/import/fill/review states are visible and specific
error handling     validation and parse errors appear near the cause
escape route       user can cancel, close, or go back without data loss
keyboard           tab order follows visual order; Escape closes overlays
mobile             controls remain reachable without horizontal scrolling
overflow           long labels, URLs, filenames, and records do not overlap
loading            pending states preserve layout dimensions
sensitive data     detect/review/unlock/fill remain separate explicit steps
document attach    recommendation does not imply automatic attachment
```

For a real UX audit, capture current screenshots for the target flow and tie findings to the captured steps. Source inspection alone can update this design contract, but it is not visual-release evidence.

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
