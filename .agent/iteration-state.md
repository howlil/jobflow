# Iteration State

This file is the single current-state tracker. Do not create permanent iteration branches or scatter `plan-*.md` files across the repository.

## Project status

Phase: Iteration 5 PR is open and CI is green; merge, fresh master verification, and release tag pending.

Repository state: the Fillio Chromium extension has a verified local-first profile foundation, generic form analysis and explicit safe autofill, dynamic/multi-step re-analysis, scoped user correction memory, and a verified encrypted-at-rest Sensitive Data Vault. Vault data has a versioned envelope, authenticated local encryption, validated decryption, encrypted browser persistence, a generic memory-only inactivity session, typed runtime messages/client, and a background-owned vault broker. Supported sensitive form fields are classified into a separate fail-closed plan bucket and surfaced in page summaries without becoming normal Ready fields. The options/profile page exposes opt-in vault setup, unlock, edit/save, explicit lock, and destructive reset controls through the runtime client. The in-page panel discloses sensitive fields, supports unlock without fill, and requires a separate site-specific approval before requesting only the current sensitive values from the background broker. MVP hardening now includes an expanded career-form corpus, reusable manifest verification, README/user documentation, normalized formatting baseline, full local verification, and a packaged `0.1.0` Chromium ZIP.

## Decisions locked

- Product: career-form autofill browser extension.
- Desktop Chrome/Chromium first.
- Local-first MVP; no account/backend/cloud sync.
- WXT + TypeScript + React + Manifest V3.
- Generic HTTP/HTTPS content script in an isolated world.
- Floating in-page action + toolbar popup/detail UI.
- Manual profile creation now; future CV import writes into the same canonical schema.
- Complete canonical profile schema with progressive UI disclosure.
- Sensitive Data Vault is opt-in, passphrase-protected, encrypted locally.
- Vault crypto baseline: PBKDF2-HMAC-SHA-256 with 600,000 iterations, random 16-byte salt, AES-256-GCM, fresh random 12-byte IV per encryption, 128-bit tag, and stable version AAD.
- Vault key material is non-extractable and intended to live only in the background in-memory unlock session once runtime wiring is introduced.
- Vault auto-lock target: 30 minutes of Fillio vault inactivity; browser service-worker suspension may lock sooner.
- Sensitive disclosure requires explicit approval for the current site/fill operation; unlock alone is never fill approval.
- Government-ID and other sensitive form fields remain fail-closed/manual until the dedicated sensitive disclosure path is implemented and verified.
- One base profile + lightweight application variants.
- Variant recommendation uses deterministic page/job keyword scoring when page-level recommendation work is introduced.
- Field confidence: Ready / Needs review / Unknown.
- User mapping corrections are stored as mapping metadata only and scoped by exact `origin + formFingerprint + fieldFingerprint`.
- User corrections cannot bypass sensitive-field or file-input fail-closed guards.
- Form identity must remain stable across dynamic field additions/removals.
- Dynamic/multi-step form changes trigger debounced semantic re-analysis only; they never trigger automatic fill, next, submit, or file upload.
- Generic DOM engine first. Site adapters only after a documented generic-engine failure.
- No auto-submit.
- No AI dependency in MVP.
- Document metadata may be stored; actual file upload remains user-driven in MVP.
- Production behavior changes use mandatory RED → GREEN → REFACTOR TDD.

## Iteration 0 — Project operating system

Status: completed.

Delivered: requirements, architecture, code patterns, security rules, git/release strategy, TDD policy, and project skills under `.agent`.

## Iteration 1 — Extension skeleton + profile vertical slice

Status: completed.

Delivered:

1. WXT + React + strict TypeScript Manifest V3 project.
2. Reproducible npm lockfile, lint, Prettier, Vitest, build, packaging, and GitHub Actions CI.
3. Versioned canonical profile envelope with runtime validation and unsupported-version handling.
4. Complete normal career-profile domain shape plus separate sensitive-profile domain shape; sensitive values are not persisted in the normal profile envelope.
5. `ProfileRepository` port and `ChromeProfileRepository` using `browser.storage.local`.
6. Pure base-profile + lightweight application-variant resolution.
7. Options/profile editor and toolbar popup with deterministic readiness summary.
8. Chromium smoke verification of persistence across browser restart.
9. Generated-manifest verification with Manifest V3 and minimal permissions.

## Iteration 2 — Generic form analysis and safe autofill

Status: completed.

Delivered:

