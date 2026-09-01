---
name: testing-browser-extension
description: Use when adding tests, fixing regressions, defining browser fixtures, changing matcher rules, schema migrations, vault behavior, DOM filling, messaging, or deciding what belongs in unit versus browser-level tests.
---

# Testing Browser Extension

## Core principle

Choose the cheapest deterministic layer with enough signal for the realistic regression. Browser automation is justified when browser/DOM/extension runtime semantics are part of the risk.

## Layer selection

### Pure/unit tests

Prefer for deterministic behavior such as:

- schema validation and migrations
- profile/variant resolution
- alias normalization
- matcher/confidence policy
- correction precedence
- fill-plan policy
- application lifecycle/state transitions
- crypto envelope functions

### DOM integration

Use focused DOM fixtures when the distinct risk is label/context extraction, native setter/event behavior, controlled inputs, dynamic additions, or repeated field structures.

### Extension E2E

Use for critical runtime boundaries lower layers cannot prove with comparable confidence, such as unpacked extension/bootstrap behavior, content/background messaging, real user-triggered fill, Manifest V3 lifecycle behavior, or vault disclosure/auto-lock runtime semantics.

Do not turn component state, copy, layout, or styling into E2E coverage merely because it is browser-visible.

## Matcher regression corpus

Maintain representative fixture cases for actual risks such as English/Indonesian labels, synonyms, ambiguous fields, negative collisions, repeated records, controlled components, and dynamic/multi-step sections.

A matcher change should add/update the smallest fixture that protects the intended behavior or realistic collision risk.

## Bugfix pattern

When automation is high-signal and cheap:

```text
reproduce -> focused failing test/fixture -> minimal fix -> passing focused test -> broader checks only as risk requires
```

If an automated regression is disproportionate or low-signal, use the next cheapest reliable method instead.

## Security tests

Security boundaries justify stronger deterministic evidence. Do not mock away the cryptographic primitive in tests whose purpose is vault correctness.

## Avoid testing

- private call counts
- folder structure
- React implementation details without user behavior
- constants duplicated from production code
- third-party behavior already guaranteed upstream
- presentation-only layout/copy with no behavior at risk
- confidence already proven adequately at a cheaper layer

For every proposed test ask: **What realistic regression does this prevent?**

## Completion evidence

1. Run the focused verification justified by the changed risk.
2. Run repository-required integration gates from `.agents/QUALITY.md`.
3. Add browser acceptance only when browser/runtime semantics are a distinct risk or repository CI runs it mechanically.

Do not interpret an existing broad CI suite as a requirement to add new tests for every change.