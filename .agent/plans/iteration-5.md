# Iteration 5 — MVP Hardening And Release Prep

**Goal:** harden the verified Chromium MVP enough for a first `0.x` release candidate without adding backend, sync, analytics, AI, site adapters, auto-submit, or new permissions.

## Checklist

- [x] Expand representative local/global career-form matcher corpus.
- [x] Keep sensitive/file fields fail-closed in the expanded corpus.
- [x] Extract reusable generated-manifest permission/entrypoint verification.
- [x] Wire manifest verification into package scripts and CI.
- [x] Add README with local setup, prototype loading, verification, privacy/security behavior, and release constraints.
- [x] Preserve extension permission surface: `storage` only, no `host_permissions`.
- [x] Normalize repository-wide formatting baseline before enforcing `pnpm format:check` as a required final gate.
- [ ] Open PR, observe CI, squash merge, and verify fresh `master`.
- [ ] Create first `0.x` tag only after verified `master` is clean.

## Final Local Evidence

- `pnpm install --frozen-lockfile` passes.
- `pnpm test` passes: 27 files / 118 tests.
- `pnpm typecheck` passes.
- `pnpm lint` passes.
- `pnpm format:check` passes.
- `pnpm build` passes.
- `pnpm verify:manifest` passes.
- `pnpm test:e2e` passes: legacy smoke, Iteration 3 acceptance, Iteration 4 vault acceptance.
- `pnpm zip` passes and produces `.output/fillio-0.1.0-chrome.zip`.
- `git diff --check` passes.
