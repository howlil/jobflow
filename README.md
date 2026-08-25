# Fillio

Fillio is a local-first Chromium extension for career-form autofill. It keeps a reusable career profile on-device, analyzes supported HTTP/HTTPS application forms, recommends a role-specific application variant from local page signals, and fills only approved fields after explicit user action.

## Current Behavior

- Progressive career profile workbench for core contact, professional, experience, education, skills, job preferences, languages, certifications, projects, reusable answers, and document metadata.
- Base profile plus lightweight application variants.
- Deterministic current-page application-variant recommendation using local title/meta/heading signals with inspectable keyword evidence and default fallback.
- Toolbar popup with profile readiness, current-page form summary, and recommended application profile.
- In-page floating panel for detected career forms.
- Ready / Needs review / Sensitive / Unknown field classification.
- Explicit normal-field fill only; no automatic fill on scan.
- Dynamic form re-analysis for multi-step or changing forms.
- Per-site/form/field correction memory for review mappings.
- Sensitive Data Vault for encrypted-at-rest sensitive values.
- Sensitive fields require vault setup/unlock plus a separate current-site approval before fill.
- Resume/document metadata and per-variant preferred resume selection; actual file selection/upload remains manual.
- Versioned normal-profile backup export/import validated through the same persisted-schema parser. Sensitive vault values are never exported as plaintext.
- No auto-submit, auto-next, automatic file upload, backend, cloud sync, analytics, or AI dependency.

## Local Development

Requirements:

- Node.js `>=22.13.0`
- pnpm `11.21.0`
- Chromium/Chrome for browser acceptance testing

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

1. Open `chrome://extensions/`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select `.output/chrome-mv3`.

## Verification

Run the complete local gates:

```powershell
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

CI runs the same core verification plus Chromium installation for browser E2E. Tagged `v*` releases use a separate fail-closed workflow that reruns required verification, packages the extension, generates a SHA-256 checksum, and only then creates the GitHub Release.

## Compatibility Strategy

Fillio prioritizes a generic form engine over ATS-specific production branches. The maintained compatibility corpus includes native and ATS-shaped field contexts, English/Indonesian labels, sensitive fields, file inputs, dynamic forms, and ambiguous questions. A vendor adapter is justified only after a reproducible generic-engine failure cannot be solved cleanly at the generic extraction/matching/filling layer.

See `docs/compatibility.md` for the evidence model and adapter gate.

## Security And Privacy

- Normal profile data is stored locally in extension storage.
- Sensitive profile data is stored separately in an authenticated encrypted vault envelope.
- Vault encryption uses PBKDF2-HMAC-SHA-256 and AES-256-GCM through Web Crypto.
- The vault passphrase is never persisted.
- The background runtime owns the unlocked vault session.
- Content scripts never receive the whole decrypted vault.
- Sensitive fill requests resolve only the approved current-page field paths.
- Wrong passphrase and tampered ciphertext fail closed.
- Host-page DOM/text is treated as untrusted input and is processed locally for matching.
- Fillio never clicks Submit, Apply, Next, or file inputs.
- Profile backup does not export vault values as plaintext.

See `docs/privacy.md` for the beta privacy disclosure.

## Release

The repository version is `0.1.0`. Create a distributable tag only from a verified `master` commit after PR review/CI and final manifest/privacy review. The release workflow is intentionally tag-driven and fail-closed; it must not be used to bypass required verification.

For external beta preparation, see `docs/chrome-web-store-beta.md`.
