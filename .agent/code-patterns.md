# Code Patterns

This file defines **what good Job Flow code and codebase structure look like**. Execution workflow, authority, scope control, and verification policy remain canonical in `rules.md`. Runtime architecture and boundary ownership remain canonical in `system-design.md`.

## 1. Core codebase invariants

Prefer the **smallest correct, clear, maintainable change** that satisfies the authorized behavior.

```text
correctness -> preserve required behavior and invariants
clarity -> intent and ownership are obvious from the code
maintainability -> the next safe change is easy to locate and reason about
proportionality -> change surface matches the requirement and realistic risk
```

Defaults:

```text
KISS -> solve the current problem simply
YAGNI -> no future layer without current need
DRY -> abstract a shared concept only when duplication creates real maintenance pressure
SRP -> one useful reason to change at module/function boundaries
functional core -> pure domain transformations
imperative shell -> DOM/browser/storage/crypto side effects
```

Follow existing repository conventions unless they are the thing being intentionally changed. Do not invent a second naming, folder, state-management, styling, dependency, or error-handling convention for a local preference.

## 2. Change surface

A good change is bounded and proportional.

- Touch only code required for the behavior, its owning boundary, necessary callers, realistic verification, and obsolete paths directly superseded by the change.
- Preserve unrelated behavior and public/internal contracts outside the authorized scope.
- Do not refactor nearby code merely because it could be cleaner.
- Do not introduce speculative flexibility, generic frameworks, future adapters, or configuration for hypothetical requirements.
- Prefer modifying the existing owner over creating parallel paths.
- When several designs are valid, prefer the one with fewer changed files, dependencies, concepts, migration steps, and hidden consequences while remaining clear and maintainable.

Use this design order:

1. reuse an existing pattern
2. extend the module/component that already owns the behavior
3. add a small local abstraction when current duplication or volatility justifies it
4. change architecture only when the existing boundaries cannot reasonably support the requirement

## 3. Code organization and ownership

Organize code from behavior outward:

```text
behavior
 -> owner
 -> boundary
 -> module
 -> file
```

Do not start from an arbitrary folder/file template and force behavior into it.

### Cohesion

A module should group code that:

- implements one current concept or responsibility
- changes for related reasons
- has a clear owner/boundary
- can be understood without scanning unrelated concerns

Split a module when the split improves at least one real property:

- ownership becomes clearer
- navigation becomes easier
- dependency direction becomes cleaner
- independently changing behavior becomes isolated
- side effects can be kept at a narrow boundary

Do **not** split solely because a file crossed an arbitrary line count. Large cohesive code can be preferable to many tiny files with distributed logic.

Avoid:

- folder-per-file structures with no navigation value
- deep directory nesting that only mirrors implementation details
- one-file-per-function ceremony
- horizontal `common/`, `misc/`, `utils/`, or `helpers/` dumping grounds
- generic `manager` or `service` modules with unclear ownership

Name modules and folders by the behavior/domain concept they own. Prefer feature/domain-oriented grouping when it makes ownership and change locality clearer.

## 4. Dependency discipline

Keep dependency direction obvious and acyclic.

```text
UI/entrypoints -> application -> domain
infrastructure -> domain/application contracts
```

Rules:

- Domain code must not import React, WXT, `chrome.*`, `window`, `document`, DOM element types, storage clients, crypto clients, or infrastructure implementations.
- Do not create dependency cycles. If two modules require each other's internals, re-evaluate ownership or extract the actual shared concept at the appropriate lower boundary.
- Do not hide dependencies through mutable globals, ambient singletons, module initialization side effects, or implicit runtime state.
- Pass dependencies/data explicitly at useful boundaries, but do not introduce DI containers for ordinary local wiring.
- Add an interface/port only for a real external/volatile boundary or when multiple current implementations need a stable contract.
- Do not wrap a stable dependency merely to claim abstraction.
- New packages/dependencies require a current capability or meaningful reduction in implementation/risk. Prefer platform/runtime/repository capabilities that already exist when they are sufficient.
- Remove packages that become unused because of the current replacement.

## 5. Implementation quality

Prefer code that is easy to read in one pass.

### Naming

- Names should describe domain intent, state, or action rather than implementation trivia.
- Use the repository's established terminology for the same concept.
- Avoid vague names such as `data`, `item`, `thing`, `handler`, `processor`, `manager`, or `helper` when a more specific concept is available.
- Boolean names should make the true state understandable.
- Keep semantic field names independent from ATS/site-specific wording.

### Control flow

- Prefer obvious linear flow over clever compactness.
- Use early returns/guard clauses when they reduce nesting and make invalid states visible.
- Keep branching close to the decision it represents.
- Avoid boolean-flag mazes and functions whose meaning depends on several unrelated mode parameters.
- Prefer explicit state transitions over mutation spread across unrelated callbacks.
- Keep cognitive complexity low enough that behavior can be reasoned about locally; split by responsibility when complexity comes from multiple concepts, not merely to reduce line count.

### Data and transformations

- Prefer plain serializable data across boundaries.
- Prefer pure functions for deterministic domain transformations.
- Validate untrusted data at persistence, message, import, DOM, and external boundaries.
- Make invalid/unknown states explicit rather than silently coercing them into a valid-looking value.
- Preserve canonical semantic representations internally; translate provider/site-specific representations at boundaries.

Use language/framework conventions where they are simple and established. Do not create custom patterns where idiomatic TypeScript/React/WXT/platform behavior is already adequate.

## 6. Abstraction rules

