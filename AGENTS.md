# Agent Instructions

This repository uses `.agents/` as the canonical project knowledge and active engineering state.

The user's global canonical SWE Agent Operating System governs generic delivery workflow, Product Authority, Minimum Change, milestone/continuous-delivery behavior, proportional verification, retrospectives, and engineering quality. Do not duplicate or fork those global policies into repository-local files. Repository-local documents own only Jobflow-specific facts, boundaries, conventions, and current state.

## Canonical Sources

- `.agents/PROJECT.md` — product intent, domain behavior, scope, contracts, ownership, constraints, non-goals, and material open decisions.
- `.agents/ARCHITECTURE.md` — runtime/module/data/security boundaries, major flows, ownership, and architecture invariants.
- `.agents/CURRENT_ITERATION.md` — active milestone state, current vertical slice/logical change, evidence, blockers, and single next action.
- `.agents/CODE_PATTERNS.md` — Jobflow-specific implementation conventions and recurring traps.
- `.agents/QUALITY.md` — repository-specific verification mapping, commands, CI behavior, and release-ready evidence.
- `.agents/DECISIONS.md` — durable material decisions and rationale.

Optional authorities retained because Jobflow has concrete project-specific need:

- `.agents/DESIGN.md` — visual system, interaction behavior, responsive rules, and UI composition.
- `.agents/RELEASE.md` — integration, versioning, packaging, release workflow, and rollback constraints.
- `.agents/SECURITY.md` — vault, cryptography, sensitive disclosure, permissions, privacy, and security boundaries.

Do not create a parallel `.agents/skills/` policy layer. Specialist guidance belongs in the canonical owner above unless it is truly independent, reusable knowledge that cannot be represented without duplication.

Read only the documents relevant to the requested change. Always inspect `.agents/CURRENT_ITERATION.md` when continuing active work.

## Authority Order

When sources disagree, use this order:

1. explicit current user instruction
2. user Product Authority and approved material decisions
3. `.agents/PROJECT.md` and `.agents/DECISIONS.md`
4. `.agents/ARCHITECTURE.md`, `.agents/SECURITY.md`, `.agents/DESIGN.md`, and other applicable project-specific authorities
5. `.agents/CURRENT_ITERATION.md`
6. `.agents/CODE_PATTERNS.md` and `.agents/QUALITY.md`
7. current code and tests
8. historical plans, PR descriptions, completed milestone notes, and stale documentation

If code and canonical documentation disagree, determine which source is stale from current intent and evidence. Repair the inconsistency in the same bounded change instead of inventing new product or architecture decisions.

## Delivery Projection

Apply the global operating model with these repository expectations:

- Optimize for a meaningful complete user outcome, high product capability density, correctness, and maintainability — not the smallest visible diff.
- A milestone is a bounded product/engineering outcome worth delivering. A slice is demonstrable vertical behavior across whatever layers are required. Do not manufacture tiny file-, layer-, or ceremony-driven slices.
- Minimum Change means the smallest **complete authorized implementation** that delivers the intended outcome with low blast radius. It does not mean stopping at an incomplete micro-change.
- Plan at milestone boundaries. Once a milestone is authorized, execute its authorized vertical slices continuously without repeatedly asking for approval between slices.
- Local implementation choices are agent-owned when they preserve approved behavior, contracts, data ownership, security/privacy boundaries, and architecture.
- Stop and surface only material decisions outside authorization: contradictory requirements, destructive migration, public/cross-context contract changes, permission/privacy/security boundary changes, or major architecture changes.
- Use proportional verification: choose the cheapest, fastest, highest-signal evidence that can prove the changed behavior, and escalate only when material risk remains invisible.
- Existing CI may run a broad deterministic integration suite; that does not require manually reproducing every verification layer for every local change.
- When proposing the next milestone, prioritize the highest-value core user outcome or capability gap. Do not default to polish, speculative expansion, or nice-to-have work.

## Repository State Discipline

Repository state must be understandable without chat history.

Do not create persistent task plans, sprint files, status diaries, retrospective archives, duplicated policy documents, or additional `.agents/*.md` files unless the information has a durable project-specific owner.

`.agents/CURRENT_ITERATION.md` is current-state documentation, not an append-only history log. Finished implementation history belongs in Git commits, pull requests, releases, and durable decisions when a decision genuinely needs to survive reconstruction.
