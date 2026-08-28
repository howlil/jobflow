# Current Work State

This file contains only the state needed to resume work safely. It is not an iteration history, roadmap, or status report archive.

## Flow policy

- Product WIP target: **1 logical change**.
- An iteration name is optional metadata; it never defines branch lifetime or release scope.
- Finished history belongs to Git/PRs/releases, not this file.
- Do not add command transcripts, screenshots, checkpoint logs, or completed iteration narratives here.

## Active product change

None. `master` is synchronized after the options dashboard and Tailwind cleanup.

## Current integrated state

- profile workspace streamlining and autosave are integrated
- the options surface uses one reusable dashboard shell with sidebar, topbar, and main content
- options/profile layout composition uses Tailwind utilities in React; `tailwind.css` is limited to base rules and stable repeated primitives/form grammar
- the obsolete `profile.css` compatibility shim is removed
- `ProfileFormSections.tsx` remains a large implementation hotspot; do not claim that full per-section modular decomposition is complete

## Next candidate

Define the product contract for an end-to-end `JobApplication` pipeline before implementation. The current requirements still list an application tracker as a non-goal, so that contract must be changed explicitly before tracker work starts.
