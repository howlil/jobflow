# Jobflow Release

Jobflow is a `0.x` browser extension. Integration, release readiness, and distribution are separate states.

## Integration source of truth

- `master` is the protected integration branch.
- Repository configuration permits squash merge and does not permit merge commits or rebase merge.
- A merge to `master` is not automatically a product release.
- Short-lived branches/PRs are integration tools; milestone or work-item names do not define branch lifetime.

## Versioning

Use Semantic Versioning with `0.x` expectations:

- `0.MINOR.0` for a meaningful user capability or intentionally breaking behavior with a safe migration path.
- `0.x.PATCH` for a bug, security, or compatibility fix without intentional feature expansion.
- Prerelease suffixes such as `-alpha.N` or `-beta.N` may be used for trusted distribution when useful.

Use one canonical version source. Do not bump versions for every development change.

## Release trigger

Tags matching `v*` trigger `.github/workflows/release.yml`.

The mandatory release workflow is intentionally small:

```text
checkout
 -> pnpm install --frozen-lockfile
 -> pnpm test
 -> pnpm typecheck
 -> pnpm lint
 -> pnpm format:check
 -> pnpm build
 -> pnpm verify:manifest
 -> pnpm zip
 -> create SHA256SUMS
 -> publish immutable GitHub release from the verified tag
```

Manual acceptance testing, browser E2E/black-box testing, live-browser verification, and manual visual review are not release qualification gates. When a release touches a browser/runtime-specific boundary, use deterministic repository-owned tests around the owned contract and document any residual environment risk that cannot be automated.

Do not claim a release exists unless the tag/workflow/release artifact was actually observed.

## Release-critical review

In addition to baseline quality gates, require relevant automated focused evidence when a release touches:

- persisted schema/migrations
- browser permission or generated-manifest behavior
- vault/crypto/sensitive disclosure
- privacy/network/data-flow boundaries
- shared autofill/matcher compatibility
- cross-runtime message, storage, or lifecycle contracts owned by the repository

## Release notes

Keep notes user-oriented and short:

- Added
- Fixed
- Security / Privacy when relevant
- Known limitations when material

Explicitly call out new browser permissions, persisted-data migration, sensitive-data behavior, or compatibility changes that can materially affect users.

## Rollback / correction

Do not mutate an already published tag/release. Fix from current `master`, verify according to risk, then publish a new patch version when distribution is required.

Persisted-data changes must be designed so upgrade/rollback timing does not casually destroy user data.

## Release infrastructure boundary

Do not introduce release trains, store automation, release-please/changesets, multi-channel machinery, analytics, or additional publishing infrastructure without current evidence that the existing tag → verified artifact → GitHub release path is insufficient.
