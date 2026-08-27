# Fillio Agent Adapter

This file is the agent adapter into Fillio's project-local Devland model. It routes work; it must not duplicate project truth.

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

| Layer              | Fillio source                                                                   |
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
 -> test/fixture when behavior changes
 -> implement minimum change
 -> focused verification
 -> draft PR early when non-trivial
 -> fast CI
 -> ready PR browser gate when runtime is affected
 -> squash merge
 -> observe real use
```

Rules of thumb:

- WIP = 1 logical change.
- Prefer a branch that lives less than one working day; split independent outcomes instead of extending the branch.
- Do not create planning/history/report files for routine work.
- Do not preserve dead code, old styling layers, or compatibility shims without a current caller and explicit reason.
- Never claim tests, CI, browser verification, merge, release, or deployment unless it was actually observed.
