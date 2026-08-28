# Engineering Policy

These are Job Flow's canonical engineering rules. Optimize for **fast verified user value**, not ceremony, coding volume, or agent-generated scope.

## 1. Authority boundary

### User owns

- WHY and intended product outcome
- WHAT behavior/capability is in scope
- product boundaries and product semantics
- material architecture decisions
- final product direction and release/distribution decisions

### Agent owns

Once the user has authorized a bounded change, the agent should execute ordinary local engineering decisions autonomously, including:

- locating the relevant implementation
- deriving proportional observable acceptance criteria from clear intent
- choosing local code structure and reuse strategy
- making small behavior-preserving refactors needed for the change
- selecting verification depth by realistic risk
- removing superseded local implementation paths

Do not ask for approval for routine implementation details.

Evidence, best practices, or agent preference may justify a recommendation, but they do **not** authorize product scope expansion, new product semantics, or a material architecture change. Surface the decision when user authority is required.

## 2. Canonical lifecycle

There is one execution lifecycle:

```text
USER INTENT
 -> UNDERSTAND
 -> BOUND
 -> SPECIFY
 -> DESIGN
 -> IMPLEMENT
 -> VERIFY
 -> QUALITY GATES
 -> RELEASE READY
 -> STOP
```

### UNDERSTAND

Separate, when relevant:

- the problem
- the user's proposed solution
- the explicit requirement

Do not replace an explicit requirement with an unsolicited product recommendation. Surface contradictions or missing material decisions instead of silently inventing them.

### BOUND

Determine the smallest code/product surface needed for the request.

- inspect existing code and patterns only as far as needed to implement safely
- do not require repo-wide reconnaissance, broad audit, bottleneck analysis, P0/P1 inventory, metrics review, or architecture review for an ordinary bounded task
- expand inspection only when dependencies, risk, or uncertainty materially require it
- do not pull adjacent cleanup/features into the work item

WIP target is **1 logical change**.

### SPECIFY

Make the expected observable outcome explicit enough to implement and verify.

- derive concise acceptance criteria when the request is already clear
- use a lightweight requirement note only when it reduces ambiguity
- do not require a mini-PRD, a fixed number of acceptance criteria, or process artifacts for trivial/bounded work
- if the remaining ambiguity changes product scope, semantics, destructive behavior, or a material architecture decision, surface it to the user

### DESIGN

Use the smallest design that satisfies the current requirement while preserving existing system boundaries.

Prefer, in order:

1. reuse an existing pattern
2. extend the component/module that already owns the behavior
3. add a small local abstraction when current duplication/volatility justifies it
4. change architecture only when the existing architecture cannot reasonably satisfy the requirement

When multiple designs work, prefer lower coupling, smaller change surface, fewer dependencies/abstractions, lower migration cost, easier reversibility, and clearer ownership.

Material changes to product semantics, public contracts, data ownership, service/runtime boundaries, communication patterns, consistency model, infrastructure, privacy posture, or permission surface require explicit user approval unless the user's request already explicitly authorizes that decision.

### IMPLEMENT

Implement the minimum coherent change.

- preserve unrelated behavior
- do not refactor unrelated code
- do not introduce speculative flexibility or future architecture
- migrate current callers before deleting a replaced path
- remove obsolete code/styles/shims created or superseded by the change once callers are migrated and behavior is verified

### VERIFY

Choose verification from realistic failure risk, signal, and cost. See the testing principle below.

### QUALITY GATES

Pass the repository's mandatory integration checks plus any risk-specific checks justified by the change. Running an existing CI suite does not imply that every change needed new tests.

### RELEASE READY

A change is release-ready when the authorized outcome is satisfied, the change is coherent, relevant verification passed, required gates passed, and no known blocker remains within scope.

Release-ready is not the same as distributed/released. Actual distribution follows explicit user intent or an already-established release automation/policy.

### STOP

Once the authorized outcome is satisfied and justified gates pass, stop.

Do not continue with:

- adjacent features
- speculative refactors
- additional abstractions
- extra tests with no distinct regression risk
- instrumentation not needed for the current product decision
- generic metrics work
- extra docs/reports/polish that do not materially reduce delivery risk

## 3. Testing principle: risk, signal, cost

Tests exist to reduce **meaningful delivery risk**, not to maximize test count, coverage theater, or TDD ceremony.

Use TDD when a deterministic automated test is the **cheapest high-signal way** to define or protect behavior. A useful loop is:

