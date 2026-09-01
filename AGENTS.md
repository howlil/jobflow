# Agent Instructions

This repository uses `.agents/` as the canonical project knowledge and active iteration state.

Before making a meaningful change, inspect the relevant canonical documents.

## Canonical Sources

- `.agents/PROJECT.md` — product intent, domain behavior, scope, contracts, ownership, constraints, and non-goals.
- `.agents/ARCHITECTURE.md` — system boundaries, runtime/module ownership, data flow, trust boundaries, and architecture invariants.
- `.agents/CURRENT_ITERATION.md` — current milestone, active slice/logical change, evidence, risks, and single next action.
- `.agents/CODE_PATTERNS.md` — Jobflow-specific implementation conventions and recurring traps.
- `.agents/QUALITY.md` — verification strategy, repository commands, CI gates, and release-ready criteria.
- `.agents/DECISIONS.md` — durable material decisions and rationale.

Optional authorities that exist because Jobflow has concrete need:

- `.agents/DESIGN.md` — visual system, interaction behavior, responsive rules, and UI composition.
- `.agents/RELEASE.md` — extension integration, versioning, packaging, release workflow, and rollback constraints.
- `.agents/SECURITY.md` — vault, cryptography, sensitive disclosure, permissions, privacy, and security verification boundaries.
- `.agents/skills/*/SKILL.md` — reusable specialist guidance; load only when its trigger matches the requested work.

Read only the documents relevant to the requested change, but always inspect `.agents/CURRENT_ITERATION.md` when continuing active work.

## Authority Order

When sources disagree, use this order:

1. explicit current user instruction
2. `.agents/PROJECT.md` and approved material decisions
3. `.agents/ARCHITECTURE.md`, `.agents/DESIGN.md`, `.agents/SECURITY.md`, and other applicable specialized authorities
4. `.agents/CURRENT_ITERATION.md`
5. `.agents/CODE_PATTERNS.md` and `.agents/QUALITY.md`
6. current code and tests
7. historical plans, PR descriptions, and stale documentation

If code and canonical documentation disagree, determine which is stale from current intent and evidence; fix the inconsistency in the relevant bounded change rather than inventing a new product or architecture decision.

## Operating Rule

Follow the user's canonical engineering lifecycle and authority model.

Do not change product behavior, public/cross-context contracts, architecture boundaries, data ownership, persistence semantics, browser permission/privacy boundaries, or other material decisions without explicit user approval unless the user's request already authorizes that decision.

Prefer the smallest coherent change and existing ownership/patterns.

Do not create persistent task plans, sprint files, status diaries, retrospective archives, or additional `.agents/*.md` files unless the information has a durable project-level owner or Jobflow genuinely requires an optional canonical document.

Finished history belongs in Git/PR/release records. Keep `.agents/CURRENT_ITERATION.md` current rather than append-only.
