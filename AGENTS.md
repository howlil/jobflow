# Job Flow Agent Adapter

This file is the agent adapter into Job Flow's project-local Devland model. It routes work; it must not duplicate project truth.

## Read progressively

Always start with:

1. `.agent/iteration-state.md` — current work state and immediate scope.
2. `.agent/rules.md` — engineering policy, safety invariants, and verification rules.

Load only when the change touches the concern:

- `.agent/requirements.md` — product contract and acceptance format.
- `.agent/system-design.md` — architecture, runtime boundaries, and data flow.
- `.agent/code-patterns.md` — implementation conventions.
- `.agent/design.md` / `/DESIGN.md` — visual design.
- `.agent/git-strategy.md` — branch/PR/merge rules.
- `.agent/release-strategy.md` — release/version/rollback rules.
- `.agent/skills/<skill>/SKILL.md` — a focused profile only when its trigger applies.

## Devland semantic layers

| Layer              | Job Flow source                                                                 |
| ------------------ | ------------------------------------------------------------------------------- |
| Project            | `.agent/requirements.md`                                                        |
| Architecture       | `.agent/system-design.md`                                                       |
| Engineering policy | `.agent/rules.md`, `code-patterns.md`, `git-strategy.md`, `release-strategy.md` |
| Profiles           | `.agent/skills/`                                                                |
| Work state         | `.agent/iteration-state.md`                                                     |
| Agent adapter      | `AGENTS.md`                                                                     |

The universal unit of delivery is a **logical change/work item**. An iteration is an optional planning label, not a branch type, release train, or reason to batch unrelated work.

## Default execution loop

```text
problem
 -> smallest useful acceptance criteria
 -> identify realistic regression risk
 -> choose the cheapest high-signal verification
 -> test-first only when a deterministic test is the best tool
 -> implement minimum change
 -> focused verification
 -> draft PR early when non-trivial
 -> fast CI
 -> ready PR browser gate when runtime risk requires it
 -> squash merge
 -> observe real use
```

Rules of thumb:

- WIP = 1 logical change.
- Prefer a branch that lives less than one working day; split independent outcomes instead of extending the branch.
- Tests exist to reduce meaningful delivery risk, not to maximize test count or enforce TDD ceremony.
- Do not require TDD for presentation-only changes, styling/layout, static markup, copy, trivial wiring, or exploratory implementation.
- Prefer automated tests for domain invariants, data integrity, concurrency, migrations, security/privacy boundaries, provider contracts, and valuable deterministic regressions.
- Avoid duplicated confidence across unit, integration, and browser layers. Add a layer only when it protects a distinct risk.
- Before adding a test ask: **What realistic regression does this prevent?** If there is no strong answer, do not add it.
- Do not create planning/history/report files for routine work.
- Do not preserve dead code, old styling layers, or compatibility shims without a current caller and explicit reason.
- Never claim tests, CI, browser verification, merge, release, or deployment unless it was actually observed.
