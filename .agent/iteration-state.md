# Iteration State

This file is the single current-state tracker for Fillio.

## Current phase

Phase: Iterations 0-12 integrated on `master`; first tagged `0.1.0` release remains an explicit release action.

Integration commit for the product-maturity loop: `7e4e5e65312f3a4580af84f3ad9a276679b61e34` (PR #6, squash merged after green required CI).

The feature branch is no longer the source of truth. `master` is authoritative.

## Locked product boundaries

- Chrome/Chromium desktop first.
- Local-first; no account/backend/cloud sync in the current product.
- Deterministic behavior before AI.
- No automatic Apply, Submit, Next, file selection, or file upload.
- Generic form engine first; ATS adapters require a reproducible generic-engine failure.
- Sensitive values remain behind the encrypted vault and explicit per-site disclosure approval.
- Host-page DOM/text is untrusted input.
- No career/profile/form data telemetry.
- Persisted schemas remain versioned and validated.
- Production behavior changes require tests and risk-appropriate verification.

## Integrated iterations

### Iteration 0 — Project operating system
Status: completed.

Delivered requirements, architecture, code patterns, security, git/release strategy, TDD policy, and project skills.

### Iteration 1 — Profile vertical slice
Status: completed.

Delivered canonical versioned profile, variants, local persistence, editor, popup readiness, manifest verification, and Chromium smoke coverage.

### Iteration 2 — Generic form analysis and safe autofill
Status: completed.

Delivered generic DOM extraction, deterministic matching, Ready/Review/Unknown/Sensitive planning, explicit filling, browser-compatible control events, isolated floating UI, and page summary messaging.

### Iteration 3 — Dynamic forms and correction memory
Status: completed.

Delivered exact origin/form/field correction memory, stable fingerprints, debounced mutation re-analysis, review/ignore controls, and preserved zero automatic fill/navigation/submission.

### Iteration 4 — Sensitive Data Vault
Status: completed.

Delivered authenticated encrypted-at-rest sensitive storage, background-owned memory session, inactivity lock, typed messaging, explicit site disclosure approval, and fail-closed security acceptance.

### Iteration 5 — MVP hardening
Status: completed.

Delivered expanded matcher corpus, reusable manifest verification, normalized formatting baseline, user/security documentation, and reproducible Chromium packaging.

### Iteration 6 — Design system and UX polish
Status: completed.

Delivered shared UI primitives, guided workbench, progressive vault UX, popup/floating polish, and desktop/mobile visual acceptance.

### Iteration 6.1 — Repository and release closure
Status: completed except external tag/release creation.

Delivered:
- repository tracker realigned with actual state
- tag-driven fail-closed GitHub Release workflow
- release workflow reruns tests, typecheck, lint, formatting, build, manifest verification, Chromium E2E, and packaging
- packaged ZIP receives SHA-256 checksum before GitHub Release creation
- release publishing is not allowed to bypass verification

Remaining explicit release action:
- create `v0.1.0` from a verified `master` commit when the release is intended to be published

### Iteration 7 — Context-aware application variants
Status: completed.

Delivered:
- deterministic `recommendApplicationVariant`
- bounded local page signals from title, meta description, and headings
- inspectable keyword evidence rather than fake probability
- stable default fallback/tie behavior
- recommendation drives resolved application profile
- popup recommendation disclosure
- explicit per-page variant override with re-analysis
- return-to-automatic recommendation control
- no AI/network dependency

### Iteration 8 — Progressive profile completeness
Status: completed for the current product scope.

Delivered in the same canonical profile workbench:
- richer basic/contact/professional fields
- richer experience, education, and skill records
- first-class job preferences
- progressive languages, certifications, projects, reusable answers, and document metadata
- richer application variant editing
- one state/save model with no parallel profile schema/editor

### Iteration 9 — Document assistance
Status: completed for safe generic resume guidance.

Delivered:
- deterministic preferred-document selection from the active variant
- resume metadata management and per-variant preferred resume
- current-page file-input detection
- popup resume guidance only when a file input is present
- explicit manual-only file selection/upload UX
- no programmatic file-input filling

Cover-letter metadata remains available in the canonical model but generic file inputs do not reliably identify document intent. Fillio intentionally does not guess a document type without stronger evidence.

### Iteration 10 — Real-world compatibility evidence
Status: completed for the maintained generic-engine corpus.

Delivered:
- expanded native, Indonesian/English, and ATS-shaped matcher corpus
- representative patterns resembling common ATS structures without vendor-specific production branches
- sensitive/file fail-closed regression coverage
- ambiguous subjective-question coverage
- compatibility evidence model in `docs/compatibility.md`
- explicit adapter gate requiring a reproducible generic-engine failure first

### Iteration 11 — Local portability and recovery
Status: completed for normal profile backup.

Delivered:
- versioned `fillio-profile-backup` format
- profile/variants/preferences round-trip through the same persisted-schema parser/migrations
- malformed/unsupported backup rejection
- workbench export/import UI
- Sensitive Data Vault values are never exported as plaintext

### Iteration 12 — External beta readiness
Status: readiness infrastructure completed; actual external distribution is a release/operations decision.

Delivered:
- privacy disclosure matching actual local data flow
- compatibility evidence document
- Chrome Web Store unlisted/test beta checklist
- permission/product-truth gates
- fail-closed GitHub Release ZIP + checksum workflow
- explicit progression: verified master -> immutable tag -> GitHub Release -> trusted testers -> unlisted/test store -> public listing only after evidence
- no store-publishing automation before credentials/tester cadence justify it

## Verification evidence

Product-maturity branch final required CI passed before squash merge:

- dependency install from frozen lockfile
- 30 Vitest files / 148 tests passed
- TypeScript typecheck passed
- ESLint passed with zero warnings
- Prettier check passed
- production extension build passed
- generated manifest invariants passed
- Playwright Chromium installation passed
- complete `pnpm test:e2e` passed after narrowing one stale Iteration 6 text locator to the semantic `Sensitive vault` heading
- extension package creation passed

The E2E locator correction changed test specificity only; no production behavior was weakened to satisfy the test.

## Required gates for future runtime changes

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

Security/privacy/schema/permission changes receive the stricter verification path. A known failed required gate blocks merge/release.

## Current next-state rule

Do not add AI, backend sync, automatic submission, automatic file upload, or ATS-specific adapters merely because Iterations 0-12 are complete. The next product iteration should be driven by evidence from actual use, compatibility failures, or external beta feedback.
