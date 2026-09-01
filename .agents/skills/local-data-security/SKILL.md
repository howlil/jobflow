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

- disabled until the user enables it
- passphrase never persisted
- encrypted payload stored locally
- inactivity auto-lock according to the implemented vault policy
- browser restart returns vault to locked
- reset is destructive when recovery is unavailable

## Cryptography

Use Web Crypto only. The existing envelope uses versioned KDF/cipher parameters, random salt, authenticated AES-GCM encryption, and a fresh unique IV for each encryption under a key.

Never invent custom encryption, obfuscation, or reversible encoding.

## Unlock state

Manifest V3 workers are ephemeral. Do not rely only on a background module variable for unlock state. Temporary key/session material must remain outside content-script reach and be removable on lock.

## Disclosure

```text
match sensitive field
 -> unlock if needed
 -> show current origin + sensitive category/field context
 -> user approves current fill operation
 -> resolve only approved values
 -> fill
```

Never send the entire decrypted vault into the page/content-script context.

## Logging

Never log passphrases, key material, decrypted vault payloads, national/passport/tax identifiers, compensation values, family/reference details, or sensitive document contents.

Diagnostics should use event/type/fingerprint identifiers rather than user values.

## Privacy boundary

Any new network call, telemetry, sync, analytics, or remote-AI feature that can receive career/page data requires an explicit product/privacy/data-flow decision before implementation.

## Verification

When the vault/crypto boundary changes, protect the relevant risks: round trip, wrong passphrase, tampering/authentication failure, version/parameter handling, unique IV behavior, lock lifecycle, and no disclosure while locked/unapproved. Do not mock away the crypto primitive when the test is intended to establish cryptographic correctness.