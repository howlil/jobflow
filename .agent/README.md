# Fillio Engineering System

`.agent/` is a small semantic project model, not a documentation archive. Its purpose is to reduce ambiguity and shorten the path from problem to verified user value.

## Canonical components

| Concern | Source of truth | Purpose |
| --- | --- | --- |
| Project / requirements | `requirements.md` | Product outcome, invariants, acceptance format, product metrics |
| System design | `system-design.md` | Runtime contexts, data flow, dependency boundaries, design escalation triggers |
| Engineering rules | `rules.md` | Lean/XP delivery policy, safety, verification, delivery metrics |
| Code patterns | `code-patterns.md` | Small implementation patterns and anti-patterns |
| Work state | `iteration-state.md` | Current state only; iteration naming is optional |
| Git strategy | `git-strategy.md` | Trunk-based small-batch integration |
| Release strategy | `release-strategy.md` | Release candidate, versioning, gates, rollback |
| Skills / profiles | `skills/` | On-demand specialist guidance |
| Visual design | `design.md` -> `/DESIGN.md` | UI source-of-truth routing |

Root `AGENTS.md` is only the adapter/router for coding agents.

## Operating principles

1. User outcome over process artifacts.
2. Small reversible changes over feature trains.
3. WIP = 1; finish before starting adjacent scope.
4. Test behavior and risk, not implementation trivia.
5. Focused local feedback first; broaden verification only when risk requires it.
6. KISS/YAGNI before abstractions. Introduce a layer only after real change pressure.
7. Delete obsolete code and obsolete decisions instead of keeping parallel paths.
8. Preserve the expensive-to-repair boundaries: privacy, sensitive data, explicit user action, persisted-data migration, browser permissions, and no automatic submission.

## Artifact discipline

Keep only live policy/state in source control.

Do not commit:

- historical iteration plans after the decision is captured in code/current state
- screenshots or visual audit evidence that belongs in CI/run artifacts
- command transcripts, task reports, checkpoint reports, or agent scratchpads
- speculative skills for features that are explicit non-goals

A plan is justified only for a risky migration or a multi-step change that cannot be represented clearly by acceptance criteria. Prefer an issue/PR description or temporary scratchpad; do not build a permanent plan archive.