1. Serializable `FieldContext` contracts; raw DOM elements stay outside domain/application logic.
2. Semantic field/form fingerprints.
3. Generic DOM extraction for text-like inputs, textarea, select, checkbox, radio, date, and file detection.
4. Centralized English/Indonesian normalization and alias catalog.
5. Deterministic matcher with exact alias, structured heuristic, Review, Unknown, file, and sensitive fail-closed outcomes.
6. Explicit fill-plan generation; only Ready mappings with available normal-profile values become fill instructions.
7. Generic filler using native setters plus bubbling `input` / `change` events, with per-field failure isolation and no submit behavior.
8. HTTP/HTTPS content-script analysis plus isolated Shadow DOM floating Fillio control.
9. Toolbar popup current-page summary through one-shot extension messaging.
10. Chromium acceptance proving static detection, explicit fill, select mapping, event dispatch, sensitive/file/unknown exclusion, and zero submission.

Final Iteration 2 CI: 43 unit/UI tests plus typecheck, lint, format check, production build, manifest invariants, Chromium smoke, and packaging passed.

## Iteration 3 — Dynamic forms + correction memory

Status: completed.

Goal achieved: support dynamic/multi-step career forms and remember explicit user mapping corrections without weakening fail-closed safety or explicit-fill behavior.

Delivered:

1. Versioned `StoredCorrectionEnvelope { schemaVersion: 1, entries[] }` storing mapping metadata only.
2. Correction target restricted to supported non-sensitive canonical fields or `ignore`.
3. Exact correction scope: `origin + formFingerprint + fieldFingerprint`.
4. `CorrectionRepository` port plus `ChromeCorrectionRepository` using `fillio.corrections` in local extension storage.
5. Correction precedence over deterministic matching only after sensitive/file guards; `ignore` becomes Unknown.
6. Stable generic form identity based on form metadata rather than the dynamic list of controls.
7. Order-insensitive semantic field-set fingerprint used to avoid unnecessary re-analysis.
8. Stoppable relevant `MutationObserver` with debounce, attribute filtering, and Fillio-host exclusion.
9. Floating Review UI with explicit candidate mapping and Ignore actions; React UI owns no storage/browser API.
10. Correction save immediately re-analyzes the current page but does not fill anything.
11. Relevant dynamic DOM changes trigger re-analysis only when the semantic field set changes; filler still runs only after the user clicks Fill.
12. Current-page summary stays synchronized with the latest analysis for popup messaging.
13. Chromium acceptance covering correction reuse after reload, different-form isolation, site-owned Next causing debounced re-analysis, new fields remaining empty until Fill, and zero automatic submission.

TDD/verification evidence:

- Correction matcher/schema behavior was introduced RED-first, including exact scope, ignore, sensitive/file fail-closed, and version validation.
- Correction repository behavior was introduced RED-first, including exact-key replacement and malformed-data rejection.
- Dynamic form identity, semantic field-set fingerprint, mutation relevance/debounce, and disconnect behavior were introduced RED-first.
- Correction-aware page analysis and Review UI were introduced RED-first.
- Browser acceptance exposed two test-fixture issues during verification: an ambiguous Playwright `Name` locator and an incorrect Ready count after reusing the broader shared fixture. Both were corrected in the test without weakening production behavior.
- Final acceptance was tightened during review to verify site-owned Next, zero submission, and different-form correction isolation.

Acceptance criteria status:

- exact site/form/field correction memory: verified by domain/storage tests and Chromium reload journey
- correction cannot bypass sensitive/file guards: verified
- dynamic form identity stable across control additions/removals: verified
- debounced relevant rescan with Fillio/irrelevant mutation filtering: verified
- site-owned Next leads to automatic re-analysis only: verified in Chromium
- dynamic fields are never auto-filled: verified in Chromium
- correction save never auto-fills: verified in Chromium
- different form does not inherit remembered correction: verified in Chromium; different origin/form/field isolation also covered by domain tests
- no automatic next/submit/file upload: preserved; Chromium submit count remains zero
- popup summary uses latest analysis state: preserved by content-script orchestration and popup messaging contract
- no backend, AI, vault, or ATS-specific adapter added: preserved

Final Iteration 3 branch verification: 57 unit/UI tests plus typecheck, lint, format check, production build, generated-manifest invariants, legacy Chromium smoke, Iteration 3 Chromium acceptance, and extension packaging passed in read-only CI.

## Iteration 4 — Sensitive Data Vault

Status: completed.

Completed foundation:

