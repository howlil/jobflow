# Jobflow Quality

This file defines repository-specific verification and release-ready gates. Verification is risk-based: use the cheapest deterministic evidence that protects a realistic regression, and do not add process layers merely because they can be automated.

## Toolchain baseline

- Package manager: `pnpm@11.21.0`
- Repository Node engine: `>=22.13.0`
- CI Node: `24`
- Unit/component tests: Vitest
- Browser acceptance: Playwright Chromium, opt-in diagnostic only
- Type checking: TypeScript `tsc --noEmit`
- Lint: ESLint with zero warnings
- Formatting: Prettier
- Build/package: WXT

## Local verification

Run the smallest direct checks justified by the changed surface. Common commands:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm verify:manifest
```

Use `pnpm format` to apply repository formatting. Avoid wrapper scripts that infer affected checks when the underlying commands are already cheap and explicit in this single-package repository.

## Mandatory CI integration gate

For non-draft pull requests to `master`, and pushes to `master`, `.github/workflows/ci.yml` runs:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm verify:manifest
```

Browser black-box E2E (`pnpm test:e2e`) is not a mandatory merge or release blocker. Compatibility documentation is also not a synthetic CI gate; compatibility claims require evidence from the relevant implementation tests, fixtures, or targeted runtime validation.

Do not claim a gate passed unless it was observed on the relevant head.

## Verification ownership by risk

### Pure domain/application behavior

Prefer focused Vitest coverage for:

- schema validation and migrations
- profile/variant resolution
- matching and confidence policy
- correction precedence
- fill-plan policy
- application lifecycle/state transitions
- deterministic next-action guidance
- crypto envelope functions where browser runtime semantics are not the distinct risk

### DOM / browser semantics

Use focused DOM checks first. Run browser acceptance selectively when the distinct risk cannot be established below the black-box boundary, including:

- unpacked extension/bootstrap behavior
- Manifest V3 lifecycle behavior
- user-triggered fill in the real extension runtime
- vault disclosure/auto-lock runtime boundary
- browser-only event or messaging behavior that focused tests cannot reproduce faithfully

A browser E2E failure is diagnostic evidence, not by itself a release blocker, unless an explicit future product/release decision promotes that exact behavior into a mandatory gate.

### Persistence and migrations

Persisted-schema changes require evidence that supported historical data migrates without loss or invalid state. Migration code is compatibility code, not cleanup debt, while supported persisted versions still depend on it.

### Permissions / generated manifest

Changes to WXT manifest configuration, host permissions, browser permissions, entrypoints, or extension packaging require:

```bash
pnpm build
pnpm verify:manifest
```

Permission expansion is a product/security boundary and requires the appropriate approval before implementation.

### Autofill compatibility

Changes to field scanning, aliases, matching/confidence behavior, fill policy, corrections, or compatibility fixtures require the smallest focused regression cases that protect the intended behavior or collision risk. Use real fixture/runtime evidence for compatibility claims; do not treat status metadata as proof of runtime compatibility.

### Sensitive data / vault

Vault, crypto, disclosure, or privacy-boundary changes require strong positive and negative evidence as applicable, including wrong-passphrase, tamper, lock, and unapproved-disclosure behavior. Do not mock away the cryptographic primitive when the test is intended to establish vault correctness.

### UI / design

Presentation-only styling, layout, static markup, and copy do not require new unit/E2E tests merely because React files changed. Verify affected interaction and representative viewport states when visual/runtime risk exists.

For UI release claims, use `.agents/DESIGN.md`; source inspection alone is not visual-release evidence.

## Browser diagnostics

`pnpm test:e2e` keeps the repository's extension smoke and acceptance journeys available for targeted diagnosis. `pnpm test:e2e:smoke` is the cheaper bootstrap-only path.

These commands are opt-in. Use them only when browser-runtime evidence is worth the cost.

## Release-ready criteria

A logical change is release-ready when:

- the authorized observable outcome is satisfied
- no in-scope blocker remains
- relevant focused verification is green
- mandatory integration gates are green on the exact head
- persisted-data, permission, privacy, compatibility, and browser risks have proportionate evidence when touched
- canonical project/architecture/iteration documentation is updated only where its source of truth changed

Release-ready is not the same as distributed. Actual release mechanics are owned by `.agents/RELEASE.md`.

## Release workflow gate

Tags matching `v*` trigger `.github/workflows/release.yml`, which repeats the mandatory deterministic gate, packages with `pnpm zip`, creates SHA-256 checksums, and publishes an immutable GitHub release from the verified tag. Browser black-box E2E remains opt-in.
