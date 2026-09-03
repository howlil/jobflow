# Jobflow Visual Design Contract

This file is the visual source of truth for Jobflow. Product behavior lives in `PROJECT.md`; software/runtime boundaries live in `ARCHITECTURE.md`.

Jobflow is a local-first career operations tool. It should feel like a compact desktop workspace, not a generic SaaS dashboard assembled from cards and not a decorative AI assistant.

## 1. Product character

The authenticated/options workspace and the in-page assistant are:

- operational rather than promotional;
- compact rather than spacious;
- flat rather than elevated;
- monochrome by default;
- information-dense without tiny text;
- structured by alignment, padding, typography, and 1px strokes;
- explicit about saved, detected, sensitive, ambiguous, and actionable state.

Avoid decorative gradients, glassmorphism, glowing chrome, card stacks, unnecessary shadows, oversized whitespace, decorative accent colors, and explanatory filler.

Color is semantic. Elevation represents a real overlay layer. Rounded rectangles represent interactive controls or genuine inset entities, not every level of hierarchy.

## 2. Application shell

### Desktop workspace

- Global header height: **56px**.
- Collapsed navigation rail width: **56px**.
- Hover/focus expands navigation to approximately **240px** as an overlay.
- Expanded navigation MUST NOT resize or reflow main workspace content.
- Main workspace begins immediately after the 56px rail and below the 56px header.
- Sidebar owns navigation only.
- Header owns current workspace context and suitable global/status metadata.

### Workspace geometry

Full-tab career/application/data operations are edge-to-edge structural workspace content.

- Do not add a generic route-level `max-w-*` wrapper.
- Do not separate first-level regions with floating-card gaps.
- Consecutive first-level operational regions use structural dividers.
- Use internal padding to make fields readable; do not create page-level whitespace solely to make sections look like cards.
- Dialogs, popovers, repeated records, dropzones, and other genuinely inset interaction regions may have an explicit boundary.

### Mobile

Mobile may use a conventional full-width navigation selector rather than the desktop rail. Preserve the same authorized destinations and interaction semantics.

## 3. One-workspace-fill invariant

Ordinary operational workspace regions use one base surface.

Do not create hierarchy by alternating neutral fills between:

- first-level sections;
- section headers and bodies;
- application/pipeline regions;
- profile sections;
- table-like lists;
- pagination/toolbars;
- idle inputs and secondary actions;
- ordinary hover states.

Hierarchy is communicated by:

- 1px dividers and boundaries;
- stroke contrast;
- alignment and spacing;
- typography;
- semantic dots/icons;
- focus and selection indicators.

Different fills are reserved for:

- semantic warning/error/success/info feedback;
- primary/destructive actions;
- true overlays;
- technical output when a dedicated technical surface exists;
- selected navigation where a restrained neutral fill communicates selection.

## 4. Foundation tokens

Runtime token sources:

- `tailwind.config.ts` maps semantic Tailwind names to CSS variables;
- `src/components/ui/tailwind.css` owns light/dark token values and compatibility grammar;
- `src/components/floating/floating-styles.ts` mirrors the same visual contract inside Shadow DOM.

### Light

```text
background        #FAFAFA
surface           #FFFFFF
surface-muted     #F7F7F7
surface-raised    #FFFFFF
border            #DEDEDE
border-strong     #C9C9C9
ink               #171717
muted             #525252
subtle            #737373
accent            #171717
accent-strong     #0A0A0A
accent-soft       #E5E5E5
danger            #DC2626
warning           #D97706
info               #0284C7
success           #059669
```

### Dark token readiness

```text
background        #0A0A0A
surface           #141414
surface-muted     #1A1A1A
surface-raised    #171717
border            #303030
border-strong     #4A4A4A
ink               #FAFAFA
muted             #A3A3A3
subtle            #737373
accent            #FAFAFA
accent-strong     #FFFFFF
accent-soft       #333333
danger            #F87171
warning           #FBBF24
info              #38BDF8
success           #34D399
```

