# Jobflow Quality

This file maps the user's canonical proportional-verification rule onto Jobflow's actual toolchain and risk boundaries. Generic testing philosophy is not redefined here.

## Quality objective

Optimize for **fast, trustworthy feedback on material behavior**. Verification exists to detect realistic regressions, not to maximize test count, gate count, CI duration, or ceremony.

For every logical change:

1. identify the observable behavior that changed;
2. identify the boundary that could realistically fail;
3. choose the cheapest deterministic evidence that observes that boundary;
4. escalate only when a material failure remains invisible;
5. stop once the authorized outcome is proven and repository integration is green.

Do not add a test layer merely because a file type changed. Do not remove meaningful evidence merely to make CI green or fast.

## Toolchain baseline

- Package manager: `pnpm@11.21.0`
- Repository Node engine: `>=22.13.0`
- CI Node: `24`
- Domain/component/DOM tests: Vitest
- Browser acceptance: Playwright/Chromium scripts, selective risk-based evidence
- Type checking: TypeScript `tsc --noEmit`
- Lint: ESLint with zero warnings
- Formatting: Prettier
- Build/package: WXT

## Verification selection

Typical escalation order:

```text
focused static or focused Vitest evidence
        -> focused DOM/integration evidence
        -> build/package boundary
        -> real extension/browser acceptance
```

This is **not** a mandatory ladder. Start at the cheapest layer capable of seeing the actual risk.

### Pure domain/application behavior

Prefer focused Vitest evidence for:

- schema validation and migrations
- profile/variant resolution
- matching/confidence policy
- correction precedence
- fill-plan policy
- application lifecycle/state transitions
- deterministic next-action guidance
- crypto-envelope behavior where browser runtime semantics are not the distinct risk

### DOM/browser semantics

Prefer focused DOM evidence when jsdom can faithfully observe the behavior. Escalate to browser acceptance only when the risk specifically depends on:

- unpacked extension/bootstrap behavior
- Manifest V3 lifecycle semantics
- real content-script/browser messaging behavior
- user-triggered fill in the real extension runtime
- vault disclosure/auto-lock browser behavior
- browser-only event semantics that focused tests cannot reproduce faithfully

`pnpm test:e2e` is diagnostic/risk-based evidence, not an unconditional merge gate. `pnpm test:e2e:smoke` is the cheaper bootstrap-only path.

### Persistence/migrations

Persisted-schema changes require evidence that supported historical data migrates without loss or invalid state. Migration code remains compatibility code while supported stored versions depend on it.

### Permissions/generated manifest

Changes to WXT manifest configuration, host/browser permissions, entrypoints, or extension packaging require:

```bash
pnpm build
pnpm verify:manifest
```

Permission expansion is a product/security boundary and requires authorization when not already included in the user's request.

### Autofill compatibility

Scanning, aliases, matching/confidence, fill policy, correction memory, repeated-record handling, custom controls, or compatibility fixtures require the smallest realistic regression cases that protect the intended behavior and collision risk. Fixture metadata alone is not runtime proof.

### Sensitive data/vault

Vault, crypto, disclosure, and privacy-boundary work justifies stronger positive and negative evidence as applicable: wrong passphrase, tamper, lock, and unapproved disclosure. Do not mock away the cryptographic primitive when the test claims vault correctness.

### UI/design changes

Use `.agents/DESIGN.md` as the UI acceptance authority.

- CSS/layout/copy/static-markup changes do **not** require new unit or E2E tests merely because React files changed.
- Interaction/state/accessibility behavior changes require focused behavioral evidence at the owning boundary.
- Visual release claims require representative visual inspection/screenshots for the changed states and widths; source inspection or snapshot-count inflation is not visual proof.
- Avoid brittle tests for exact spacing, class lists, implementation details, decorative wrappers, or text that is not a product contract.
- Test stable semantics: user action, state transition, accessible role/name where intentional, persistence, error/recovery behavior, and security/privacy boundaries.

## Local verification

Run only commands justified by the changed surface. Available commands:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm verify:manifest
pnpm test:e2e:smoke
pnpm test:e2e
```

Use `pnpm format` to apply repository formatting.

Examples:

- matcher/domain policy: focused Vitest first; broader CI supplies integration evidence;
- presentation-only UI: format/build plus representative visual inspection when relevant; no invented unit test requirement;
- interaction UI: focused component/DOM behavior plus representative visual state;
- manifest/permission/entrypoint: build + manifest verification;
- persisted schema: migration compatibility tests;
- browser-runtime lifecycle: focused browser acceptance only when that runtime is the distinct risk.

Do not manually replay the entire CI suite after every small edit when focused evidence already proves the logical change.

## CI architecture

`.github/workflows/ci.yml` preserves one required branch-protection context: **`verify`**.

The job is intentionally optimized for signal latency without reducing runtime coverage:

```text
checkout + classify change
        |
        |-- documentation/agent-knowledge-only PR
        |      -> fast verify success; no dependency install/runtime suite
        |
        `-- runtime-affecting PR or any push to master
               -> frozen install
               -> parallel lanes
                    A: Vitest behavior suite
                    B: typecheck -> lint -> format -> WXT build
               -> generated manifest verification
```

### Why this shape

- Vitest is the longest deterministic lane and does not need to wait for lint/type/build.
- Static/build checks remain ordered inside one lane so logs and ownership stay simple.
- Build remains part of runtime integration evidence.
- Manifest verification remains after a successful build.
- The required `verify` context is preserved, so branch protection cannot accidentally ignore a failing parallel job.
- CI does not use path-based skipping for runtime source files because classifying interaction risk from extensions alone is unreliable.

### Documentation-only classification

On pull requests, runtime verification may be skipped only when every changed path is Markdown or under `.agents/`. This is safe because those files do not affect the shipped extension artifact.

Any non-document path forces full runtime verification. Pushes to `master` always run the full runtime suite regardless of changed paths.

Do not broaden the skip classifier to source/config/package/workflow files without proving the new classifier cannot hide a runtime regression.

## CI performance rules

When evolving CI:

- optimize **time-to-first-useful-failure** and total merge feedback latency;
- keep deterministic independent work concurrent when correctness allows it;
- preserve frozen dependency installation and package-manager caching;
- prefer existing repository tooling over introducing a CI-only dependency;
- avoid duplicate test suites that prove the same boundary;
- do not make expensive browser E2E unconditional unless browser semantics become a universal release risk;
- do not split checks into many jobs when repeated setup/runner startup costs more than the parallelism saves;
- preserve the required `verify` check unless branch protection is intentionally migrated in the same authorized change;
- never treat skipped, stale-head, cancelled, or unrelated CI as evidence for the candidate being merged.

A new mandatory gate must answer: **which realistic regression can this catch that existing cheaper evidence cannot?** If there is no material answer, do not add the gate.

## Release-ready evidence

A logical change or milestone is release-ready when:

- the authorized observable outcome is satisfied;
- no in-scope blocker remains;
- selected focused verification is green;
- required repository CI is green on the exact integrated head;
- persistence, permission, privacy, compatibility, security, browser, and visual risks have proportional evidence when touched;
- canonical project/architecture/current-state documentation is updated only when its source of truth changed.

Release-ready is not the same as distributed. Actual release mechanics are owned by `.agents/RELEASE.md`.

## Release workflow

Tags matching `v*` trigger `.github/workflows/release.yml`, which runs the deterministic release baseline, packages with `pnpm zip`, creates SHA-256 checksums, and publishes an immutable GitHub release from the verified tag.

Browser E2E and compatibility-specific validation remain risk-based rather than unconditional release ceremony.
