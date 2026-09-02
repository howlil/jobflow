# Jobflow Quality

This file maps the user's global proportional-verification rule onto Jobflow's actual toolchain and risk boundaries. Generic testing philosophy is not redefined here.

Core repository rule: use the cheapest deterministic evidence that can observe the changed behavior. Escalate only when a realistic material failure would remain invisible at the cheaper layer. Existing CI is an integration mechanism, not a requirement to manually run every test layer for every local change.

## Toolchain Baseline

- Package manager: `pnpm@11.21.0`
- Repository Node engine: `>=22.13.0`
- CI Node: `24`
- Unit/domain/component tests: Vitest
- Browser acceptance: Playwright Chromium, selective diagnostic evidence
- Type checking: TypeScript `tsc --noEmit`
- Lint: ESLint with zero warnings
- Formatting: Prettier
- Build/package: WXT

## Verification Selection

For each logical change, determine:

1. what observable behavior changed;
2. which boundary can realistically fail;
3. the cheapest check that observes that boundary;
4. what material failure would still be invisible after that check.

Only escalate when #4 is material.

Typical order for this repository:

```text
static/type/lint/build evidence
        -> focused Vitest/domain behavior
        -> focused DOM/integration evidence
        -> real extension/browser E2E
```

This is an escalation order, not a mandatory ladder.

## Local Verification

Run only the checks justified by the changed surface. Common commands:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm verify:manifest
```

Use `pnpm format` to apply repository formatting.

Do not automatically run all commands above after every edit. For example, a presentation-only change may need formatting/build/visual inspection but no new unit or browser test; a pure matcher policy change usually needs focused Vitest evidence before broader checks; permission/manifest work requires build plus manifest verification.

## Repository CI Baseline

For non-draft pull requests to `master`, and pushes to `master`, `.github/workflows/ci.yml` currently runs:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm verify:manifest
```

Treat this as the repository's mechanical integration baseline. Do not manually reproduce the full CI sequence merely for ceremony when focused local evidence already establishes the changed behavior; integration CI can provide the broad deterministic safety net.

Do not claim CI or another gate passed unless it was observed on the relevant head.

Browser black-box E2E (`pnpm test:e2e`) is not a default merge blocker. Promote a browser journey to required evidence only when the changed risk specifically depends on real extension/browser runtime semantics or an explicit future repository decision makes it mandatory.

## Risk-to-Evidence Mapping

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

Use focused DOM evidence before full browser E2E when it can prove the behavior. Escalate to browser acceptance only when the distinct risk includes something such as:

- unpacked extension/bootstrap behavior
- Manifest V3 lifecycle semantics
- user-triggered fill in the real extension runtime
- vault disclosure/auto-lock runtime behavior
- browser-only event or messaging behavior that focused tests cannot reproduce faithfully

A browser E2E failure is diagnostic evidence. It becomes a release blocker only when that exact browser/runtime behavior is material to the authorized change or explicitly required by repository policy.

### Persistence and migrations

Persisted-schema changes require evidence that supported historical data migrates without loss or invalid state. Migration code remains compatibility code while supported persisted versions depend on it.

### Permissions / generated manifest

Changes to WXT manifest configuration, host permissions, browser permissions, entrypoints, or extension packaging require:

```bash
pnpm build
pnpm verify:manifest
```

Permission expansion is a product/security boundary and requires authorization when not already included in the user's request.

### Autofill compatibility

Changes to scanning, aliases, matching/confidence behavior, fill policy, corrections, or compatibility fixtures require the smallest focused regression cases that protect the intended behavior or realistic collision risk. Use real fixture/runtime evidence for compatibility claims; status metadata alone is not runtime proof.

### Sensitive data / vault

Vault, crypto, disclosure, or privacy-boundary changes justify stronger positive and negative evidence as applicable, including wrong-passphrase, tamper, lock, and unapproved-disclosure behavior. Do not mock away the cryptographic primitive when the test is intended to establish vault correctness.

### UI / design

Presentation-only styling, layout, static markup, and copy do not require new unit/E2E tests merely because React files changed. Verify affected interaction and representative viewport states when visual/runtime risk exists.

For UI release claims, use `.agents/DESIGN.md`; source inspection alone is not visual-release evidence.

## Browser Diagnostics

`pnpm test:e2e` keeps extension smoke and acceptance journeys available for targeted diagnosis. `pnpm test:e2e:smoke` is the cheaper bootstrap-only path.

Use these only when browser-runtime evidence is worth the cost.

## Release-Ready Evidence

A logical change or milestone is release-ready when:

- the authorized observable outcome is satisfied;
- no in-scope blocker remains;
- the selected focused verification is green;
- repository-required integration CI is green on the exact integrated head when that integration path runs CI;
- persisted-data, permission, privacy, compatibility, security, and browser risks have proportionate evidence when touched;
- canonical project/architecture/current-state documentation is updated only where its source of truth changed.

Release-ready is not the same as distributed. Actual release mechanics are owned by `.agents/RELEASE.md`.

## Release Workflow

Tags matching `v*` trigger `.github/workflows/release.yml`, which runs the repository deterministic baseline, packages with `pnpm zip`, creates SHA-256 checksums, and publishes an immutable GitHub release from the verified tag.

Browser E2E and compatibility-specific validation remain risk-based rather than unconditional release ceremony.
