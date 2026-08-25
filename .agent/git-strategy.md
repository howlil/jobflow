# Git Strategy

Fillio uses small-batch trunk-based development around `master`.

## Core flow

```text
master
 -> short-lived feat|fix|chore branch when isolation is useful
 -> draft PR early for non-trivial work
 -> fast feedback / revisions on the same branch
 -> ready PR
 -> required browser/risk gate
 -> squash merge
 -> delete branch
```

## Rules

- WIP = 1 logical change.
- One logical outcome = one branch/PR at most.
- Target branch lifetime: same working day / less than one working day.
- If the branch accumulates multiple independent outcomes, split the scope instead of treating a long "iteration" as the delivery unit.
- Iteration branches, release branches, environment branches, backup branches, and `final-final-*` branches are forbidden.
- Use `feat/<topic>`, `fix/<topic>`, or `chore/<topic>` when a branch is needed.
- Tiny low-risk docs/metadata maintenance may go directly to `master` when isolation provides no value.

## PR behavior

For non-trivial work, open a draft PR once the first coherent executable/checkpoint slice exists. PRs are feedback surfaces, not a ceremony performed after 30-60 private branch commits.

A PR description should contain only:

- problem/outcome
- acceptance criteria or delivered behavior
- important risk/architecture decision
- verification actually observed

Do not paste an implementation diary or full planning document.

## Commits and merge

Working commits may be messy enough to support rapid feedback, but avoid intentional noise such as separate formatting/CI-retry/report commits when they can be folded into the task.

Default integration is **squash merge**, so `master` receives one coherent commit for one logical outcome.

Do not preserve RED/GREEN checkpoint history merely as evidence that TDD happened; executable tests are stronger evidence.

## Cleanup

After merge, delete the task branch. Delete abandoned branches once unique work is no longer needed. Git history is the backup.

For a released regression, create one short `fix/<issue>` branch from `master`, reproduce/fix/verify, squash merge, then issue a patch release if distribution is affected.