Dark tokens exist so components do not hard-code a light-only visual grammar. Theme activation is a separate product/runtime concern; do not invent a second palette in feature code.

## 5. Typography

Primary family:

```text
Inter Variable -> Inter -> system sans
```

Technical identifiers/output may use:

```text
IBM Plex Mono -> system monospace
```

Targets:

```text
body/control/table     14–15px
section title          15–16px
supporting text        13px
technical mono         12–13px
real page/object title 20–24px when needed
```

Compactness comes from layout and chrome, not unreadable 10–11px body text. Uppercase eyebrow text may use 11px because it is short navigational metadata.

## 6. Geometry

Canonical desktop control geometry:

```text
text/input/select/button height   36px
icon-only control                 36x36px
coarse-pointer target             44px minimum
control text                      14px
control radius                    6px
overlay radius                    8px
structural stroke                 1px
```

Button size variants must not create route-local height drift. Horizontal padding may vary when needed; adjacent actions and fields align vertically.

## 7. Strokes and elevation

- Structural dividers are 1px.
- First-level workspace regions do not use rounded outer silhouettes.
- First-level workspace regions do not use shadows.
- Repeated entity records and explicit inset controls may use a 6px radius and 1px border.
- Overlays/popovers may use an 8px radius and `0 12px 28px rgb(0 0 0 / 0.14)` shadow.
- The in-page assistant is a true overlay and may use overlay elevation; its internal sections remain flat.
- Avoid border nesting where every parent and child draws a full rectangle.

## 8. Controls

Inputs and actions belong to one control system.

### Idle

- transparent fill inherited from parent surface;
- visible low-contrast border;
- readable neutral text.

### Hover

- fill normally remains unchanged;
- boundary/text may become slightly clearer;
- no decorative accent color.

### Focus

- focus is the strongest normal boundary state;
- use the shared monochrome focus border/ring;
- focus must remain visible in supported themes.

### Disabled/read-only

Use muted text and restrained muted fill only when needed to make non-editability unambiguous.

### Actions

- Primary: monochrome inversion; one dominant action per local workflow surface.
- Secondary/default: transparent fill + neutral border.
- Ghost: borderless/low emphasis until interaction.
- Danger: semantic danger only for destructive actions.
- Loading/disabled states preserve geometry.

Reuse `Button`, `IconButton`, `TextField`, `TextareaField`, `SelectField`, `CheckboxField`, and shared compatibility classes. Do not introduce route-local button/input palettes.

## 9. Sections and repeated records

### First-level workspace sections

First-level profile/application/data sections are structural regions:

```text
section header/context
---------------------- 1px divider when open/needed
section body
====================== divider to next first-level region
```

They are not floating cards.

### Repeated records

Experience, education, applications, variants, projects, and other repeated entities may use an inset record boundary because each row/entity is independently actionable.

Record grammar:

- 1px border;
- 6px radius;
- shared workspace/surface fill;
- no shadow;
- consistent 12px internal spacing;
- clear title/context/meta;
- local actions owned by the record.

## 10. Navigation

Desktop sidebar defaults to the 56px icon rail. Hover/keyboard focus expands it as a non-reflowing overlay.

- Active navigation may use a restrained neutral fill because it communicates selection.
- Idle navigation does not show persistent borders.
- Generic UI icons come from `lucide-react` only.
- Icon semantics must match the actual operation.
- Icon-only controls require an accessible label/title where appropriate.

## 11. Status and semantic feedback

Ordinary runtime/state metadata should prefer a small status dot + readable text when a full alert is unnecessary.

Semantic surfaces are reserved for states that require explanation or action:

- success;
- warning;
- danger/error;
- info.

Do not turn every status into a tinted pill. Do not repeat the same state in nearby components without a functional reason. Never hide destructive, sensitive, stale, blocking validation, or failure information to make the UI cleaner.

