---
name: local-data-security
description: Use when implementing or verifying sensitive profile fields, vault setup/unlock/reset, encryption, key/session handling, sensitive disclosure, storage of private data, logging, or extension privacy behavior.
---

# Local Data Security

Read `.agents/SECURITY.md` first. That file owns the security/privacy contract; this skill is only recurring implementation guidance for work inside that approved boundary.

## Implementation principle

Keep sensitive-data handling narrow and explicit:

```text
untrusted input
 -> validate at boundary
 -> minimal application/domain decision
 -> explicit unlock/disclosure authorization when required
 -> minimum-value runtime transfer
 -> side effect
```

Do not widen permissions, network/data flows, cryptographic formats, sensitive-data ownership, or disclosure semantics from this skill. Those are material decisions governed by `SECURITY.md` and user authority.

## Vault implementation

- Normal profile and vault storage stay separate.
- Passphrases are never persisted.
- Use Web Crypto rather than custom cryptography or reversible encoding.
- Treat Manifest V3 worker module state as ephemeral.
- Temporary unlock/session material stays outside content-script reach and is removed on lock.
- The current default vault idle timeout is 30 minutes of intentional vault inactivity; unrelated extension activity must not refresh it.

## Disclosure implementation

```text
match sensitive field
 -> expose category/field context only
 -> unlock if needed
 -> show current origin + intended disclosure
 -> explicit user approval
 -> resolve only approved values
 -> fill
```

Never send the whole decrypted vault to a page/content script, and never treat unlock as blanket disclosure consent.

## Diagnostics

Never log sensitive values or key material. Prefer event/type/fingerprint identifiers and structural state.

## Verification

Choose focused evidence for the changed boundary. When relevant, protect round trip, wrong passphrase, tampering/authentication failure, version handling, unique IV behavior, idle-lock lifecycle, restart behavior, and no disclosure while locked/unapproved. Use `.agents/QUALITY.md` for repository integration gates.