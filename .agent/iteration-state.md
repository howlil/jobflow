# Current Work State

This file contains only the state needed to resume work safely. It is not an iteration history, roadmap, status-report archive, or source of product authorization.

## Flow policy

- Product WIP target: **1 logical change**.
- An iteration name is optional metadata; it never defines branch lifetime or release scope.
- Finished history belongs to Git/PRs/releases, not this file.
- Do not add command transcripts, screenshots, checkpoint logs, or completed iteration narratives here.
- A next candidate is context only. It does **not** authorize implementation or product-scope change without matching user intent.

## Active product change

None. Current work remains inside the existing Job Flow product contract.

## Current integrated state

- profile workspace streamlining and autosave are integrated
- the options surface uses one reusable dashboard shell with sidebar, topbar, and fluid responsive main content that continues to use wide-monitor space
- workspace navigation is visually grouped into profile, application, and privacy/data areas; Skills is no longer a standalone workspace route
- major editable workspace sections use one restrained bordered collapsible-card contract with contextual help; repeated editable records keep their own nested record boundary only when they represent a real entity
- exact calendar dates use native date controls and career date ranges use native month controls, with legacy values normalized at the input boundary
- Experience and Projects are the user-facing skill-authoring sources; the active skill inventory is the case-insensitive unique union of their linked skills
- skill entry uses one autosuggest field with Enter/comma-to-chip interaction; skill level and years-of-experience are not user-facing fields
- the persisted professional skill registry remains only as a compatibility/stable-ID index; registry-only entries are not active career skills
- CV import does not create standalone skills or fabricate skill-to-Experience/Project relationships
- repeatable record CRUD actions use one compact icon-button size/tone contract; section add actions and item remove actions no longer invent local button shapes
- the Sensitive Vault uses the same React control, section, status, and action primitives as the rest of the workspace
- profile autosave status is surfaced in the workspace topbar instead of a separate content strip
- options/profile layout composition uses Tailwind utilities in React; `tailwind.css` is limited to base rules and compatibility grammar for call sites not yet expressed through React primitives
- the obsolete `profile.css` compatibility shim is removed
- testing policy is risk/signal/cost based; TDD is optional rather than ceremonial
- CV import orchestration is owned by the application layer rather than React/infrastructure coupling
- the Documents workspace treats resumes as stored local files; metadata remains the persisted reference contract but users cannot create metadata-only resume entries
- content-script semantic page analysis is owned by the application layer while the content entrypoint remains the browser/runtime shell
- page-context document analysis uses `documentFields` as the single source of truth for detected upload fields and recommendations
- `ProfileFormSections.tsx` is composition-only; profile editing surfaces are separated into cohesive owner modules
- career records preserve one experience surface while languages, certifications, and projects have independent UI ownership
- normal canonical autofill fields are defined once in `canonical-fields.ts`; runtime validation and compile-time consumers share that source
- the floating assistant uses the canonical neutral visual tokens and presents human-readable canonical-field labels

## Uncommitted candidate context

An end-to-end `JobApplication` pipeline has been discussed as a possible future product direction. The current product contract still lists an application tracker as a non-goal.

This candidate is **not an active requirement**. If the user explicitly chooses that direction, update `requirements.md` in the same logical change before or with implementation, then execute the canonical lifecycle.
