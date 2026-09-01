# Jobflow Quality

This file defines repository-specific verification and release-ready gates. Use risk-based verification; do not mechanically add tests or run expensive layers when they do not protect a realistic regression.

## Toolchain baseline

- Package manager: `pnpm@11.21.0`
- Repository Node engine: `>=22.13.0`
- CI Node: `24`
- Unit/component tests: Vitest
- Browser acceptance: Playwright Chromium through repository E2E scripts
- Type checking: TypeScript `tsc --noEmit`
- Lint: ESLint with zero warnings
- Formatting: Prettier
- Build/package: WXT

## Fast affected preflight

Use the smallest deterministic checks that cover the changed surface before relying on remote CI as the first debugger.

Repository helper:

```bash
pnpm preflight:affected
```

When more explicit checks are useful:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
```

Use `pnpm format` to apply repository formatting rather than approximating it manually.

## Mandatory CI integration gate

For non-draft pull requests to `master`, `.github/workflows/ci.yml` runs:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm verify:compatibility
pnpm build
pnpm verify:manifest
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

Pushes to `master` run the same verification including browser acceptance.

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

Use focused DOM or browser acceptance when the distinct risk involves:

- label/context extraction
- native setter/event behavior
- select/radio/checkbox filling
- dynamic DOM additions/rescans
- content/background messaging
- unpacked extension/bootstrap behavior
- Manifest V3 lifecycle behavior
- user-triggered fill in the real extension runtime
- vault disclosure/auto-lock runtime boundary

### Persistence and migrations

Persisted-schema changes require evidence that supported historical data migrates without loss or invalid state. Verify failure/compatibility paths proportionally to the changed schema.

### Permissions / generated manifest

Changes to WXT manifest configuration, host permissions, browser permissions, entrypoints, or extension packaging require:

```bash
pnpm build
pnpm verify:manifest
```

Permission expansion is also a product/security boundary and requires the appropriate approval before implementation.

### Autofill compatibility

Changes to shared field scanning, canonical aliases, matching/confidence behavior, fill policy, corrections, or compatibility fixtures require:

```bash
pnpm verify:compatibility
```

plus the smallest focused regression cases that protect the intended behavior/collision risk.

### Sensitive data / vault

Vault, crypto, disclosure, or privacy-boundary changes require strong positive and negative evidence as applicable, including wrong-passphrase/tamper/lock/unapproved-disclosure behavior. Do not mock away the cryptographic primitive when the test is intended to establish vault correctness.

### UI / design

Presentation-only styling, layout, static markup, and copy do not require new unit/E2E tests merely because React files changed. Verify the affected interaction and representative viewport(s) when visual/runtime risk exists.

For UI release claims, use the relevant design checks in `.agents/DESIGN.md`; source inspection alone is not visual-release evidence.

## Browser acceptance suite

`pnpm test:e2e` currently covers the repository's extension smoke and acceptance scripts, including autofill, vault, UI/workspace/CV, and application-pipeline journeys.

Use `pnpm test:e2e:smoke` when only extension bootstrap/smoke coverage is justified during a local fast loop. The full CI/release gate still follows repository policy.

## Release-ready criteria

A logical change is release-ready when:

- the authorized observable outcome is satisfied
- no in-scope blocker remains
- relevant focused verification is green
- mandatory integration gates are green on the exact head
- persisted-data, permission, privacy, compatibility, and browser risks have their required evidence when touched
- canonical project/architecture/iteration documentation is updated only where its source of truth changed

Release-ready is not the same as distributed. Actual release mechanics are owned by `.agents/RELEASE.md`.

## Release workflow gate

Tags matching `v*` trigger `.github/workflows/release.yml`, which repeats the full verification gate, installs Chromium, runs `pnpm test:e2e`, packages with `pnpm zip`, creates SHA-256 checksums, and publishes an immutable GitHub release from the verified tag.