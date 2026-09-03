# Jobflow Architecture

## Architectural intent

Jobflow is a local-first Manifest V3 browser extension built with WXT, React, TypeScript, Tailwind CSS, Zod, and local browser storage. The architectural shape is a **functional core with imperative shells**: domain/application logic owns meaning and policy; browser, DOM, storage, crypto, and UI code own side effects.

## Runtime topology

```text
Workspace / In-page Assistant
          |
          v
Application orchestration
          |
          v
Domain policy + plain serializable data
          ^
          |
Infrastructure adapters
DOM | browser messaging | storage | IndexedDB | Web Crypto
```

The browser toolbar action is a launcher owned by the background runtime, not a separate product UI. It asks the active content script to open the Assistant; if no supported application context is available it opens Workspace.

### Content script

Owns:

- DOM discovery and extraction
- relevant dynamic-page observation
- isolated in-page Assistant mounting
- current-page Application Profile override/re-analysis
- execution of approved fill instructions

It must not own canonical profile persistence, application persistence policy, vault passphrase/key lifecycle, or business matching policy.

### Background service worker

Owns browser-level coordination where required, context-aware toolbar routing, Workspace opening, and the sensitive-vault session boundary. Treat the Manifest V3 worker as ephemeral; durable state must not depend on module lifetime.

### Workspace / in-page React UI

Own presentation, local interaction state, and explicit user actions. Matching policy, storage migrations, and crypto policy do not belong in React components.

## Module ownership

```text
src/domain
  pure domain models, validation, state transitions, matching/fill policy

src/application
  use-case orchestration across domain behavior and ports

src/infrastructure
  browser storage, IndexedDB, Web Crypto, DOM/browser adapters

src/components
  React presentation and domain-owned UI composition

entrypoints
  WXT runtime shells and extension mounting/wiring

e2e
  optional browser diagnostic fixtures; not a merge/release acceptance layer
```

Dependency direction:

```text
UI / entrypoints -> application -> domain
infrastructure -> application/domain contracts
```

Forbidden dependency direction:

```text
domain -> React / WXT / chrome.* / DOM
matcher -> DOM mutation
filler -> profile persistence
UI -> raw crypto implementation
content script -> wholesale decrypted vault state
```

## Core autofill flow

```text
host DOM
 -> scan / extract serializable FieldContext
 -> site correction lookup
 -> deterministic matcher
 -> MatchResult
 -> resolve base profile + optional application variant
 -> fill policy + sensitivity policy
 -> FillPlan
 -> user review / approval
 -> DOM filler
 -> normal browser/page events
```

A semantic match is evidence, not authorization to mutate the page.

## Dynamic-page flow

```text
MutationObserver
 -> relevance filter
 -> debounce
 -> fingerprint/change comparison
 -> analyze changed area
 -> publish analysis state
```

Do not busy-poll or perform full re-analysis for every mutation. Ignore Jobflow's own injected UI mutations.

## Persistence ownership

- Base career profile: one versioned canonical local profile.
- Application variants: lightweight overrides over the base profile, surfaced to users as Application Profiles.
- Applications: versioned local collection with explicit migrations.
- Corrections: local persistence scoped to site/form/field identity, surfaced as Autofill Memory.
- Documents: metadata plus extension-owned local binaries.
- Sensitive vault: encrypted local persistence, separate from normal profile storage.
- Page analysis and current page override: ephemeral and reconstructable.

Validate untrusted persisted/imported/message/DOM data at the boundary. Persisted schema changes require sequential migration and compatibility evidence.

## Sensitive-data trust boundary

- Vault plaintext and passphrase are not normal profile/UI state.
- Passphrases are never persisted.
- Encryption uses Web Crypto rather than custom cryptography.
- Unlock/session material must not be exposed wholesale to content scripts.
- Recognizing a sensitive field does not authorize disclosure.
- New network, telemetry, sync, remote-AI, or broader permission boundaries are material architecture/security changes.

## UI architecture

Jobflow has two materially different rendering environments:

1. Full-tab Workspace using shared Tailwind tokens and owned reusable components.
2. In-page Assistant rendered in an isolated Shadow DOM; host-page CSS must not control it and document-level Tailwind must not be assumed to cross the boundary.

There is no browser-action popup React surface. The technical `options` entrypoint may remain because it is a browser-extension shell detail; user-facing semantics are Workspace.

Visual and interaction rules are owned by `.agents/DESIGN.md`.

## Architecture invariants

- Keep browser APIs at the edge.
- Prefer pure functions for normalization, matching, migrations, variant resolution, fill-plan decisions, and deterministic guidance.
- Prefer plain serializable data across runtime boundaries.
- State has one clear owner; do not create multiple writable canonical copies.
- Add ports/interfaces only at actual volatile external boundaries.
- Do not introduce backend/services, DI containers, event buses, plugin frameworks, generic repository-per-entity layers, or global state libraries without a current authorized need.
- Permission expansion, persisted destructive changes, new network boundaries, and material cross-context protocol changes require explicit approval unless already authorized by the user's request.
