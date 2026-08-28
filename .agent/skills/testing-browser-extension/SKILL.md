---
name: testing-browser-extension
description: Use when adding tests, fixing regressions, defining browser fixtures, changing matcher rules, schema migrations, vault behavior, DOM filling, messaging, or deciding what belongs in unit versus browser-level tests.
---

# Testing Browser Extension

## Core principle

Tests exist to reduce meaningful delivery risk. Choose the **cheapest deterministic layer with enough signal** for the realistic regression. Browser automation is justified only when browser/DOM/extension runtime semantics are part of that risk.

Do not use this skill to turn every change into a test-writing task.

## Layer selection guide

### Pure/unit tests

Often the cheapest strong layer for:

- schema validation and migrations
- base profile + variant resolution
- alias normalization
- matcher/confidence policy
- correction precedence
- variant recommendation
- form/field fingerprint logic on serializable inputs
- fill-plan policy
- vault crypto envelope functions

Use test-first only when a focused deterministic test is the cheapest high-signal way to define/protect the behavior. For exploratory or presentation-only work, do not manufacture a RED test.

### DOM integration tests

Use focused DOM fixtures when the distinct risk is DOM semantics, for example:

- label/context extraction
- native setter/event behavior
- select/radio/checkbox filling
- dynamic DOM additions
- repeated field structures

Fixtures should model relevant patterns, not copy entire proprietary career pages.

### Extension E2E

Use sparingly for critical runtime boundaries/journeys that lower layers cannot prove with comparable confidence, for example:

- unpacked extension/bootstrap behavior
- content/background messaging
- user-triggered fill in the actual extension runtime
- dynamic rescan behavior when extension lifecycle matters
- vault unlock/disclosure/auto-lock boundary

Do not turn component state, copy, layout, or styling into E2E coverage merely because it is visible in the browser.

## Matcher regression corpus

Maintain representative fixture cases for risks that matter, such as:

- English and Indonesian labels
- synonyms/abbreviations
- ambiguous fields
- negative collisions
- repeated education/experience records
- common controlled components
- dynamic/multi-step sections

A matcher change should add/update the smallest fixture that protects its intended behavior or realistic collision risk. Do not mechanically add positive/negative pairs when they add no distinct confidence.

## Bugfix rule

Preferred when automation is high-signal and cheap:

```text
reproduce -> focused failing test/fixture -> minimal fix -> passing focused test -> broader checks only as risk requires
```

If a deterministic automated regression test is disproportionate or low-signal, verify with the next cheapest reliable method instead. Document manual reproduction only when it is necessary to preserve important context.

## Crypto/security tests

Security boundaries justify stronger deterministic evidence. Do not mock away the cryptographic primitive in tests whose purpose is vault correctness.

Verify relevant cases such as wrong passphrase, tampering/authentication failure, version handling, lock policy, and round trip when that boundary is changed.

## What not to test

Avoid tests that merely assert:

- private function call counts
- internal folder structure
- React implementation details with no user behavior
- constants duplicated from production code
- third-party library behavior already guaranteed upstream
- presentation-only styling/layout/copy with no behavior at risk
- confidence already proven adequately at a cheaper layer

For every proposed test ask:

> **What realistic regression does this prevent?**

If there is no strong answer, do not add it.

## Completion evidence

Before claiming implementation complete:

1. run the focused verification justified by the changed risk
2. run repository-required integration gates that apply to the branch/CI policy
3. add browser acceptance only when browser/runtime semantics are a distinct risk or repository protection runs it mechanically

Do not interpret an existing CI suite as a requirement to add new tests for every change.
