# System Design

## Design intent

Job Flow is a local-first browser extension. Keep the architecture small: **functional core, imperative shell**. Pure domain/application logic owns meaning and policy; browser/DOM/storage/crypto/UI code owns side effects.

Do not turn a browser extension into an enterprise platform before the product creates that pressure.

## Runtime contexts

```text
Options / Popup / In-page UI
          |
          v
Application orchestration
          |
          v
Domain policy + plain data
          ^
          |
Infrastructure adapters
DOM | WXT/browser messaging | storage | IndexedDB | Web Crypto
```

### Content script

Owns DOM discovery/extraction, relevant mutation observation, isolated in-page UI, and execution of approved fill instructions. It does not own canonical profile persistence or vault key/passphrase lifecycle.

### Background service worker

Owns browser-level coordination where needed and the sensitive vault session boundary. Treat Manifest V3 workers as ephemeral, not as a permanently running server.

### Options / popup / in-page UI

Own presentation and explicit user actions. Business matching, storage migrations, and crypto policy do not belong inside React components.

## Core data flow

```text
host DOM
 -> scan / extract serializable FieldContext
 -> site correction lookup
 -> deterministic matcher
 -> MatchResult
 -> resolve profile/application variant
 -> fill policy + sensitivity policy
 -> FillPlan
 -> user review / approval
 -> DOM filler
 -> normal browser/page events
```

A match is semantic evidence, not authorization to mutate the page.

## Dependency rules

Allowed:

```text
UI/entrypoints -> application -> domain
infrastructure -> application/domain contracts
```

Forbidden:

```text
domain -> React/WXT/chrome.* / DOM
matcher -> DOM mutation
filler -> profile persistence
UI -> raw crypto implementation
content script -> wholesale decrypted vault state
```

Use a port/interface only at an actual volatile external boundary such as profile persistence, correction persistence, document persistence, browser messaging, or vault storage/session behavior. Do not create interfaces for every noun.

## State ownership

- canonical reusable career facts: one versioned base profile
- application-specific differences: lightweight variant overrides, never a full duplicated profile
- persistent browser state: repository/adapters with runtime validation and sequential migrations
- document binaries: extension-owned local document storage
- vault: encrypted persistence; unlock/key material kept outside normal profile/content-script state
- page analysis: ephemeral per-page state

## Dynamic pages

```text
MutationObserver
 -> relevance filter
 -> debounce
 -> fingerprint/change comparison
 -> analyze changed area
 -> publish analysis state
```

No busy polling and no full re-analysis for every mutation. Ignore Job Flow's own injected UI mutations.

## Architecture escalation triggers

A change deserves explicit design work only when it crosses one of these boundaries:

- persisted schema/migration
- browser permission surface
- new network/data-flow boundary
- vault/crypto/sensitive disclosure
- cross-context messaging contract
- destructive data operation
- measured performance bottleneck requiring architectural change
- ATS-specific adapter after a reproducible generic-engine failure
- framework/runtime migration backed by measured evidence

Everything else should normally be handled as a small local change using existing boundaries.

## Anti-overengineering

Do not add without concrete evidence:

- backend or distributed service architecture
- DI container/service locator
- event bus/CQRS
- plugin framework
- generic repository per entity
- global state library
- caching layer before measurement
- multiple styling systems for one surface
- second canonical profile model for imports/sync
- generalized ATS abstraction before at least one real incompatible case

Prefer deleting a wrong abstraction over extending it to justify its existence.
