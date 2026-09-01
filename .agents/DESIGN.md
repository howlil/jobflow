# Jobflow Visual Design

This is the visual and interaction source of truth for Jobflow. Product behavior lives in `PROJECT.md`; software/runtime boundaries live in `ARCHITECTURE.md`.

## Design principles

1. **Utility before decoration.** Jobflow is a work tool; optimize for legibility, speed, hierarchy, and obvious actions.
2. **Dashboard shell, structured editing.** Use a stable sidebar/topbar/main shell and restrained bordered surfaces for real editable/operational regions.
3. **Neutral glass, not visual noise.** Glassmorphism is an interface material for hierarchy/elevation, not decoration.
4. **Compact controls, clear hierarchy.** Density comes from consistent spacing and restrained chrome, not tiny type.
5. **One workspace, not a wizard.** Career data is non-linear; users can switch categories without a forced sequence.
6. **Use the correct surface.** Full-tab workspace for career/application/data operations; in-page assistant for current-page action.
7. **Motion is functional.** Short opacity/transform transitions only; respect `prefers-reduced-motion`.
8. **Accessible by default.** Visible focus, semantic labels, keyboard Escape for overlays, strong contrast, practical targets.
9. **Reusable first.** Repeated controls/surfaces use owned shared primitives before feature-local duplication.
10. **Lucide icons only.** Use `lucide-react` for product interface icons; do not mix icon packs, emoji, text symbols, or handcrafted product SVGs.

Avoid decorative gradients, glowing blobs, excessive pills, marketing-style hero typography, arbitrary nested cards, and local visual-token systems.

## Foundations

### Color

Runtime token source: `tailwind.config.ts`.

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

Semantic colors communicate state only. Neutral translucent surfaces must preserve readable contrast independent of the page behind them.

### Typography

Use the system sans stack; do not ship a font solely for branding.

```text
h1       16–18 / ~1.25  weight 600
h2       16 / 1.25      weight 600
h3       14 / 1.3       weight 600
body     13–14 / 1.5    weight 400
small    11–12 / 1.4    weight 500
label    11–12 / 1.35   weight 600
```

### Spacing

Use the Tailwind 4px grid.

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
section gap       12 compact default / 20 major separation
record gap        12
inline toolbar    8
label-to-control  6–8
field-to-field    12–16
modal padding     16 mobile / 20 desktop
```

Default desktop control height is approximately 36px. Use 40–44px only for dominant actions, coarse-pointer needs, or constrained extension panels.

### Radius and elevation

```text
control  6px
surface  8px
round    999px only for genuine status/filter metadata
```

Use soft, low-contrast shadows. Avoid stacked heavy elevation.

### Glass treatment

Use neutral glass for shell chrome, sticky/fixed surfaces, popovers, dialogs, launchers, and focused operational regions when depth improves hierarchy.

Do not use glass for text-only helper blocks, every nested form group, status color, destructive action, or sensitive-value reveal.

## Surface model

### Full-tab workspace

Used for:

- profile data
- CV import
- stored documents
- application pipeline/detail
- variants/preferences
- sensitive vault
- correction memory
- backup/recovery

Desktop shell:

```text
┌──────────────────┬────────────────────────────────────────────┐
│ sidebar 208px    │ sticky topbar                              │
│                  ├────────────────────────────────────────────┤
│ domain nav       │ fluid responsive main content              │
└──────────────────┴────────────────────────────────────────────┘
```

Do not impose an arbitrary desktop max width on the workspace. Short-field grids may use available width; long prose remains readable through field-level composition.

Responsive field grids:

```text
wide desktop  up to 3 columns for short fields
tablet        2 columns where useful
mobile        1 column
```

Navigation is domain-oriented. Current product grouping centers on Work, Career kit/profile concerns, and Data & privacy; Pipeline is the operational home. Skills are authored contextually from Experience and Projects, not through a standalone workspace.

### In-page assistant

The assistant overlays the host page and never becomes part of the site's layout.

Collapsed launcher:

```text
position: fixed
right: 0
top: 50%
approx. 42x56 desktop
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

On narrow viewports it may occupy full width. The assistant is mounted in Shadow DOM; its styling isolation is intentional and must not be removed merely because the workspace uses Tailwind.

## Tailwind and component ownership

```text
tailwind.config.ts              shared design tokens
src/components/ui/tailwind.css  Tailwind directives + base + compatibility grammar
src/components/ui/*             reusable controls/surfaces
src/components/layout/*         shell and section layout
src/components/<domain>/*       product/domain composition
```

Prefer shared React primitives for repeated concepts and direct Tailwind utilities for local feature composition. Do not recreate a parallel BEM/`@apply` component library for shells or navigation.

### Domain grouping

```text
src/components/profile
src/components/applications
src/components/documents
src/components/vault
src/components/corrections
src/components/floating
src/components/popup
```

Shared code belongs in `ui` or `layout` only when multiple current domains genuinely use the same concept.

### Primitive ownership

Shared primitives own:

