# Current Work State

This file contains only the state needed to resume work safely. It is not an iteration history, roadmap, status-report archive, or source of product authorization.

## Flow policy

- Product WIP target: **1 logical change**.
- An iteration name is optional metadata; it never defines branch lifetime or release scope.
- Finished history belongs to Git/PRs/releases, not this file.
- Do not add command transcripts, screenshots, checkpoint logs, or completed iteration narratives here.
- A next candidate is context only. It does **not** authorize implementation or product-scope change without matching user intent.

## Active product change

None. `master` is synchronized after the options dashboard/Tailwind cleanup and testing-policy alignment.

## Current integrated state

- profile workspace streamlining and autosave are integrated
- the options surface uses one reusable dashboard shell with sidebar, topbar, and main content
- options/profile layout composition uses Tailwind utilities in React; `tailwind.css` is limited to base rules and stable repeated primitives/form grammar
- the obsolete `profile.css` compatibility shim is removed
- testing policy is risk/signal/cost based; TDD is optional rather than ceremonial
- `ProfileFormSections.tsx` remains a large implementation hotspot; do not claim that full per-section modular decomposition is complete

## Uncommitted candidate context

An end-to-end `JobApplication` pipeline has been discussed as a possible next product direction. The current product contract still lists an application tracker as a non-goal.

This candidate is **not an active requirement**. If the user explicitly chooses that direction, update `requirements.md` in the same logical change before or with implementation, then execute the canonical lifecycle.
