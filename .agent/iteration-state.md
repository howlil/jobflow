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
- the options surface uses one reusable dashboard shell with sidebar, topbar, and main content
- workspace navigation is visually grouped into profile, application, and privacy/data areas without changing section routing
- profile content uses editorial section separators while record objects and operational tools retain explicit boundaries
- profile autosave status is surfaced in the workspace topbar instead of a separate content strip
- options/profile layout composition uses Tailwind utilities in React; `tailwind.css` is limited to base rules and stable repeated primitives/form grammar
- the obsolete `profile.css` compatibility shim is removed
- testing policy is risk/signal/cost based; TDD is optional rather than ceremonial
- CV import orchestration is owned by the application layer rather than React/infrastructure coupling
- content-script semantic page analysis is owned by the application layer while the content entrypoint remains the browser/runtime shell
- page-context document analysis uses `documentFields` as the single source of truth for detected upload fields and recommendations
- `ProfileFormSections.tsx` is composition-only; profile editing surfaces are separated into cohesive owner modules
- career records preserve one experience surface while languages, certifications, and projects have independent UI ownership
- normal canonical autofill fields are defined once in `canonical-fields.ts`; runtime validation and compile-time consumers share that source
- the floating assistant uses the canonical neutral visual tokens and presents human-readable canonical-field labels

## Uncommitted candidate context

An end-to-end `JobApplication` pipeline has been discussed as a possible future product direction. The current product contract still lists an application tracker as a non-goal.

This candidate is **not an active requirement**. If the user explicitly chooses that direction, update `requirements.md` in the same logical change before or with implementation, then execute the canonical lifecycle.
