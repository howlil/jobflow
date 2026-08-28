# Engineering Policy

These are Job Flow's default engineering rules. Optimize for **fast verified user value**, not ceremony or coding volume.

## 1. Flow first

- WIP = 1 logical change/work item.
- One change should produce one independently understandable outcome.
- Target a branch lifetime of less than one working day. This is a flow guardrail, not a developer KPI.
- If two outcomes can be merged/released independently, split them.
- Open a draft PR early for non-trivial work; do not hide 30+ checkpoint commits and open the PR only when the branch is already finished.
- Stop adding adjacent cleanup/features once acceptance criteria are satisfied. Ship, observe, then decide the next change.

## 2. Testing principle: risk, signal, cost

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

Avoid duplicated confidence across layers. Prefer the lowest-cost layer that proves the risk is controlled. Add integration or browser coverage only when it protects a boundary or regression that a lower layer cannot prove with comparable confidence.

For every proposed test ask:

> **What realistic regression does this prevent?**

If there is no strong answer, do not add the test.

## 3. Locked safety invariants

These outrank speed:

- no automatic Apply / Submit / Next
- no automatic file attachment; attachment is tied to explicit user action
- unknown/unsupported form behavior fails closed
- matching never directly authorizes DOM mutation; prepare a fill plan first
- sensitive values require vault state plus explicit disclosure/fill approval
- no profile/form/sensitive-data telemetry or network transmission in the current local-first product
- no remote executable code, `eval`, `new Function`, or custom cryptography
- least browser permissions; permission changes are high risk
- persisted structures remain versioned/validated and schema changes have migration/backward-compatibility evidence

## 4. Verification by risk

### Low risk

Docs, metadata, formatting, copy, presentation-only styling/layout, static markup, or a local mechanical refactor with unchanged behavior.

Run only the cheapest relevant checks. Do not add unit tests or browser E2E merely because a file changed.

### Medium risk

Normal UI behavior, matcher/extractor/filler behavior, messaging, correction memory, ordinary storage, document workflow.

During development use focused deterministic tests when they protect a realistic regression. Before integration, the ready PR runs browser acceptance when runtime behavior or an important browser boundary is touched.

### High risk

Vault/crypto, browser permissions, destructive data operations, schema migration, privacy/network boundaries, broad autofill safety rules, release workflow.

Require the relevant negative-path, security, migration, data-integrity, or contract evidence. Use browser acceptance only where it contributes unique integration confidence, then run the full release gate before publishing.

Never normalize flaky tests by repeatedly rerunning them until green. Treat flakiness as a delivery defect.

## 5. Simplicity rules

- KISS and YAGNI are defaults.
- Add an abstraction only for a known volatile boundary or repeated concept with real change pressure.
- Prefer plain data + pure functions for domain logic.
- Do not introduce DI containers, event buses, plugin systems, repository-per-entity layers, global state libraries, backend services, AI dependencies, or framework rewrites without a measured current problem.
- Remove dead code instead of commenting it out or leaving no-op compatibility shims.
- Do not keep two styling systems for the same UI surface.
- Validate untrusted data at storage/message/DOM/external boundaries.

## 6. Delivery metrics

Metrics diagnose the system; they do not score an agent or developer.

Primary:

- **change cycle time** — first task commit to merge on `master`
- **CI feedback time** — push/PR event to first actionable pass/failure
- **WIP age** — age of the active logical change
- **rework rate** — work needed because the same change was incorrect/incomplete, excluding deliberate refactoring
- **change failure rate** — merged/released changes causing rollback/hotfix/regression
- **escaped defect rate** — defects found outside the intended verification layer
- **flaky-test rate**
- **release frequency** when releases are meaningful

Useful guardrails, not promises:

- WIP: 1
- branch lifetime target: same working day / < 1 working day
- fast CI target: < 5 minutes when repository size permits
- one user/product outcome per PR

Commit count, LOC, PR count, test count, coverage percentage, and number of generated files are diagnostics only. A large commit count inside one PR is a batching smell, not a productivity achievement.

## 7. Definition of done

A change is done when:

1. acceptance criteria are met
2. obsolete path/code introduced or replaced by the change is removed
3. the cheapest relevant verification provides enough confidence for the actual risk
4. required CI/risk gates pass
5. current state/policy is updated only if the source of truth actually changed
6. the change can be explained as one concise user/engineering outcome
