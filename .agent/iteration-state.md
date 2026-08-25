# Iteration State

This file is the single current-state tracker for Fillio.

## Current phase

Phase: product-maturity loop after the verified local-first MVP.

Active branch: `feat/product-maturity-iterations-7-12`.

Iterations 0-6 are integrated product foundation. The previous tracker text saying Iteration 6 still required repository integration was stale: its design-system, profile workbench, popup, floating-panel, visual acceptance, and supporting commits are already present in `master`.

Iterations 6.1-12 are implemented on the active branch and are now in verification/integration. Remote CI may overlap with later slices, but a known failed required gate still blocks merge/release.

## Locked product boundaries

- Chrome/Chromium desktop first.
- Local-first; no account/backend/cloud sync in this roadmap.
- Deterministic behavior before AI.
- No automatic Apply, Submit, Next, file selection, or file upload.
- Generic form engine first; ATS adapters require a reproducible generic-engine failure.
- Sensitive values remain behind the encrypted vault and explicit per-site disclosure approval.
- Host-page DOM/text is untrusted input.
- No career/profile/form data telemetry.
- Persisted schemas remain versioned and validated.
- Production behavior changes require tests and risk-appropriate verification.

## Integrated foundation

- Iteration 0: project operating system, architecture, security, git/release strategy, TDD policy.
- Iteration 1: canonical profile, variants, local persistence, editor, popup readiness, manifest/smoke verification.
- Iteration 2: generic extraction/matching/planning/filling, explicit fill only, isolated floating UI.
- Iteration 3: dynamic forms, exact correction memory, stable fingerprints, no automatic fill/navigation/submission.
- Iteration 4: encrypted Sensitive Data Vault, background-owned memory session, explicit disclosure approval.
- Iteration 5: matcher corpus, reusable manifest verification, formatting baseline, documentation, packaging.
- Iteration 6: shared UI primitives, guided workbench, progressive vault UX, popup/floating polish, visual acceptance.

## Product-maturity implementation

### Iteration 6.1 — Repository and release closure
Status: implemented; verification/integration pending.

Delivered:
- tracker realigned with repository reality
- tag-driven fail-closed release workflow
- release reruns tests, typecheck, lint, formatting, build, manifest verification, Chromium E2E, and packaging
- release ZIP receives SHA-256 checksum before immutable GitHub Release creation
- no release is created from the feature branch

### Iteration 7 — Context-aware application variants
Status: implemented; verification/integration pending.

Delivered:
- pure deterministic `recommendApplicationVariant`
- local page signals from title, meta description, and bounded heading text
- inspectable keyword evidence instead of fake probability
- stable default fallback/tie behavior
- recommended variant drives resolved application profile
- popup discloses recommendation and evidence
- explicit per-page variant override re-analyzes the page
- user can return to automatic recommendation
- no AI/network dependency

### Iteration 8 — Progressive profile completeness
Status: implemented; verification/integration pending.

Delivered in the existing canonical profile workbench:
- richer basic/contact/professional fields
- richer experience, education, and skill records
- first-class job preferences
- progressive languages, certifications, projects, reusable answers, and document metadata
- richer application variant editing
- one profile state/save model; no parallel editor/schema

### Iteration 9 — Document assistance
Status: implemented for resume guidance; verification/integration pending.

Delivered:
- deterministic preferred-document selection from the active application variant
- resume metadata management and per-variant preferred resume
- current-page file-input detection
- popup recommends the configured resume only when file inputs exist
- UI explicitly states that selection/upload remains manual
- no file input is programmatically filled

Cover-letter metadata exists in the canonical model but is not pulled into the current file-input guidance because generic file inputs do not reliably disclose document intent. Do not guess document type without stronger page evidence.

### Iteration 10 — Real-world compatibility evidence
Status: implemented; verification/integration pending.

Delivered:
- expanded maintained matcher corpus with native, Indonesian/English, and ATS-shaped contexts resembling common application systems
- sensitive/file fail-closed regression coverage
- ambiguous subjective-question coverage
- compatibility evidence model in `docs/compatibility.md`
- explicit ATS adapter gate: reproduce generic failure first; fix generic layer before adding vendor code

### Iteration 11 — Local portability and recovery
Status: implemented; verification/integration pending.

Delivered:
- versioned `fillio-profile-backup` format
- normal profile/variants/preferences round-trip through the same persisted-schema parser/migrations
- malformed/unsupported backup rejection
- profile workbench export/import UI
- Sensitive Data Vault values are never exported as plaintext

### Iteration 12 — External beta readiness
Status: implemented as readiness infrastructure; external distribution pending.

Delivered:
- privacy disclosure matching actual local data flow
- compatibility/support evidence document
- Chrome Web Store unlisted/test beta checklist
- permission/product-truth gates
- GitHub Release ZIP + checksum workflow
- explicit progression: verified master -> tag -> GitHub release -> trusted testers -> unlisted/test store -> public only after evidence
- no store-publishing automation before credentials/tester cadence justify it

## Current verification evidence

Known CI history on this branch:

- first runtime pass exposed one stale profile UI test label; fixed
- next pass reached 146/146 unit tests green and then exposed two TypeScript key-narrowing errors; fixed
- later commits add per-page variant override, file-input resume guidance, and corresponding popup acceptance tests; final CI is still the source of truth for merge readiness

## Required final gates

```text
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm verify:manifest
pnpm test:e2e
pnpm zip
git diff --check
```

A pending remote run does not block beginning another independent slice. A known failed required gate must be fixed before merge. Security/privacy/schema/permission changes receive the stricter verification path.

## Definition of done

The product-maturity loop is complete only when the branch is coherent, required CI gates are green, PR review/integration is clean, `.agent` matches repository reality, package/release behavior is reproducible, and no capability weakens Fillio's local-first, explicit-action, fail-closed model.
