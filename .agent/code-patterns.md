# Code Patterns

## Default style

Use boring TypeScript, explicit data flow, small modules, and plain data. Optimize for the next safe change, not for architectural symmetry.

```text
KISS -> solve the current problem simply
YAGNI -> no future layer without current need
DRY -> abstract the same concept after real duplication
SRP -> one reason to change at useful module/function boundaries
functional core -> pure domain transformations
imperative shell -> DOM/browser/storage/crypto side effects
```

## Dependency direction

```text
UI/entrypoints -> application -> domain
infrastructure -> domain/application contracts
```

Domain code must not import React, WXT, `chrome.*`, `window`, `document`, or DOM element types.

## Preferred patterns

- Pure functions for normalization, variant resolution, matching policy, scoring, migration, and fill-plan decisions.
- Plain discriminated unions/results for `ready | review | unknown`, expected failures, and explicit state transitions.
- Runtime validation at persistence, message, import, and host-page boundaries.
- Narrow stateful adapters for browser storage, IndexedDB, Web Crypto, messaging, and DOM operations.
- Canonical semantic field keys independent from ATS/site wording.
- Serializable `FieldContext` before entering matcher/domain code; do not pass `HTMLElement` into the domain.
- User/site corrections as data. Add a site adapter only after a reproducible generic-engine failure.
- Local React state/hooks first. Persistent state belongs in repositories, not a global UI store.

## Abstraction test

Create an abstraction only when at least one is true:

1. the boundary is inherently external/volatile, or
2. two or more current callers implement the same concept and change together, or
3. tests need a narrow controllable boundary around a side effect.

Do not add a layer because a design pattern exists.

Avoid generic dumping grounds named `utils`, `helpers`, `manager`, or `service`. Name modules by the concept they own.

## Refactoring and legacy removal

A replacement is incomplete while the superseded path is still maintained without a current need.

When changing an implementation:

1. move callers to the new path
2. verify behavior
3. delete dead imports/files/styles/adapters/shims
4. update one canonical source of truth if the architecture/policy actually changed

Do not keep commented code, `old-*`, `legacy-*`, no-op compatibility files, duplicate CSS systems, or speculative adapters as insurance. Git history is the rollback reference.

## Testing pattern

- Behavior bug: reproduce first, then fix.
- Pure/domain behavior: focused unit/fixture tests.
- UI behavior: component tests only for meaningful behavior; avoid snapshot churn.
- DOM/browser/message behavior: browser/integration test when that boundary is the subject.
- Migration/security/destructive behavior: positive + negative/failure-path evidence.
- Mechanical behavior-preserving refactor: existing focused tests/static checks are enough; do not invent a fake RED test.

The goal is short reliable feedback, not maximizing test count.
