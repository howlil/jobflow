# Iteration 15 — Surface refactor

## Goal

Fix the two primary UX surfaces without changing Fillio's safety boundaries:

- career/profile editing opens as a normal full browser tab
- job-page assistance becomes a fixed right-edge launcher with an explicit right slide panel
- remove decorative SaaS/AI styling in favor of compact monochrome utility UI

## Decisions

- Keep the job-page assistant in the content script rather than using the browser Side Panel API so it remains contextual to the active application page.
- Use `position: fixed` for viewport overlay behavior; do not insert the assistant into the website layout.
- The launcher is vertically centered on the right edge and expands only after explicit click.
- The expanded assistant occupies the right viewport edge from top to bottom and has its own internal scroll.
- The options workspace uses WXT `manifest.open_in_tab` so extension settings open as a full tab.
- Remove the duplicate marketing hero from the workspace; profile content is the main hierarchy.
- Use monochrome product actions and reserve semantic color for warning/success/danger states.
- Reduce pills, rounded cards, large radii, and decorative empty space.

## Safety invariants

- no auto-submit, auto-next, or auto-apply
- no automatic file attachment
- document attachment requires explicit user click
- sensitive values remain behind vault unlock and site-specific explicit fill approval
- local-first storage and processing boundaries remain unchanged

## Verification

Fast merge gates:

- unit tests
- TypeScript
- lint
- formatting
- compatibility evidence
- production build
- generated extension/manifest verification

Browser E2E remains in the repository but is explicitly non-blocking for this development merge. It is still required before release readiness is claimed.