- buttons and icon buttons
- text/textarea/select/checkbox/date/month fields
- file selection
- field grids
- section layouts
- record cards and headers
- chips/status/alerts/empty states
- popovers, dialogs, drawers, menus, tooltips, tabs, comboboxes when introduced
- focus behavior, sizing, spacing, icons, disabled/error/read-only states

Domain components own wording, data shape, state, and product behavior.

Do not create generic `Box`, `Flex`, `Grid`, `Stack`, or `Card` wrappers solely to hide Tailwind utilities.

## Native and headless controls

Use native browser controls when their platform behavior is better than a custom replacement, but wrap them in Jobflow styling.

Native wrapped controls are preferred for:

- text/email/URL/password/number/date/month
- checkbox
- textarea
- file input
- short stable selects when native behavior is sufficient

Use an accessible headless/APG-conformant primitive for interactions requiring focus trapping, roving focus, typeahead, positioning, or custom collections such as dialogs, drawers, popovers, tooltips, tabs, menus, command pickers, searchable selects, and comboboxes.

Do not add a full opinionated visual component library. If a behavior dependency is required, prefer a small unstyled/headless primitive and validate it in one concrete use before broad adoption.

## Component contracts

### Buttons

- Primary: near-black fill; one dominant action per local surface.
- Secondary: white/transparent with clear border.
- Ghost: navigation/low emphasis.
- Danger: semantic danger only for destructive actions.
- Loading/disabled states preserve dimensions.

Icon-only controls require an accessible label and visible focus.

Common Lucide mappings:

```text
add/create      Plus
remove/delete   Trash2
edit            Pencil
save            Save
upload/import   Upload
attach          Paperclip
external        ExternalLink
expand/collapse ChevronDown / ChevronRight
search          Search
settings        Settings
vault           ShieldCheck / Lock
history         History
documents       FileText / FileArchive
pipeline        ClipboardList
profile         UserRound
work            BriefcaseBusiness
education       GraduationCap
```

### Dates

Use native semantics:

```text
exact date    -> input type="date"  -> YYYY-MM-DD
career range  -> input type="month" -> YYYY-MM
```

Normalize legacy values at the input boundary without inventing missing precision.

### Workspace sections

Major editable sections use one restrained bordered section contract with title, contextual help, local action when needed, and collapse affordance. Sections are expanded by default; collapse state is interface state, not career data.

Do not add nested cards unless the nested boundary represents a real repeated entity, review region, or distinct operational surface.

### Repeatable records

Experience, education, languages, certifications, projects, variants, and similar entities share the same record grammar: neutral bordered surface, subtle elevation, consistent internal spacing, clear summary/context, and local top-right remove action where applicable.

### Linked skills

Experience and Projects use one linked-skill editor pattern:

```text
single skill input + autosuggest
Enter/comma -> removable skill chip
```

Do not expose skill level or years-of-experience in the current workspace.

### Status and empty state

Use concise status text/counts. Pills are reserved for real status/filter/metadata. Empty states are one sentence plus one direct action; no marketing paragraph or illustration is required.

## Product interaction rules

### Autofill states

Expose semantic states rather than raw matcher scores:

- Ready
- Needs review
- Unknown
- Sensitive

Never rely on color alone. Review must let the user accept, remap, or skip where applicable.

### CV import

```text
Choose PDF/DOCX/TXT
 -> local extraction
 -> deterministic parser
 -> review extracted draft/conflicts
 -> explicit Apply selected data
```

Choosing a file never silently overwrites the profile. Storing the CV file is a separate explicit action.

### Document attachment

```text
detected resume input
 -> recommend stored resume
 -> user clicks Attach
 -> set that one file input
```

Detection never authorizes automatic attachment or submission.

### Sensitive data

```text
detect sensitive field
 -> show label/count only
 -> user opens Sensitive view
 -> unlock vault if needed
 -> explicit current-site fill action
```

Unlocking is not disclosure consent. Do not expose sensitive values longer than necessary.

### Copy

Use short operational copy, e.g. `8 fields ready`, `Review ambiguous fields`, `Attach backend-cv.pdf`, `Import selected data`, `Open profile workspace`.

Avoid repeated local-first explanations, marketing claims, and generic AI-assistant language inside utility surfaces.

## Interaction and visual verification

Before claiming a UI flow release-ready, verify only the representative states/widths relevant to the changed surface, with emphasis on:

```text
entry point        obvious starting point
primary action     one obvious next action
state preservation expected drafts/navigation survive
feedback           specific save/import/fill/review status
errors             appear near cause
escape route       cancel/close/back without data loss
keyboard           logical tab order; Escape closes overlays
mobile             controls reachable without horizontal scroll
overflow           long labels/URLs/filenames do not collide
loading            dimensions remain stable
sensitive data     detect/review/unlock/fill stay explicit
document attach    recommendation never implies auto-attachment
```

Representative widths when affected:

- 2560, 1920, 1440 desktop workspace
- 1024 tablet workspace
- 390 mobile workspace
- collapsed launcher
- expanded assistant desktop
- expanded assistant narrow viewport

A real visual audit should use current screenshots of the target flow. Source inspection is not visual-release evidence.