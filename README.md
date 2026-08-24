# Fillio

Fillio is a local-first Chromium extension for career-form autofill. It stores a reusable career profile locally, analyzes supported HTTP/HTTPS application forms, and fills only approved fields after explicit user action.

## Current MVP Behavior

- Manual career profile entry in the extension options page.
- Toolbar popup with profile readiness and current-page form summary.
- In-page floating panel for detected career forms.
- Ready / Needs review / Sensitive / Unknown field classification.
- Explicit normal-field fill only; no automatic fill on scan.
- Dynamic form re-analysis for multi-step or changing forms.
- Per-site/form/field correction memory for review mappings.
- Sensitive Data Vault for encrypted-at-rest sensitive values.
- Sensitive fields require vault setup/unlock plus a separate current-site approval before fill.
- No auto-submit, auto-next, file upload, backend, sync, analytics, or AI dependency.

## Local Development

Requirements:

- Node.js `>=22.13.0`
- pnpm `11.21.0`
- Chromium/Chrome for manual extension testing

Install dependencies:

```powershell
pnpm install --frozen-lockfile
```

Run development mode:

```powershell
pnpm dev
```

Build an unpacked Chromium extension:

```powershell
pnpm build
```

Load the built extension:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select `.output/chrome-mv3`.

## Verification

Run the main local gates:

```powershell
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm verify:manifest
pnpm test:e2e
pnpm zip
```

`pnpm format:check` is configured, but this branch currently has broad pre-existing Windows line-ending/style drift outside the active implementation files. Use focused formatting for touched files until the repository formatting baseline is normalized.

## Security And Privacy

- Normal profile data is stored locally in extension storage.
- Sensitive profile data is stored separately in an encrypted vault envelope.
- Vault encryption uses PBKDF2-HMAC-SHA-256 and AES-256-GCM through Web Crypto.
- The vault passphrase is never persisted.
- The background runtime owns the unlocked vault session.
- Content scripts never receive the whole decrypted vault.
- Sensitive fill requests resolve only the approved current-page field paths.
- Wrong passphrase and tampered ciphertext fail closed.
- Fillio never clicks Submit, Apply, Next, or file inputs in the MVP.

## Release Notes

The repository version is `0.1.0`. A distributable release should be tagged only from a verified `master` commit after PR review/CI and final manifest/privacy review.
