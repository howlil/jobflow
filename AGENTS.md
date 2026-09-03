# Agent Instructions

This repository uses `.agents/` as the canonical project knowledge and active engineering state.

The user's global canonical SWE Agent Operating System governs generic delivery workflow, Product Authority, milestone/slice decomposition, Minimum Change, proportional verification, retrospectives, Feature Compass, and engineering quality. Do not fork those global policies into repository-local bureaucracy. Repository-local documents own only Jobflow-specific facts, boundaries, conventions, verification mapping, and current state.

## Canonical Sources

- `.agents/PROJECT.md` — product intent, primary user/job, domain behavior, scope, contracts, ownership, constraints, non-goals, and material open decisions.
- `.agents/ARCHITECTURE.md` — runtime/module/data/security boundaries, major flows, ownership, and architecture invariants.
- `.agents/CURRENT_ITERATION.md` — active milestone outcome, current vertical slice/logical change, material blockers, relevant evidence, and single next action.
- `.agents/CODE_PATTERNS.md` — Jobflow-specific implementation conventions and recurring traps.
- `.agents/QUALITY.md` — repository-specific verification selection, CI design, commands, and release-ready evidence.
- `.agents/DECISIONS.md` — durable material decisions and rationale.

Optional authorities retained because Jobflow has concrete project-specific need:

- `.agents/DESIGN.md` — visual system, interaction behavior, responsive rules, UI composition, and representative visual verification.
- `.agents/RELEASE.md` — integration, versioning, packaging, release workflow, and rollback constraints.
- `.agents/SECURITY.md` — vault, cryptography, sensitive disclosure, permissions, privacy, and security boundaries.

Do not create a parallel `.agents/skills/` policy layer. Specialist guidance belongs in the canonical owner above unless it is truly independent reusable knowledge that cannot be represented without duplication.

Read only documents relevant to the requested change. Always inspect `.agents/CURRENT_ITERATION.md` when continuing active work.

## Authority Order

When sources disagree:

1. explicit current user instruction
2. user Product Authority and approved material decisions
3. `.agents/PROJECT.md` and `.agents/DECISIONS.md`
4. `.agents/ARCHITECTURE.md`, `.agents/SECURITY.md`, `.agents/DESIGN.md`, and other applicable project-specific authorities
5. `.agents/CURRENT_ITERATION.md`
6. `.agents/CODE_PATTERNS.md` and `.agents/QUALITY.md`
7. current code and tests
8. historical plans, PR descriptions, completed milestone notes, and stale documentation

If code and canonical documentation disagree, determine which source is stale from current intent and evidence. Repair the inconsistency in the same bounded change instead of inventing new product or architecture decisions.

## Development Decomposition

Use this hierarchy when planning or executing product work:

```text
PRODUCT PURPOSE
  -> CORE USER JOURNEY
  -> CAPABILITY MAP
  -> MILESTONE
  -> SLICE
  -> LOGICAL CHANGE
  -> TASK
```

Definitions:

- **Milestone** = smallest coherent scope that delivers one meaningful integrated product capability/workflow end-to-end.
- **Slice** = smallest demonstrable vertical behavior/scenario that materially advances that milestone.
- **Logical Change** = coherent technical modification required by a slice.
- **Task** = concrete implementation action inside a logical change.
- Reliability, migration, infrastructure, cleanup, and bug-fix work remain classified as such unless they independently create a user capability.

Do not inflate milestone count by promoting micro-features, architecture layers, files, test additions, refactors, or implementation chores into milestones. Do not shrink slices until the user-visible behavior disappears.

Before proposing a milestone, reconstruct the core journey and choose the highest-value core capability gap. Prefer integrated user outcomes over nice-to-have polish, speculative feature expansion, or isolated technical completion.

## Delivery Projection

Apply the global operating model with these repository expectations:

