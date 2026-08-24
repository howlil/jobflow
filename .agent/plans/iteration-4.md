# Iteration 4 — Sensitive Data Vault Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:executing-plans inline for this repository; the user does not use subagent-driven execution. Steps use checkbox syntax for tracking.

**Goal:** add an opt-in locally encrypted Sensitive Data Vault that stays locked by default, keeps the decryption key only in extension background memory while unlocked, auto-locks after Fillio inactivity, and fills sensitive career fields only after explicit per-site approval.

**Architecture:** keep the existing normal profile pipeline unchanged. Persist only a versioned encrypted vault envelope in `browser.storage.local`; Web Crypto performs PBKDF2-HMAC-SHA-256 key derivation and AES-256-GCM authenticated encryption. The MV3 background service worker owns the unlocked `CryptoKey` and inactivity session; options/content scripts use typed runtime messages and never receive or persist the key. Sensitive matching is a separate fail-closed path that never enters the normal Ready fill plan.

**Tech stack:** TypeScript, React, WXT/Manifest V3, Web Crypto API, Zod, Vitest, Testing Library, Playwright Chromium.

## Progress snapshot

- Task 1 domain envelope/profile factory: complete and verified.
- Task 2 Web Crypto + encrypted repository: complete and verified.
- Task 3 memory-only `VaultSession` and background broker/messages/client: complete and verified.
- Task 4 sensitive field classification and separate plan: complete and verified.
- Task 5 vault options UI: complete and verified.
- Task 6 per-site sensitive disclosure and explicit fill: complete and verified.
- Task 7 Chromium security acceptance and completion: complete and verified.
- Government-ID sensitive autofill remains fail-closed/manual until Task 6 is explicitly implemented and verified.

## Global constraints

- Chromium first; local-first; no backend/account/cloud/AI.
- Existing extension permission surface must remain `storage`; do not add host permissions.
- Vault is opt-in and absent by default.
- Persist no plaintext passphrase, plaintext sensitive profile, derived key, or decrypted key material.
- PBKDF2-HMAC-SHA-256 with 600,000 iterations, random 16-byte salt.
- AES-GCM with a 256-bit derived key, fresh random 12-byte IV on every encryption, 128-bit authentication tag, and stable version AAD.
- Wrong passphrase and tampered ciphertext fail closed with one generic unlock/decrypt error.
- Background session key is memory-only and locks after 30 minutes of Fillio vault inactivity; MV3 worker suspension may lock sooner and is acceptable.
- Timer resets only on vault unlock/read/save activity, not general page/browser activity.
- Sensitive fields never become normal Ready fields and correction memory can never override them.
- Unlocking the vault is not approval to fill. Every sensitive fill requires a new explicit user action for the current page/site operation.
- No automatic fill, Next, submit, Apply, or file upload.
- Reset/delete has a deliberate destructive confirmation and no recovery path.
- Mandatory RED → GREEN → REFACTOR for production behavior.

---

## Task 1 — Vault domain envelope and empty sensitive profile

**Files:**
- Create: `src/domain/vault/vault-envelope.ts`
- Create: `src/domain/profile/create-empty-sensitive-profile.ts`
- Test: `src/domain/vault/vault-envelope.test.ts`
- Test: `src/domain/profile/create-empty-sensitive-profile.test.ts`

**Produces:**
- `StoredVaultEnvelope` schema version 1 containing only KDF/cipher metadata, ciphertext, and timestamps.
- `createEmptySensitiveProfile(): SensitiveProfile` matching the already-defined complete `SensitiveProfileSchema`.

- [x] RED: tests reject future/malformed envelopes and assert the empty sensitive profile validates.
- [x] Run focused tests and verify failure is caused by missing modules, then behavioral RED.
- [x] GREEN: implement strict Zod envelope validation and complete empty sensitive profile factory.
- [x] Run focused + full tests; refactor only after green.

## Task 2 — Web Crypto sealing/opening and encrypted storage

**Files:**
- Create: `src/infrastructure/crypto/web-crypto-vault.ts`
- Create: `src/application/vault/vault-repository.ts`
- Create: `src/infrastructure/storage/chrome-vault-repository.ts`
- Test: `src/infrastructure/crypto/web-crypto-vault.test.ts`
- Test: `src/infrastructure/storage/chrome-vault-repository.test.ts`

**Produces:**
- `createEncryptedVault(profile, passphrase)` → `{ envelope, key }`.
- `unlockVaultKey(envelope, passphrase)` → opaque `CryptoKey` after authenticated verification.
- `decryptSensitiveProfile(envelope, key)` → validated `SensitiveProfile`.
- `reencryptSensitiveProfile(profile, envelope, key)` → envelope with same KDF metadata and fresh IV.
- `VaultRepository.load/save/delete` over storage key `fillio.vault`.

- [x] RED: round-trip, random salt/IV, wrong passphrase, ciphertext tamper, malformed decrypted JSON, fresh IV on save, no plaintext serialized envelope, storage load/save/delete.
- [x] Verify focused RED failures.
- [x] GREEN minimal Web Crypto + repository implementation.
- [x] Verify full suite, typecheck, lint, format, build, Chromium journeys, and packaging; refactor encoding/error helpers after green.

## Task 3 — Memory-only unlock session and background vault broker

**Files:**
- Create: `src/application/vault/vault-session.ts`
- Create: `src/application/vault/vault-messages.ts`
- Create: `src/infrastructure/messaging/chrome-vault-client.ts`
- Modify: `entrypoints/background.ts`
- Test: `src/application/vault/vault-session.test.ts`
- Test: `src/application/vault/vault-messages.test.ts`

