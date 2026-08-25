# Release Strategy

Fillio is a fast-moving `0.x` browser-extension product. Releases should be small, reproducible, and boring.

## Release model

`master` is always the next release candidate. There are no release branches and no feature trains.

```text
small change
 -> ready PR verification
 -> squash merge to master
 -> observe
 -> tag a verified master commit when distribution is useful
 -> full release workflow
 -> immutable GitHub Release artifact
```

Do not wait for a large "iteration" to finish before integrating independently useful changes.

## Versioning

Use Semantic Versioning with `0.x` expectations:

- `0.MINOR.0` — meaningful user capability or intentionally breaking behavior with safe migration
- `0.x.PATCH` — bug/security/compatibility fix without intentional feature expansion
- prerelease suffix (`-alpha.N`, `-beta.N`) for trusted testing when useful

Use one canonical version source. Do not create version-bump commits for every development change.

## Verification tiers

### Draft PR / inner loop

Fast deterministic CI only: install, unit tests, typecheck, lint/format, compatibility evidence, build, generated-manifest verification.

### Ready PR / master

Run the fast gate plus browser acceptance when runtime behavior is involved. This is the integration confidence gate; packaging is not needed on every development push.

### Release tag

Fail closed on:

- locked dependency install
- tests
- typecheck
- lint/format
- compatibility evidence
- production build
- generated permission/manifest verification
- browser acceptance
- package ZIP
- checksum
- immutable GitHub Release creation

Schema/permission/vault/privacy changes need their relevant focused migration/security evidence in addition to the generic gate.

## Release notes

Keep them user-oriented and short:

- Added
- Fixed
- Security/Privacy changes
- Known limitations when material

Explicitly call out new browser permissions, stored-data migration, sensitive-data behavior, or compatibility changes that can affect autofill.

## Rollback

Never mutate an already tagged release. Fix on current `master`, verify, and publish a new patch version. Persisted-data changes must be designed so users on older distributed versions are not casually destroyed by upgrade/rollback timing.

Do not add release-please, changesets, multi-channel deployment machinery, or store automation until actual release cadence/testers make the manual path a measured burden.
