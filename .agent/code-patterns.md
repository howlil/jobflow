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
- User/site corrections as data. Add a site adapter only after a reproducible generic-engine failure and authorized scope.
- Local React state/hooks first. Persistent state belongs in repositories, not a global UI store.
- Define/confirm contracts first only when a change crosses a real module/runtime/provider boundary; do not add contract ceremony to trivial local wiring.

## Abstraction test

Create an abstraction only when at least one is true:

1. the boundary is inherently external/volatile, or
2. two or more current callers implement the same concept and change together, or
3. a high-value side effect needs a narrow controllable boundary for current behavior/verification.

Do not add a layer merely because a design pattern exists or to make hypothetical future tests easier.

Avoid generic dumping grounds named `utils`, `helpers`, `manager`, or `service`. Name modules by the concept they own.

## Refactoring and legacy removal

A replacement is incomplete while the superseded path is still maintained without a current need.

When changing an implementation:

1. move callers to the new path
2. verify the realistic behavior/risk affected
3. delete dead imports/files/styles/adapters/shims
4. update one canonical source of truth only if architecture/policy actually changed

Do not keep commented code, `old-*`, `legacy-*`, no-op compatibility files, duplicate CSS systems, or speculative adapters as insurance. Git history is the rollback reference.

Do not refactor unrelated code merely because it is nearby. Local cleanup is justified when it is necessary to complete the current replacement or materially reduces the risk of the requested change.

## Testing pattern

Select tests by regression risk, not by file type or ceremony.

- Behavior bug: reproduce the failure; add a deterministic regression test when that is the cheapest high-signal protection.
- Pure/domain invariant: focused unit/fixture test is usually the cheapest strong layer.
- UI behavior: component/browser test only when meaningful behavior is at risk; presentation-only styling/layout does not require a new automated test.
- DOM/browser/message boundary: integration/browser test when runtime semantics are the distinct risk.
- Migration/security/destructive behavior: strong positive + negative/failure-path evidence as applicable.
- Mechanical behavior-preserving refactor: existing focused tests/static checks are usually enough; do not invent a fake RED test.
- Exploratory implementation: do not force TDD before the behavior/design is stable enough for a valuable deterministic test.

For every new test ask: **What realistic regression does this prevent?** If the answer is weak or duplicates confidence already proven at a cheaper layer, do not add it.

The goal is short reliable feedback, not maximizing test count or proving that a process ritual was followed.
