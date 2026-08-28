# System Design

## Design intent

Job Flow is a local-first browser extension. Keep the architecture small: **functional core, imperative shell**. Pure domain/application logic owns meaning and policy; browser/DOM/storage/crypto/UI code owns side effects.

Do not turn a browser extension into an enterprise platform before the current product requirement creates that pressure.

## Design authority

The agent has high autonomy for ordinary local design decisions inside existing boundaries. Do not ask for approval for routine module structure, function decomposition, local reuse, or behavior-preserving refactoring.

The user owns material architecture decisions. Evidence and alternatives may be surfaced, but the agent must not silently change a material boundary.

A material architecture decision includes a meaningful change to one or more of:

- product-visible contract/semantics
- data ownership or destructive persisted-data behavior
- runtime/service ownership boundaries
- cross-context/public communication contracts
- consistency model
- infrastructure/network boundary
- privacy posture or browser permission surface
- framework/runtime architecture

If the user's explicit request already authorizes that material decision, execute it. Otherwise surface the decision before crossing the boundary.

## Smallest-design rule

Before introducing a design, determine:

1. What behavior must change?
2. Which existing component/module owns that behavior?
3. Can the requirement be implemented with the current architecture and patterns?
4. What is the smallest design with the lowest justified blast radius?

Prefer, in order:

1. reuse an existing pattern
2. extend an existing owner/component
3. introduce a small local abstraction when current pressure justifies it
4. change architecture only when the current architecture cannot reasonably satisfy the requirement

When multiple designs are valid, prefer lower coupling, smaller change surface, fewer new dependencies/abstractions, lower migration cost, easier reversibility, and clearer ownership.

Do not introduce architectural complexity for hypothetical scale, future reuse, flexibility, or unrequested roadmap items.

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

## Design escalation triggers

Do explicit design analysis only when the current change materially touches:

- persisted schema/migration/data integrity
- browser permission surface
- new network/data-flow boundary
- vault/crypto/sensitive disclosure
- cross-context messaging contract
- destructive data operation
- measured performance bottleneck requiring architectural change
- ATS-specific adapter after a reproducible generic-engine failure
- framework/runtime migration backed by measured evidence and authorized scope

A trigger means "analyze the boundary"; it does not automatically mean "create an architecture document" or "ask for approval." Ask for user approval only when the decision is material and not already authorized by the request.

Everything else should normally be handled as a small local change using existing boundaries.

## Anti-overengineering

Do not add without concrete current need and authorized scope:

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