```text
reproduce / focused failing test or fixture
 -> minimum implementation
 -> green focused test
 -> refactor while green
```

That loop is a tool, not a mandatory ritual.

Do **not** require TDD for:

- presentation-only changes
- styling or layout
- static markup
- copy
- trivial wiring
- exploratory implementation

Those changes still need the cheapest verification capable of catching a realistic mistake, such as static checks, a focused browser check, or direct inspection when appropriate.

Prioritize automated tests for:

- domain invariants
- persistence and data integrity
- concurrency
- migrations
- security and privacy boundaries
- provider or external contracts
- valuable deterministic regressions

Prefer testing public behavior, invariants, failure modes, and boundaries over private implementation details.

Avoid duplicated confidence across layers. Prefer the lowest-cost layer that proves the risk is controlled. Add integration or browser coverage only when it protects a distinct boundary/regression that a lower layer cannot prove with comparable confidence.

For every proposed test ask:

> **What realistic regression does this prevent?**

If there is no strong answer, do not add the test.

## 4. Locked safety invariants

These outrank speed:

- no automatic Apply / Submit / Next
- no automatic file attachment; attachment is tied to explicit user action
- unknown/unsupported form behavior fails closed
- matching never directly authorizes DOM mutation; prepare a fill plan first
- sensitive values require vault state plus explicit disclosure/fill approval
- no profile/form/sensitive-data telemetry or network transmission in the current local-first product
- no remote executable code, `eval`, `new Function`, or custom cryptography
- least browser permissions; permission expansion is product/security sensitive
- persisted structures remain versioned/validated and schema changes preserve data integrity with migration/backward-compatibility evidence when applicable

## 5. Verification by risk

### Low risk

Examples: docs, metadata, formatting, copy, presentation-only styling/layout, static markup, or a local mechanical refactor with unchanged behavior.

Use only the cheapest relevant checks. Do not add unit tests or browser E2E merely because a file changed.

### Medium risk

Examples: normal UI behavior, matcher/extractor/filler behavior, messaging, correction memory, ordinary storage, document workflow.

Use focused deterministic checks that protect the changed behavior/boundary. Add browser coverage only when browser/runtime semantics are part of the realistic risk.

### High risk

Examples: vault/crypto, permission changes, destructive data operations, schema migration, privacy/network boundaries, broad autofill safety rules, release workflow.

Use stronger risk-specific evidence such as negative paths, migration/data-integrity checks, contract/integration checks, security checks, and critical browser journeys as applicable.

Never normalize flaky tests by repeatedly rerunning them until green. Treat flakiness as a delivery defect.

## 6. Simplicity rules

- KISS and YAGNI are defaults.
- Add an abstraction only for a known volatile boundary or a repeated current concept with real change pressure.
- Prefer plain data + pure functions for domain logic.
- Do not introduce DI containers, event buses, plugin systems, repository-per-entity layers, global state libraries, backend services, AI dependencies, or framework rewrites without a measured current problem and authorized scope.
- Remove dead code instead of commenting it out or leaving no-op compatibility shims.
- Do not keep two styling systems for the same UI surface.
- Validate untrusted data at storage/message/DOM/external boundaries.

## 7. Metrics, instrumentation, and product learning

Metrics diagnose a question; they are not a default deliverable and do not score an agent/developer.

- do not require delivery-metric analysis before ordinary coding tasks
- do not add product instrumentation by default
- before a meaningful release, determine whether instrumentation/evidence is actually necessary to evaluate the expected outcome
- prefer existing evidence, deterministic compatibility fixtures, privacy-safe observation, or a trusted beta when sufficient
- never introduce invasive telemetry merely to satisfy a process rule

When the explicit task is to investigate delivery performance, useful metrics include change cycle time, CI feedback time, WIP age, rework/change-failure rate, escaped defects, flaky-test rate, and release frequency. Collect only what helps answer the current question.

After an actual release or meaningful real-world use, product evidence may support a recommendation to **keep, iterate, revert, remove, or investigate**. The user owns the final product decision.

## 8. Completion / stop condition

A logical change is complete when:

1. the authorized user/engineering outcome is satisfied
2. acceptance criteria needed for this change are met
3. obsolete path/code superseded by this change is removed when safe
4. relevant focused verification passes
5. mandatory integration/risk gates pass
6. architecture/product state documentation is updated only if its source of truth actually changed
7. no unresolved in-scope blocker remains

Then stop. Finished history belongs in Git/PR/release records, not in permanent agent process artifacts.
