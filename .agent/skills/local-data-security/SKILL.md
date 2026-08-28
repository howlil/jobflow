---
name: local-data-security
description: Use when changing sensitive profile fields, vault setup/unlock/reset, encryption, key/session handling, sensitive disclosure, storage of private data, logging, or extension privacy behavior.
---

# Local Data Security

## Core principle

Sensitive career data is opt-in, encrypted at rest, minimally exposed at runtime, and disclosed only with explicit user intent. Security boundaries must survive extension-context restarts.

## Vault boundary

Normal career profile and sensitive vault are separate storage concerns.

Vault requirements:

- disabled until user enables it
- passphrase never persisted
- encrypted payload stored locally
- 30-minute Job Flow-inactivity auto-lock
- browser restart returns vault to locked
- no recovery in MVP; reset destroys encrypted data

## Cryptography

Use Web Crypto primitives only.

Recommended envelope:

```text
version
kdf: PBKDF2-HMAC-SHA-256
kdf parameters
random salt
cipher: AES-256-GCM
fresh unique IV
ciphertext
```

Use a new IV for every encryption under a key. Keep algorithm/KDF parameters in the envelope so future migrations are possible. Never invent encryption, obfuscation, or reversible custom encoding.

## Unlock state

Do not rely only on a background module variable because Manifest V3 service workers are ephemeral.

Temporary unlock key material may live in extension session-memory storage that is not exposed to content scripts. Import it into a non-extractable `CryptoKey` when needed. Locking removes key material and plaintext caches.

## Disclosure

Recognizing a sensitive field does not authorize disclosure.

```text
match sensitive field
 -> unlock if needed
 -> show current origin + sensitive categories
 -> user approves current fill operation
 -> resolve only approved values
 -> fill
```

Never send the entire decrypted vault into the page/content-script context.

## Logging

Never log:

- passphrase or derived key material
- NIK/national ID/passport/tax ID
- compensation values
- family/reference details
- sensitive document contents
- decrypted vault payload

Developer diagnostics should log event/type/fingerprint identifiers, not user values.

## Storage/privacy changes

Any new network call, telemetry, sync, analytics, or remote AI feature that can receive career/page data requires a separate privacy/data-flow design before implementation.

## Tests

Minimum crypto/vault coverage:

- encrypt/decrypt round trip
- wrong passphrase stays locked
- modified ciphertext/tag fails authentication
- version/parameter parsing
- unique IV generation behavior
- auto-lock lifecycle
- no sensitive disclosure when locked/unapproved

## Common mistakes

- storing passphrase or raw plaintext beside ciphertext
- using one fixed IV
- putting decrypted vault in global React state
- exposing session key storage to content scripts
- logging input values during debugging
- treating "vault unlocked" as blanket consent for all websites