1. Strict versioned encrypted vault envelope with no plaintext profile/passphrase fields.
2. Complete empty `SensitiveProfile` factory validated against the existing domain schema.
3. PBKDF2-HMAC-SHA-256 key derivation at 600,000 iterations and non-extractable AES-256-GCM key material.
4. AES-GCM authenticated encryption with stable version AAD, random 16-byte salt, and fresh random 12-byte IV.
5. Sensitive profile serialization/deserialization is schema-validated before encryption and after authenticated decryption.
6. Wrong passphrase and ciphertext tampering fail closed through the vault unlock error contract.
7. Re-encryption preserves KDF salt, rotates IV, and updates metadata.
8. `VaultRepository` port plus `ChromeVaultRepository` storing only the validated encrypted envelope under `fillio.vault`.
9. Generic memory-only `VaultSession` with explicit lock, explicit activity refresh, and 30-minute idle expiry.
10. Security regression tests verify no representative plaintext/passphrase is present in the envelope, independent setup salt/IV randomness, authenticated tamper rejection, invalid decrypted-profile rejection, correct/wrong passphrase behavior, and encrypted storage load/save/delete.
11. Typed vault runtime messages and `ChromeVaultClient` for status/setup/unlock/lock/load-profile/save-profile/read-fields/reset.
12. Background runtime broker owns `VaultSession<CryptoKey>`, persists only encrypted envelopes, returns fail-closed errors for invalid/locked/unconfigured states, and does not expose passphrase/key material in status responses.
13. Sensitive aliases for high-frequency scalar vault values classify as Sensitive rather than Unknown.
14. Sensitive matches are excluded from normal Ready fill instructions even when the normal profile has values.
15. Correction memory cannot override sensitive/file fail-closed guards.
16. Page and popup/floating summaries include a Sensitive count while preserving Ready / Needs review / Unknown semantics.
17. Vault options UI supports passphrase-confirmed setup, locked/unlocked states, scalar sensitive profile editing, save through re-encryption, explicit lock, and two-step destructive reset.
18. Floating panel shows sensitive field labels without values, opens vault settings when absent, unlocks without filling, shows generic unlock errors, and fills sensitive fields only after a separate current-site approval.
19. Sensitive fill requests resolve only the detected field paths and skip missing/empty vault values.
20. Chromium security acceptance verifies encrypted storage contains no passphrase/plaintext sensitive values, normal Fill skips sensitive controls, wrong passphrase fails, unlock does not fill, explicit site approval fills only configured sensitive values, submit count remains zero, and reset removes the encrypted vault.

Current verification evidence:

- `pnpm install --frozen-lockfile` passes.
- 26 test files / 97 tests pass.
- Typecheck, lint, production build, legacy Chromium E2E journeys, Iteration 4 vault E2E, extension packaging, and generated-manifest invariants pass locally.
- Repo-wide Prettier check still has pre-existing Windows line-ending/style drift outside the current task; focused formatting was applied to touched files.
- Manifest permission surface remains unchanged from Iteration 3.

Remaining repository integration before branch completion:

- Squash merge and fresh `master` CI.

Do not merge this iteration while any remaining item above is incomplete.

## Iteration 5 — MVP hardening and release

Status: PR open with green CI; merge, fresh master verification, and release tag pending.

Delivered locally:

1. Expanded representative local/global career-form matcher corpus.
2. Sensitive/file fail-closed coverage in the expanded corpus.
3. Reusable `pnpm verify:manifest` script for generated-manifest invariants.
4. CI manifest verification now uses the shared script.
5. README with local setup, prototype loading, verification, privacy/security behavior, and release constraints.
6. Repository-wide Prettier baseline normalized; `pnpm format:check` now passes.
7. Extension permission surface remains `storage` only with no `host_permissions`.
8. Local package artifact builds as `.output/fillio-0.1.0-chrome.zip`.

Final local verification evidence:

- `pnpm install --frozen-lockfile`
- `pnpm test`: 27 files / 118 tests
- `pnpm typecheck`
- `pnpm lint`
- `pnpm format:check`
- `pnpm build`
- `pnpm verify:manifest`
- `pnpm test:e2e`
- `pnpm zip`
- `git diff --check`

Repository integration evidence:

- PR #5 opened against `master`: https://github.com/howlil/fillio/pull/5
- GitHub Actions `verify` check passed for the PR branch.

Remaining repository/release integration:

- Squash merge and verify fresh `master`.
- Create first `0.x` release tag only from verified `master`.

## Iteration discipline

- Work on one iteration task at a time.
- A follow-up discovered during a task remains in the same task/branch unless it is genuinely independent.
- Update this file when a task materially changes status or scope.
- Do not mark an iteration complete because code exists; verify its acceptance criteria.
- Do not pull future iteration features forward merely because they are easy to add.