## 12. Pipeline and data-dense regions

Lists/tables are workspace content, not cards.

Recommended order:

```text
context/title
local toolbar
column/list header when applicable
rows
pagination/result count
```

Use deliberate separators and stable geometry. Long URLs, job titles, company names, document names, and identifiers truncate or wrap deliberately rather than stretching the workspace.

## 13. Floating in-page assistant

The assistant remains isolated in Shadow DOM and overlays the host page. Styling isolation is intentional.

It uses the same system:

- 14px control/body text;
- 13px support text;
- 36px controls;
- 6px control radius;
- `#DEDEDE`/`#C9C9C9` structural strokes;
- monochrome primary action;
- semantic color only for real state;
- no glass/background blur;
- no card stack inside the panel;
- one overlay shadow for the panel/launcher layer only.

Internal panel sections are separated by dividers. Fields are transparent at rest. The host page must never be reflowed by the assistant.

## 14. Product interaction rules

Design must preserve the existing safety/consent model.

### Autofill

Expose semantic states such as Ready, Needs review, Unknown, and Sensitive. Never rely on color alone. Review keeps accept/remap/skip behavior where applicable.

### CV import

```text
Choose PDF/DOCX/TXT
-> local extraction
-> deterministic parser
-> review draft/conflicts
-> explicit Apply selected data
```

Selecting a file never silently overwrites the profile.

### Sensitive data

```text
detect sensitive field
-> show label/count only
-> user opens Sensitive view
-> unlock vault if needed
-> explicit current-site fill action
```

Unlocking is not disclosure consent.

### Document attachment

Recommendation never authorizes automatic attachment or submission.

## 15. Copy

Operational copy is factual and short. Prefer state + data + action.

Default budget:

- page subtitle: 0–1 short sentence;
- section description: omit when title/data already explain it;
- helper text: one short line for a non-obvious constraint;
- empty state: one concise sentence + direct action;
- warning: reason + consequence + next action.

Avoid marketing claims, generic AI-assistant language, and repeated explanations of local-first behavior when the interface already makes it clear.

## 16. Responsive, motion, accessibility

- Desktop remains the primary density target for the options workspace.
- Mobile exposes the same core navigation destinations.
- Preserve keyboard access and visible focus states.
- Hover-only navigation expansion has an equivalent focus-within path.
- Color is never the only indicator of critical state.
- Coarse-pointer controls raise targets to at least 44px.
- Respect `prefers-reduced-motion` globally and inside Shadow DOM.
- Avoid noisy live announcements during background/local refresh.

## 17. Explicit anti-patterns

Do not introduce:

- glassmorphism or backdrop blur as generic hierarchy;
- first-level card stacks separated by large gaps;
- alternating neutral section fills;
- decorative shadows on ordinary sections/records;
- route-local button/input palettes;
- route-local control heights;
- rounded containers at every hierarchy level;
- tinted pill badges for ordinary metadata;
- decorative accent colors;
- 10–11px body/helper text everywhere;
- full-page loaders for local operations;
- duplicated navigation/context labels;
- hidden safety/error information for visual cleanliness.

## 18. Ownership and change rule

Before implementing UI/layout/styling work:

1. Read this file.
2. Identify the shared token/primitive/shell that owns the visual behavior.
3. Fix systemic behavior centrally rather than patching many feature files.
4. Keep feature-local overrides only when the workflow is genuinely different.
5. Preserve product behavior, consent boundaries, accessibility, loading, empty, disabled, focus, and error states.
6. Run repository-owned unit tests, typecheck, lint/format checks, and production build appropriate to the affected frontend/extension scope.

The target is one coherent Jobflow workspace: **same neutral fill, structural strokes, semantic color only when meaningful, one control geometry, repeated entities without decorative elevation, and one consistent overlay grammar.**
