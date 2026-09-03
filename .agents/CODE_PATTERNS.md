# Jobflow Code Patterns

This file contains repository-specific implementation conventions. Generic SWE lifecycle, scope control, minimum-change, and code-quality principles come from the user's global agent rules and are not duplicated here.

## Repository shape

```text
entrypoints/          WXT runtime entrypoints and mounting/wiring
src/domain/           pure domain models, validation, policy, migrations
src/application/      use-case orchestration and application services
src/infrastructure/   browser/DOM/storage/crypto adapters
src/components/       React UI primitives, layouts, and domain UI
e2e/                  optional browser diagnostic fixtures; not a required gate
```

Prefer behavior/domain ownership over generic `utils`, `helpers`, `manager`, or `service` dumping grounds.

## Domain and application code

- Keep domain functions browser-free and React-free.
- Use pure functions for normalization, matching/scoring policy, fill-plan decisions, migrations, variant resolution, and deterministic application guidance.
- Use plain serializable data between runtime boundaries.
- Use explicit/discriminated results for normal domain states such as `ready | review | unknown` rather than exceptions.
- Canonical semantic field keys are independent from ATS/site wording.
- Convert host-page controls into serializable `FieldContext` before matcher/domain logic.
- Matching, fill authorization, and DOM mutation remain separate concerns.

## Browser and infrastructure boundaries

- Content scripts own DOM scanning/extraction and execution of approved fill instructions.
- Background code owns browser coordination and sensitive-vault session operations where needed.
- Persisted state belongs behind its storage/repository owner rather than React global state.
- Treat Manifest V3 service-worker module state as ephemeral.
- Browser messages are small, typed, serializable, and intent-based.
- Do not send the whole decrypted vault to content scripts.
- Dynamic-page observation uses MutationObserver → relevance filter → debounce → fingerprint/change check → targeted analysis.

## Persistence

- Persisted structures are versioned and runtime-validated.
- Schema migrations are sequential and preserve supported historical data.
- A new persisted version requires focused migration/data-integrity evidence.
- Base career profile is canonical; application variants are overrides rather than duplicated profiles.
- Application pipeline state remains versioned local storage.
- Document binaries remain extension-owned local data.

## React and UI composition

```text
src/components/ui/*          reusable low-level controls/surfaces
src/components/layout/*      reusable workspace shell/section layout
src/components/profile/*     career-profile domain UI
src/components/applications/* application pipeline/detail UI
src/components/documents/*   documents/resumes UI
src/components/vault/*       sensitive vault UI
src/components/corrections/* correction-memory UI
src/components/floating/*    in-page assistant
src/components/popup/*       browser-action surface
```

- Shared primitives own visual rhythm, focus behavior, sizing, accessibility, and common interaction states.
- Domain components own product wording, domain state, and composed behavior.
- Local transient UI state stays local by default.
- Persisted data must not be mirrored into multiple independent writable stores.
- Use Tailwind utilities for feature composition; shared repeated concepts belong in owned React primitives.
- The in-page assistant is a Shadow-DOM styling/runtime boundary and keeps an isolated surface bundle.
- Use `lucide-react` for product UI icons; do not mix icon packs or handcrafted product SVGs.

Visual behavior is owned by `.agents/DESIGN.md`.

## Autofill matching conventions

Evidence precedence:

1. user site/form correction
2. canonical exact alias
3. label/accessibility/name/id agreement
4. section/question context
5. conservative heuristic similarity
6. unknown

- User corrections outrank generic rules but remain site/form/field scoped rather than global training data.
- Internal scores are implementation details, not user-facing probabilities.
- Repeated Experience/Education fields should fall back to Review when the correct record cannot be determined safely.
- Add ATS-specific behavior only after a reproducible generic-engine failure and authorized scope.

## Sensitive-data conventions

- Normal profile and vault are separate storage concerns.
- Use Web Crypto only; never custom cryptography or reversible obfuscation.
- Passphrases are never persisted.
- A vault unlock is not site disclosure consent.
- Never log passphrases, key material, decrypted vault payloads, IDs, compensation, family/reference details, or sensitive document content.

## Imports and boundaries

Follow the existing dependency direction rather than creating new cross-layer shortcuts:

```text
UI / entrypoints -> application -> domain
infrastructure -> domain/application contracts
```

If two modules need each other's internals, re-evaluate ownership instead of introducing a cycle.

## Common implementation traps

- business policy inside React components
- domain code importing `chrome.*`, `window`, `document`, WXT, or React
- generated CSS selectors as field identity
- broad host permissions for hypothetical future use
- whole-document rescan on every mutation
- multiple canonical profile copies
- storing career data in host-page `localStorage`
- feature-local visual tokens when shared Jobflow tokens already exist
- parallel old/new styling or persistence paths after callers are migrated

## Frequently used commands

Exact verification ownership lives in `.agents/QUALITY.md`; common deterministic development commands are:

```bash
pnpm dev
pnpm test
pnpm typecheck
pnpm lint
pnpm format
pnpm build
```
