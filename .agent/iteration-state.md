# Iteration State

This file is the single current-state tracker for Fillio.

## Current phase

Phase: product-maturity loop after the verified local-first MVP.

Active branch: `feat/product-maturity-iterations-7-12`.

Iterations 0-6 are treated as integrated product foundation. The previous tracker text saying Iteration 6 still required repository integration was stale: its design-system, profile workbench, popup, floating-panel, visual acceptance, and supporting commits are already present in `master`.

The next delivery loop intentionally advances Iterations 7-12 without waiting for each remote CI run to finish before starting the next slice. A known failing required gate still blocks merge/release; pending remote CI does not block beginning the next independent slice.

## Locked product boundaries

- Chrome/Chromium desktop first.
- Local-first; no account/backend/cloud sync in this roadmap.
- Deterministic behavior before AI.
- No automatic Apply, Submit, Next, or file upload.
- Generic form engine first; ATS adapters require a reproducible generic-engine failure.
- Sensitive values remain behind the encrypted vault and explicit per-site disclosure approval.
- Host-page DOM/text is untrusted input.
- No career/profile/form data telemetry.
- Persisted schemas remain versioned and validated.
- Production behavior changes require tests and risk-appropriate verification.

## Completed foundation

### Iteration 0 — Project operating system
Completed: requirements, architecture, code patterns, security, git/release strategy, TDD policy, and project skills.

### Iteration 1 — Profile vertical slice
Completed: canonical versioned profile, variants, local persistence, profile editor, popup readiness, manifest verification, smoke coverage.

### Iteration 2 — Generic form analysis and safe autofill
Completed: DOM extraction, deterministic matching, Ready/Review/Unknown/Sensitive planning, explicit fill only, event-compatible filler, isolated floating UI, popup summary.

### Iteration 3 — Dynamic forms and correction memory
Completed: exact origin/form/field correction memory, stable fingerprints, debounced mutation re-analysis, review/ignore controls, no automatic fill/navigation/submission.

### Iteration 4 — Sensitive Data Vault
Completed: PBKDF2-HMAC-SHA-256 + AES-256-GCM encrypted-at-rest vault, background-owned memory session, inactivity lock, typed messaging, explicit site approval, fail-closed tests.

### Iteration 5 — MVP hardening
Completed: expanded matcher corpus, manifest verification reuse, normalized formatting baseline, user/security docs, packaged `0.1.0` build path.

### Iteration 6 — Design system and UX polish
Completed in `master`: shared design tokens/primitives, guided profile workbench, progressive vault UX, professional floating panel, compact popup command center, desktop/mobile visual acceptance.

## Active product-maturity iterations

### Iteration 6.1 — Repository and release closure
Status: in progress.

Required outcome:
- keep this tracker aligned with repository reality
- keep `0.1.0` release reproducible from verified `master`
- release workflow/checklist must fail closed
- do not publish when required verification is known failing

### Iteration 7 — Context-aware application variants
Status: implementation started.

Target outcome:
- deterministic recommendation from page/job signals
- score/evidence are inspectable rather than fake probabilities
- default variant is fallback when no useful evidence exists
- user remains able to override recommendation
- no AI/network dependency

Implemented on active branch:
- pure `recommendApplicationVariant` domain module
- deterministic keyword scoring with stable fallback/tie behavior
- unit coverage for matching, fallback, and empty variants

### Iteration 8 — Progressive profile completeness
Status: planned in active loop.

Target outcome:
- editor exposes the high-value fields already present in the canonical schema
- richer experience/education/skills editing
- job preferences become first-class
- projects/certifications/languages/custom answers/documents use progressive disclosure rather than one long form
- no parallel profile model

### Iteration 9 — Document assistance
Status: planned in active loop.

Target outcome:
- document metadata is useful at application time
- recommended resume/cover-letter follows selected/recommended variant
- file inputs remain user-operated
- Fillio may explain which document is preferred but never programmatically chooses/uploads it

### Iteration 10 — Real-world compatibility evidence
Status: planned in active loop.

Target outcome:
- maintained representative fixtures for native/custom/SPA/ATS-like forms
- measure Ready correctness, review/unknown behavior, fill compatibility, rescan safety, sensitive exclusion, and zero submission
- generic-engine improvements precede adapters

### Iteration 11 — Local portability and recovery
Status: implementation started.

Target outcome:
- versioned normal-profile export/import
- imported profiles pass the same persisted-schema parser/migrations
- vault is never exported as plaintext
- malformed/unsupported backups fail closed

Implemented on active branch:
- versioned `fillio-profile-backup` application format
- validated JSON serialization/parsing through `parseStoredProfile`
- unit round-trip and invalid-format coverage

### Iteration 12 — External beta readiness
Status: planned in active loop.

Target outcome:
- GitHub release artifact flow first
- privacy/store copy matches actual data flow and permission surface
- unlisted/test Chrome Web Store channel before public listing
- screenshots, support path, permission justification, release checklist, upgrade verification
- no publishing automation that bypasses verification

## Verification policy for this loop

For runtime changes, required local/CI gates remain:

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

A slice may begin while the previous slice's remote CI is still pending. A known failed required gate must be fixed before merge. Security/privacy/schema/permission changes receive the stricter verification path.

## Definition of done for product-maturity loop

The loop is complete only when the implemented Iterations 7-12 are integrated coherently, required tests are green, `.agent` matches repository reality, package/release behavior is reproducible, and no new capability weakens Fillio's local-first, explicit-action, fail-closed security model.
