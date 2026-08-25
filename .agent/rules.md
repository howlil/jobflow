# Engineering Policy

These are Fillio's default engineering rules. Optimize for **fast verified user value**, not ceremony or coding volume.

## 1. Flow first

- WIP = 1 logical change/work item.
- One change should produce one independently understandable outcome.
- Target a branch lifetime of less than one working day. This is a flow guardrail, not a developer KPI.
- If two outcomes can be merged/released independently, split them.
- Open a draft PR early for non-trivial work; do not hide 30+ checkpoint commits and open the PR only when the branch is already finished.
- Stop adding adjacent cleanup/features once acceptance criteria are satisfied. Ship, observe, then decide the next change.

## 2. XP loop without ritual

For a bug or observable behavior change:

```text
reproduce / failing test or fixture
 -> minimum implementation
 -> green focused tests
 -> refactor while green
```

Use test-first where it creates useful feedback. Do **not** manufacture RED tests for documentation, formatting, dependency metadata, or a mechanically behavior-preserving refactor. Those changes still require the smallest executable verification that can detect a mistake.

Tests should protect public behavior, invariants, failure modes, migrations, security boundaries, and compatibility. Avoid coupling tests to private implementation details.

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

Docs, metadata, formatting, local mechanical refactor with unchanged behavior.

Run only relevant static/focused checks. Browser E2E is not automatically required.

### Medium risk

Normal UI behavior, matcher/extractor/filler behavior, messaging, correction memory, ordinary storage, document workflow.

During development use focused tests. Draft PR CI stays fast. Before integration, the ready PR runs the browser acceptance gate when runtime behavior is touched.

### High risk

Vault/crypto, browser permissions, destructive data operations, schema migration, privacy/network boundaries, broad autofill safety rules, release workflow.

Require focused negative-path/security/migration tests as applicable, fast CI, browser acceptance before merge, and the full release gate before publishing.

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

Commit count, LOC, PR count, and number of generated files are diagnostics only. A large commit count inside one PR is a batching smell, not a productivity achievement.

## 7. Definition of done

A change is done when:

1. acceptance criteria are met
2. obsolete path/code introduced or replaced by the change is removed
3. relevant focused checks pass
4. required CI/risk gates pass
5. current state/policy is updated only if the source of truth actually changed
6. the change can be explained as one concise user/engineering outcome
