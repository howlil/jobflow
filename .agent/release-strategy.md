# Release Strategy

Job Flow is a fast-moving `0.x` browser-extension product. Releases should be small, reproducible, and boring.

## Lifecycle boundary

Do not conflate integration, release readiness, distribution, and observation.

```text
IMPLEMENT
 -> VERIFY
 -> QUALITY GATES
 -> RELEASE READY
 -> STOP

explicit release/distribution decision
 -> RELEASE
 -> real use / observation when useful
 -> evidence
 -> recommend keep | iterate | revert | remove | investigate
 -> user product decision
```

`master` is the integration source of truth and a potential release candidate. A merge to `master` is **not automatically a release** and does not automatically create a product-observation task.

Actual distribution/release follows explicit user intent or an already-established release automation/policy. The user owns the final product/release decision.

## Versioning

Use Semantic Versioning with `0.x` expectations:

- `0.MINOR.0` — meaningful user capability or intentionally breaking behavior with safe migration
- `0.x.PATCH` — bug/security/compatibility fix without intentional feature expansion
- prerelease suffix (`-alpha.N`, `-beta.N`) for trusted testing when useful

Use one canonical version source. Do not create version-bump commits for every development change.

## Quality gates

Quality gates exist to control release/integration risk, not to maximize checks.

### Baseline integration gates

Run the repository checks that are mandatory for the affected codebase and branch protection, such as typecheck, lint/format, build, and generated-manifest/permission validation where applicable.

Existing CI may execute a broader suite mechanically. That does not mean every change must add tests or browser coverage.

### Risk-specific gates

Add only the checks justified by the change, for example:

- deterministic domain/storage tests for invariants or regressions
- migration/data-integrity evidence for persisted schema changes
- security/negative-path checks for vault/privacy-sensitive changes
- browser/runtime acceptance when browser semantics are part of the changed risk
- compatibility fixtures when autofill/matcher compatibility is affected
- permission review when manifest/host permission behavior changes

Presentation-only layout/copy/static-markup changes do not require new automated tests merely because they affect UI files.

### Release tag / distribution

When an actual release is requested, fail closed on the release-critical path appropriate to the product, including locked dependency install, production build, generated manifest/permission verification, required existing regression suites, browser smoke/acceptance for critical runtime journeys, packaging, checksum, and immutable release artifact creation.

Schema/permission/vault/privacy changes require their relevant focused evidence in addition to generic release mechanics.

## Instrumentation and observation

Instrumentation is not automatically required before release.

Before a meaningful release, ask whether additional evidence is necessary to evaluate the expected product outcome. Prefer existing privacy-safe evidence, deterministic fixtures, direct observation, or opt-in trusted-beta feedback when sufficient.

After actual release or meaningful real-world use, observe only what helps answer a product/technical question, for example:

- technical health
- user behavior/friction
- expected product outcome

Compare evidence with the expected outcome and recommend one of:

- keep
- iterate
- revert
- remove
- investigate

The recommendation does not authorize the next product change. The user owns that decision.

## Release notes

Keep them user-oriented and short:

- Added
- Fixed
- Security/Privacy changes
- Known limitations when material

Explicitly call out new browser permissions, stored-data migration, sensitive-data behavior, or compatibility changes that can affect autofill.

## Rollback

Never mutate an already tagged release. Fix on current `master`, verify according to risk, and publish a new patch version when distribution is required.

Persisted-data changes must be designed so users on older distributed versions are not casually destroyed by upgrade/rollback timing.

Do not add release-please, changesets, multi-channel deployment machinery, store automation, analytics, or release infrastructure until actual release cadence/operational evidence makes the simpler path a measured burden.
