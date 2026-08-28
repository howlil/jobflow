# Job Flow Engineering System

`.agent/` is a small semantic project model, not a documentation archive. Its purpose is to reduce ambiguity and shorten the path from explicit user intent to a verified, release-ready change.

## Canonical operating model

Job Flow uses one engineering lifecycle:

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

`rules.md` is the canonical source for how this lifecycle is executed. Other files refine a concern; they must not introduce a competing workflow.

Authority is intentionally asymmetric:

- **User:** WHY, WHAT, product scope/boundaries, product semantics, material architecture decisions, and final product/release decisions.
- **Agent:** high autonomy for ordinary local engineering decisions needed to implement an already-authorized bounded change.

Evidence may support a recommendation. It does not authorize the agent to expand product scope or make a material product/architecture decision on the user's behalf.

## Canonical components

| Concern | Source of truth | Purpose |
| --- | --- | --- |
| Product contract | `requirements.md` | Current product job, invariants, scope/non-goals, proportional requirement discipline |
| System design | `system-design.md` | Runtime/data boundaries, smallest-design rule, architecture approval boundary |
| Engineering rules | `rules.md` | Canonical lifecycle, authority, testing, verification, quality gates, stop conditions |
| Code patterns | `code-patterns.md` | Small implementation patterns and anti-patterns |
| Work state | `iteration-state.md` | Current committed WIP/state only; candidates are not authorization |
| Git strategy | `git-strategy.md` | Small-batch integration without PR/branch ceremony |
| Release strategy | `release-strategy.md` | Release-ready boundary, distribution, observation, rollback |
| Skills / profiles | `skills/` | On-demand specialist guidance narrower than global policy |
| Visual design | `design.md` -> `/DESIGN.md` | UI source-of-truth routing |

Root `AGENTS.md` is only the adapter/router for coding agents.

## Operating principles

1. Explicit user intent over agent-generated scope.
2. Understand and bound the requested change before designing it; do not default to repo-wide audit or bottleneck analysis.
3. Small reversible changes over feature trains.
4. WIP = 1 logical change; finish before starting adjacent scope.
5. Use the smallest design that satisfies the current requirement and preserves existing boundaries.
6. Tests reduce meaningful delivery risk; test count, coverage percentage, and TDD ceremony are not goals.
7. Use the cheapest high-signal verification for the realistic regression risk; avoid duplicated confidence across layers.
8. KISS/YAGNI before abstractions. Introduce a layer only after current change pressure justifies it.
9. Delete obsolete code and obsolete decisions instead of keeping parallel paths.
10. Instrumentation, metrics work, broad audits, extra documentation, and adjacent cleanup are not default deliverables.
11. Preserve expensive-to-repair boundaries: privacy, sensitive data, explicit user action, persisted-data integrity, browser permissions, and no automatic submission.
12. Once the authorized outcome is satisfied and justified gates pass, stop.

## Artifact discipline

Keep only live policy/state in source control.

Do not commit:

- historical iteration plans after the decision is captured in code/current state
- screenshots or visual audit evidence that belongs in CI/run artifacts
- command transcripts, task reports, checkpoint reports, or agent scratchpads
- speculative skills for features that are explicit non-goals
- permanent process artifacts for routine bounded work

A plan is justified only when complexity, risk, migration, or unresolved dependencies make it useful. Prefer the smallest temporary planning surface; do not build a permanent plan archive.
