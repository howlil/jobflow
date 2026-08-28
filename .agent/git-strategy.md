# Git Strategy

Job Flow uses small-batch trunk-based development around `master`. Git mechanics support delivery; they are not the product workflow.

## Core flow

Use the lightest integration path that preserves safety and repository policy:

```text
bounded logical change
 -> short-lived branch when isolation/protection/review value requires it
 -> focused verification
 -> PR when repository protection or useful review/integration feedback requires it
 -> required gates
 -> squash merge to master
```

`master` is the integration source of truth. Do not create feature trains, long-lived iteration branches, or release branches.

## Rules

- WIP target = 1 logical change.
- Keep one coherent product/engineering outcome together when splitting would only add coordination overhead.
- Split independent outcomes when they can be delivered/verified independently and batching increases risk or cycle time.
- Target branch lifetime: same working day / less than one working day when a branch is used.
- Iteration branches, release branches, environment branches, backup branches, and `final-final-*` branches are forbidden.
- Use `feat/<topic>`, `fix/<topic>`, or `chore/<topic>` when a branch is useful.
- If repository protection requires a PR, use one. If a tiny low-risk maintenance change can safely integrate directly and repository policy permits it, do not create a PR merely for ceremony.

## PR behavior

A PR is a feedback/integration surface, not a mandatory planning artifact.

Open a draft PR early when early CI/review feedback has real value, for example when:

- the change is non-trivial and incremental feedback reduces risk
- repository protection requires PR-based checks
- cross-boundary behavior benefits from review before completion
- the branch would otherwise accumulate hidden work

Do not open a draft PR merely to satisfy process ceremony for a trivial bounded edit.

When a PR is used, keep its description proportional:

- problem/outcome
- observable acceptance/delivered behavior when useful
- material risk/architecture decision if any
- verification actually observed

Do not paste implementation diaries, broad audit reports, or full planning documents.

## Commits and merge

Working commits exist to support rapid feedback. Avoid intentional noise such as separate formatting/CI-retry/report commits when they can be folded into the task.

Default integration is **squash merge**, so `master` receives one coherent commit for one logical outcome.

Do not preserve RED/GREEN checkpoint history merely as evidence that TDD happened; executable behavior and relevant verification are stronger evidence.

## Cleanup

After merge, delete task branches when no unique work remains. Git history is the backup.

For a released regression, create the smallest safe fix from current `master`, reproduce/verify according to risk, integrate, then publish a patch only when distribution is actually required.
