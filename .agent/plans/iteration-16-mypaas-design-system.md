# Iteration 16 — MyPaas design-system convergence

## Goal

Refactor Fillio's options/career-profile workspace into a reusable React composition and migrate the workspace styling to Tailwind using the production UI grammar extracted from `howlil/MyPaas`.

## Concrete problem

- the workspace under-uses wide screens
- the navigation rail reads as a detached card instead of application chrome
- options/profile markup and styling are coupled to several large CSS layers
- the same surface grammar is repeated instead of expressed through reusable React composition and one canonical styling system

## Architecture decision

Keep React + WXT. `options.html` remains only the browser-extension mount document; application UI is React.

Do not migrate to Svelte in this iteration. A framework rewrite would touch WXT integration, tests, messaging UI, injected surfaces, and component contracts without solving a measured runtime problem.

## Styling decision

Tailwind is the canonical options/profile styling system for this iteration.

MyPaas design rules being transferred:

- `#fafafa` application background
- white primary surfaces and `#f7f7f7` muted surfaces
- `#e5e5e5` neutral borders and `#d4d4d4` stronger borders
- `#171717` primary ink with restrained muted text
- 6–8px radii
- flat surfaces; elevation reserved for overlays
- dense 36–40px pointer controls while retaining 44px coarse-pointer targets
- visible focus states
- responsive wide shell with compact gutters
- semantic colors only where state meaning requires them

## Implementation

- configure Tailwind for React/WXT source paths
- add MyPaas-derived theme values in `tailwind.config.ts`
- use `src/ui/design-system/tailwind.css` as the options/profile design source of truth
- introduce reusable React `WorkspaceFrame`
- keep `WorkspaceNavigation` reusable and responsive using Tailwind utilities
- compose options surfaces through React instead of repeated top-level HTML chrome
- retire legacy `tokens.css`, `primitives.css`, `profile-compact.css`, and the temporary `mypaas-workspace.css`
- reduce the old `profile.css` import to a compatibility shim while the large ProfilePage is split incrementally
- preserve all profile, CV, vault, correction, backup, and application-variant behavior

## Scope boundary

Popup CSS and content-script Shadow-DOM styles are separate extension surfaces. Tailwind utilities do not automatically cross Shadow DOM boundaries, so they require their own verification slice rather than being silently coupled to this options/profile migration.

## Safety invariants

- no auto-submit, auto-next, or auto-apply
- no automatic file attachment
- document attachment remains explicit
- sensitive values remain behind vault unlock and explicit disclosure/fill approval
- no browser permission changes
- no storage-schema changes
- no backend/network dependency added

## Verification

Before merge:

```text
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm verify:compatibility
pnpm build
pnpm verify:manifest
```

Also perform browser visual/E2E validation on desktop and mobile. Do not claim completion while CI or browser verification is outstanding.
