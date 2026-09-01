# Jobflow Security

This file is the canonical authority for Jobflow-specific security, privacy, and sensitive-data boundaries. Product behavior lives in `PROJECT.md`; runtime placement lives in `ARCHITECTURE.md`; verification gates live in `QUALITY.md`.

## Security model

Jobflow is a local-first browser extension that processes career data and host-page form context. Ordinary career data and sensitive values have different trust boundaries.

Core rule:

> Detection, unlock, and disclosure are separate decisions.

Recognizing a field does not authorize access to a sensitive value. Unlocking the vault does not authorize disclosure to a website. Filling a sensitive value requires an explicit current-site action.

## Sensitive vault boundary

- Sensitive values are stored separately from the normal career profile.
- The vault is opt-in and encrypted at rest.
- Passphrases are never persisted.
- Browser restart returns the vault to locked state.
- The implemented default vault idle timeout is 30 minutes of Jobflow vault inactivity.
- Locking removes active unlock/session material and plaintext caches owned by the vault session.
- Reset is destructive when no recovery mechanism exists and therefore requires explicit destructive confirmation.

## Cryptography

Use Web Crypto primitives only.

The vault envelope must remain versioned and self-describing enough to support migration of cryptographic parameters. Current cryptographic invariants include:

```text
KDF       PBKDF2-HMAC-SHA-256
salt      random per envelope
cipher    AES-256-GCM
IV        fresh unique IV per encryption under a key
payload   authenticated ciphertext
```

Do not introduce custom cryptography, reversible obfuscation, fixed IVs, plaintext shadow copies, or undocumented envelope changes.

A cryptographic format/KDF/cipher change is a material security and persistence decision.

## Unlock/session ownership

Manifest V3 background workers are ephemeral, so security must not depend on permanent module lifetime.

- Temporary unlock material is owned by the background/vault boundary, not React UI or content scripts.
- Content scripts must not receive wholesale decrypted vault state.
- Key material must not be made extractable merely for convenience.
- Session activity is refreshed only by intentional vault activity; unrelated extension activity must not silently extend sensitive-data exposure.

## Disclosure flow

```text
sensitive field detected
 -> expose field/category context only
 -> user opens sensitive flow
 -> unlock vault when required
 -> show current origin + fields/categories to be disclosed
 -> user explicitly approves current fill operation
 -> resolve only approved values
 -> send minimum required values to execution boundary
 -> fill requested fields
```

No step authorizes automatic Submit, Apply, Next, file attachment, or unrelated sensitive fields.

## Browser permissions

Use least privilege.

Adding or widening browser permissions, host permissions, or privileged browser capabilities requires an exact current behavior that needs them. Permission expansion is a material product/security decision unless already authorized by explicit user scope.

Do not request permissions for hypothetical future features.

## Network and privacy boundary

Current product behavior does not require sending career/profile/form-value/sensitive data to a backend, telemetry system, analytics service, or remote AI model.

Any new network path that can receive career data, page context, form values, document content, or sensitive data requires an explicit privacy/data-flow design and user approval before implementation.

Compatibility feedback must remain privacy-safe and redacted according to the repository's compatibility/privacy process.

## Logging and diagnostics

Never log:

- vault passphrase or derived key material
- decrypted vault payload
- national ID / passport / tax identifiers
- compensation values
- family/reference sensitive details
- sensitive document content
- raw secrets or authentication material

Prefer event/type/fingerprint identifiers and structural diagnostics over user values.

## Untrusted inputs

Treat the following as untrusted boundary data:

- host-page DOM/text/attributes
- imported files and extracted content
- persisted storage payloads
- extension messages
- backup/import payloads

Validate and normalize at the owning boundary. Unknown or invalid states fail closed when safety/privacy is uncertain.

## Persistence and migration

- Encrypted and normal persisted schemas remain explicitly versioned where applicable.
- Migration must preserve supported user data or fail clearly; do not silently discard sensitive or canonical data.
- Changes that can make older distributed versions corrupt or misread persisted data require explicit compatibility reasoning.

## Required verification when security changes

Use the relevant focused evidence plus repository integration gates. Vault/crypto/session/disclosure changes should protect applicable cases such as:

- encrypt/decrypt round trip
- wrong passphrase remains locked
- modified ciphertext/authentication tag fails closed
- envelope version/parameter handling
- fresh IV behavior
- 30-minute idle-lock behavior and intentional activity refresh
- restart/locked-state behavior where runtime semantics matter
- no sensitive disclosure while locked or before explicit current-site approval
- minimum-value disclosure across content/background boundaries
- generated permission/manifest review when permissions change

Do not mock away Web Crypto when the purpose of the test is to establish cryptographic correctness.

## Material security decisions requiring approval

Unless already explicitly authorized by the user's request, stop and surface changes involving:

- network transmission of career/page/sensitive data
- telemetry or analytics containing user/application data
- browser/host permission expansion
- cryptographic algorithm/KDF/envelope changes
- new recovery/export of sensitive plaintext
- exposing vault/session material to a new runtime context
- weakening explicit disclosure approval
- changing sensitive-data ownership or persistence boundaries