Create an abstraction only when at least one is true:

1. the boundary is inherently external or volatile
2. two or more current callers implement the same concept and are expected to change together
3. a high-value side effect needs a narrow controllable boundary for current behavior or verification
4. current complexity cannot be made clear through simpler ownership/module boundaries

Duplication alone is not enough. Ask whether the duplicated code represents the **same concept with the same reason to change**.

Avoid:

- wrapper-on-wrapper layers
- helper explosions that scatter one behavior across many files
- abstract base classes or generic factories for one implementation
- repository-per-entity/service-per-file ceremony
- plugin/event-bus/DI infrastructure without current pressure
- abstractions created only to make hypothetical future testing easier

The abstraction must reduce current reasoning or change cost more than it adds indirection.

## 7. State and error handling

State must have a clear owner.

- Local transient UI state stays local by default.
- Persistent state belongs behind the persistence owner/repository rather than in a global UI store.
- Cross-runtime state must have an explicit durable or message-owned source of truth; do not rely on service-worker/module lifetime.
- Derive state where cheaper and safer than synchronizing duplicate copies.
- Avoid multiple writable sources of truth for the same concept.

Errors should preserve useful meaning.

- Distinguish expected domain outcomes from unexpected failures.
- Prefer typed/discriminated results for expected states such as `ready | review | unknown` rather than exceptions for normal control flow.
- Do not swallow errors silently.
- Add context at boundaries without destroying the original cause.
- User-facing errors should describe an actionable state without leaking sensitive data or implementation internals.
- Fail closed at safety/privacy/autofill boundaries when the state cannot be proven safe.

## 8. Repository hygiene

Keep the repository as one coherent current system, not an archive of old approaches.

- One canonical implementation per current behavior unless multiple implementations are intentionally required.
- One canonical configuration/source of truth for the same concern.
- Do not keep duplicate configs, scripts, generated artifacts, styling systems, adapters, or compatibility paths without a current consumer.
- Remove dead imports, files, scripts, dependencies, styles, configs, and shims made obsolete by the current change.
- Do not keep commented-out code, `old-*`, `legacy-*`, `backup-*`, or no-op compatibility files as insurance; Git history is the rollback reference.
- Do not delete valuable product requirements, architecture decisions, migration context, or current operating policy merely because implementation changed. Update the canonical source when the underlying decision truly changed.
- Generated/runtime evidence belongs in the appropriate artifact location, not as permanent source-tree clutter unless the repository explicitly treats it as source.

## 9. Refactoring and legacy removal

Refactor only with a current reason: required behavior, removal of a superseded path, or material reduction of risk/complexity for the requested change.

A replacement is incomplete while an obsolete path is still maintained without a current need.

When replacing an implementation:

1. identify the actual current callers/consumers
2. move them to the new path
3. verify the realistic behavior and boundary risk affected
4. delete superseded code/config/styles/adapters/shims/dependencies
5. update the canonical architecture/policy source only when its underlying decision changed

Do not combine unrelated cleanup into a feature/fix. If cleanup is independently valuable but not necessary for the current outcome, leave it out.

## 10. Risk-based verification pattern

`rules.md` owns verification policy. At code-pattern level, verification should protect realistic regressions without duplicating confidence.

- Behavior bug: reproduce the failure; add a deterministic regression test when that is the cheapest high-signal protection.
- Pure/domain invariant: focused unit/fixture test is usually the cheapest strong layer.
- UI behavior: component/browser test only when meaningful behavior is at risk; presentation-only styling/layout does not require a new automated test.
- DOM/browser/message/provider boundary: integration/browser/contract test when boundary semantics are the distinct risk.
- Persistence/migration: verify data integrity, compatibility, and failure paths proportionally to risk.
- Security/privacy/destructive behavior: use strong positive and negative/failure-path evidence as applicable.
- Concurrency/retry/idempotency behavior: test ordering, duplication, race, retry, or recovery only when that behavior exists in the changed surface.
- Performance-sensitive change: measure the relevant path only when latency, throughput, memory, bundle size, or runtime cost is an actual requirement or regression risk.
- Mechanical behavior-preserving refactor: existing focused tests/static checks are usually enough; do not invent a fake RED test.
- Exploratory implementation: do not force TDD before behavior/design is stable enough for a valuable deterministic test.

For every new test ask:

> **What realistic regression does this prevent?**

If the answer is weak or duplicates confidence already proven at a cheaper layer, do not add it.

## 11. Job Flow implementation overlay

Apply the general rules above with these existing Job Flow patterns:

- Pure functions for normalization, variant resolution, matching policy, scoring, migration, and fill-plan decisions.
- Plain discriminated unions/results for `ready | review | unknown`, expected failures, and explicit state transitions.
- Narrow stateful adapters for browser storage, IndexedDB, Web Crypto, messaging, and DOM operations.
- Canonical semantic field keys independent from ATS/site wording.
- Convert host-page inputs into serializable `FieldContext` before entering matcher/domain code; do not pass `HTMLElement` into domain logic.
- Treat user/site corrections as data. Add a site adapter only after a reproducible generic-engine failure and authorized scope.
- Use local React state/hooks first; persistent state belongs in its persistence owner, not a global UI store.
- Define/confirm contracts first only when a change crosses a real module/runtime/provider boundary; do not add contract ceremony to trivial local wiring.

The target is a codebase where the next engineer or agent can quickly answer:

```text
Where does this behavior belong?
What does it depend on?
What can it affect?
What invariant protects it?
What is the smallest safe place to change it?
```