- Optimize for **high user value × product capability density × correctness × maintainability**, while minimizing user-outcome lead time, rework, waiting, and verification waste.
- Minimum Change means the smallest **complete authorized implementation** that delivers the intended behavior with low blast radius. It does not mean the smallest diff or an incomplete micro-change.
- Plan at meaningful milestone boundaries. Once a milestone is authorized, execute its authorized vertical slices continuously without repeatedly asking for approval between slices.
- Local implementation choices are agent-owned when they preserve approved behavior, contracts, data ownership, security/privacy boundaries, and architecture.
- Reuse existing ownership/patterns before creating new abstractions, dependencies, modules, or architecture.
- Stop and surface only material decisions outside authorization: contradictory requirements, destructive migration, public/cross-context contract changes, permission/privacy/security boundary changes, or major architecture changes.
- Remove dead/legacy code when it is made obsolete by the authorized change; do not keep parallel old/new paths without a compatibility reason.
- Do not perform unrelated refactors, speculative future-proofing, dependency upgrades, renames, or repository reorganization merely because the touched area could be cleaner.

## Verification & CI Discipline

Verification is evidence, not ceremony.

- Choose the cheapest, fastest, highest-signal evidence capable of observing the changed behavior.
- Escalate from focused checks to integration/browser evidence only when a material risk remains invisible.
- Do not require new unit/E2E tests for presentation-only design changes merely because React/CSS changed; follow `.agents/DESIGN.md` and `.agents/QUALITY.md`.
- Test stable user/domain semantics, not implementation trivia, class lists, arbitrary component structure, or decorative markup.
- Existing CI provides broad deterministic integration evidence; do not manually reproduce every CI step after every edit.
- CI itself must optimize feedback latency without dropping distinct correctness signals. Independent expensive work should overlap when safe; duplicate gates should be removed rather than parallelized.
- A new mandatory CI gate needs a distinct realistic failure mode that cheaper existing evidence cannot observe.
- Never weaken, skip, or mock the changed behavior merely to get a green result.
- Never claim a stale, cancelled, skipped, unrelated, or different-head run as evidence for the merge candidate.

The repository's concrete risk-to-evidence mapping and current CI shape are authoritative in `.agents/QUALITY.md`.

## Design Decision Discipline

For implementation design, prefer:

```text
reuse existing behavior/pattern
  -> extend existing owner
  -> small local abstraction
  -> new component/module
  -> architecture change
```

Use the first option that cleanly satisfies the authorized behavior. Product behavior, public contracts, data/security ownership, permission boundaries, and material architecture changes remain user-owned decisions.

For UI work, follow `.agents/DESIGN.md` in this order:

```text
Product Intent
  -> Information Hierarchy
  -> Interaction Model
  -> Visual Hierarchy
  -> Components
  -> Decoration
```

Do not begin from generic SaaS cards, gradients, glass, bento, animation, or icon decoration and force the product into that style.

## Feature Compass

At any point in active product work, be able to state compactly:

```text
Feature Shape -> Current Position -> Delta -> Next Move
```

Repository state should make clear what the feature/workflow looks like, what changed, what is already complete, what remains, and the single next meaningful action without requiring chat history.

## Retrospective Discipline

Run a retrospective when evidence justifies it: milestone/release completion, meaningful slowdown, repeated rework, significant CI/debug loops, incidents, or explicit request.

Use:

```text
Evidence -> Bottleneck -> Root Cause -> Small Improvement -> Verify
```

Do not create retrospective ceremony, archives, or process changes unsupported by observed delivery friction.

## Repository State Discipline

Repository state must be understandable without chat history.

Do not create persistent task plans, sprint files, status diaries, retrospective archives, duplicated policy documents, or additional `.agents/*.md` files unless the information has a durable project-specific owner.

`.agents/CURRENT_ITERATION.md` is current-state documentation, not an append-only history log. Finished implementation history belongs in Git commits, pull requests, releases, and durable decisions when a decision genuinely needs to survive reconstruction.
