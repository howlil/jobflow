# Job Flow Agent Adapter

This file is the agent adapter into Job Flow's project-local engineering model. It routes work; it must not duplicate or invent project truth.

## Read progressively

Always start with:

1. `.agent/iteration-state.md` — current committed work state/context; candidates are not authorization.
2. `.agent/rules.md` — canonical lifecycle, authority, testing, verification, quality gates, and stop conditions.

Load only when the current change touches the concern:

- `.agent/requirements.md` — product contract, invariants, scope/non-goals.
- `.agent/system-design.md` — architecture, runtime boundaries, data flow, material design boundary.
- `.agent/code-patterns.md` — implementation conventions.
- `.agent/design.md` / `/DESIGN.md` — visual design.
- `.agent/git-strategy.md` — integration mechanics when branch/PR handling matters.
- `.agent/release-strategy.md` — release-ready/distribution/rollback rules.
- `.agent/skills/<skill>/SKILL.md` — focused specialist guidance only when its trigger applies.

Do not load the entire `.agent/` tree or perform repo-wide reconnaissance by default. Expand context only when the requested change or discovered dependency materially requires it.

## Authority model

- The user owns WHY, WHAT, product scope/boundaries, product semantics, material architecture decisions, and final product/release decisions.
- The agent has high autonomy for ordinary local engineering execution once the bounded change is authorized.
- Do not ask for approval for routine implementation details.
- Evidence and recommendations do not authorize product scope expansion.
- If a material product/architecture decision is not already authorized, surface it instead of silently crossing the boundary.

## Canonical execution loop

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

Operationally:

```text
understand explicit request/problem
 -> inspect only the relevant existing implementation
 -> bound the smallest coherent change
 -> derive only the acceptance criteria needed to remove ambiguity
 -> choose the smallest design using existing ownership/patterns
 -> implement minimum change
 -> identify realistic regression risk
 -> choose cheapest high-signal verification
 -> add/test-first only when a deterministic test is the best tool
 -> run mandatory repository gates + justified risk-specific checks
 -> declare release-ready when evidence supports it
 -> stop
```

## Rules of thumb

- WIP target = 1 logical change.
- Do not introduce features because they are best practice or seem useful.
- Do not require repo-wide audits, bottleneck analysis, architecture reviews, metrics work, instrumentation, plans, or mini-PRDs for ordinary bounded tasks.
- Reuse/extend current ownership before adding abstractions or architecture.
- Do not refactor unrelated code.
- Remove the superseded local path once callers are migrated and the replacement is verified.
- Tests exist to reduce meaningful delivery risk, not to maximize test count or enforce TDD ceremony.
- Do not require TDD for presentation-only changes, styling/layout, static markup, copy, trivial wiring, or exploratory implementation.
- Prefer automated tests for domain invariants, data integrity, concurrency, migrations, security/privacy boundaries, provider contracts, and valuable deterministic regressions.
- Avoid duplicated confidence across unit, integration, and browser layers. Add a layer only when it protects a distinct realistic risk.
- Before adding a test ask: **What realistic regression does this prevent?** If there is no strong answer, do not add it.
- Branches/PRs are integration tools, not mandatory ceremony. Follow repository protection and use them when isolation/review/CI value justifies them.
- Never claim tests, CI, browser verification, merge, release, deployment, or observation unless it was actually observed.
- When the authorized outcome and justified gates are satisfied, stop. Do not continue into adjacent cleanup, polish, metrics, instrumentation, or speculative work.

## Stop and surface a decision when

- the request conflicts with an existing locked product invariant
- fulfilling it requires an unapproved material product-scope or product-semantics change
- a destructive/breaking persisted-data decision is required but not authorized
- a new privacy/network/permission boundary or material architecture change is required but not authorized
- a public/cross-context contract must change materially beyond the requested scope

Do not use these stop conditions to block ordinary local implementation decisions.