**Produces:**
- `VaultSession` holding only an opaque key handle with `unlock`, `requireKey`, `touch`, `lock`, `status`, and 30-minute idle expiry.
- Typed commands: status, setup, unlock, lock, load-profile, save-profile, read-fields, reset.
- Background is the only runtime owner of the unlocked key; repository always remains encrypted at rest.

- [x] RED: locked default, exact inactivity expiry, explicit activity refresh, and explicit lock.
- [x] GREEN: implement generic memory-only `VaultSession` with 30-minute idle expiry.
- [x] RED: broker/message behavior for status, setup, unlock, lock, load/save, reset, and no key/passphrase in responses.
- [x] GREEN: implement background broker + typed runtime messages/client with fail-closed errors.
- [x] Verify full suite and background build.

## Task 4 — Sensitive field classification and separate plan

**Files:**
- Create: `src/domain/matching/sensitive-fields.ts`
- Modify: `src/domain/matching/match-field.ts`
- Modify: `src/domain/matching/match-field-with-corrections.ts`
- Modify: `src/application/prepare-fill/prepare-fill-plan.ts`
- Modify: `src/application/forms/analyze-field-contexts.ts`
- Test: extend `src/domain/forms/form-engine.test.ts`
- Test: extend `src/domain/corrections/correction-memory.test.ts`
- Test: extend `src/application/forms/analyze-field-contexts.test.ts`

**Produces:**
- `SensitiveCanonicalField` for high-frequency scalar vault values: birth date/place, gender, nationality, marital status, national ID/NIK, passport, tax ID/NPWP, current salary, expected salary, sponsorship required.
- Matcher result `status: 'sensitive'` for recognized sensitive aliases.
- `FillPlan.sensitive[]`; these items are excluded from `ready` even while vault is unlocked.
- Page summary adds `sensitive` count while preserving Ready / Needs review / Unknown semantics.

- [x] RED: recognized aliases classify as Sensitive; correction cannot override; sensitive never appears in normal Ready.
- [x] GREEN minimal matcher/plan changes.
- [x] Update popup summary validator/UI tests for the new count.
- [x] Run full suite and refactor shared canonical-field catalogs only if necessary.

## Task 5 — Vault options UI

**Files:**
- Create: `src/ui/vault/SensitiveVaultSection.tsx`
- Create: `src/ui/vault/SensitiveVaultSection.test.tsx`
- Modify: `src/ui/profile/ProfilePage.tsx`
- Modify: `entrypoints/options/App.tsx`
- Modify: profile CSS only as needed using existing visual language.

**Produces:**
- Opt-in setup with passphrase + confirmation.
- Locked/unlocked status and explicit lock control.
- Progressive editor for the sensitive scalar fields classified in Task 4 while preserving the full underlying `SensitiveProfile` shape.
- Save re-encrypts with fresh IV using the in-memory session key.
- Two-step destructive reset with no recovery wording.

- [x] RED UI tests for setup mismatch, setup success, unlock failure/success, edit/save, lock, reset confirmation.
- [x] GREEN minimal UI and client wiring.
- [x] Verify existing profile tests remain unchanged/green.

## Task 6 — Per-site sensitive disclosure and explicit fill

**Files:**
- Create: `src/application/vault/sensitive-values.ts`
- Modify: `src/ui/floating/FloatingPanel.tsx`
- Add: `src/ui/floating/FloatingPanel.sensitive.test.tsx`
- Modify: `entrypoints/content.tsx`
- Modify: floating styles only as needed.

**Produces:**
- Panel shows count/list of requested sensitive field labels without exposing values while locked.
- If vault absent: offer callback to open Fillio settings.
- If locked: user may explicitly enter passphrase to unlock.
- If unlocked: panel still does not fill; user must click a separate `Fill sensitive fields on <host>` approval action.
- Only after that click does content script request values from background, build sensitive fill instructions, and call the existing generic filler.
- Approval is one operation only; it is never cached across dynamic steps/reloads/sites.

- [x] RED: locked/unlocked disclosure state, wrong-passphrase error, unlock-without-fill, explicit fill only, missing vault values skipped, no auto-submit.
- [x] GREEN content/background/UI orchestration.
- [x] Verify correction memory and normal Fill path remain independent.

## Task 7 — Chromium security acceptance and completion

**Files:**
- Create: `e2e/iteration4-vault.mjs`
- Modify: `package.json` to append Iteration 4 acceptance after existing E2E journeys.
- Modify: `.agent/iteration-state.md` only after all verification passes.

**Acceptance journey:**
1. Load extension with no vault; storage contains no vault key.
2. Setup vault in options with a passphrase and representative sensitive values.
3. Inspect `browser.storage.local`: encrypted envelope exists while passphrase and sensitive plaintext values are absent from serialized storage.
4. Navigate to local career fixture containing normal + sensitive fields.
5. Verify normal Fill does not fill sensitive controls.
6. Verify sensitive disclosure is locked; wrong passphrase fails; correct unlock succeeds but fields remain empty.
7. Click explicit site-sensitive Fill; only approved configured sensitive fields populate and submit count remains zero.
8. Reload: vault remains encrypted and requires unlock after explicit/session lock before another sensitive fill.
9. Verify reset deletes encrypted vault and returns to not-configured state.

**Final gates:** `pnpm install --frozen-lockfile`, all Vitest/UI tests, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm build`, generated-manifest invariants, all Chromium E2E journeys, `pnpm zip`.

- [x] Run all final gates locally with pnpm.
- [x] Review diff against `master` for plaintext leaks, new permissions, network/backend/AI/site-specific logic, and accidental auto-fill/submit behavior.
- [x] Update `.agent/iteration-state.md` to Iteration 4 complete / Iteration 5 ready.
- [ ] Open one PR, wait for PR CI, squash merge, verify fresh `master` CI.
