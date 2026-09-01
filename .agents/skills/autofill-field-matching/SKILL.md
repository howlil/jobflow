---
name: autofill-field-matching
description: Use when changing field scanning, context extraction, canonical aliases, heuristic matching, confidence behavior, site-specific corrections, fingerprints, variant recommendations, or fill-plan policy.
---

# Autofill Field Matching

## Core principle

Separate "what does this field mean?" from "should we fill it?" and from "how do we mutate the DOM?". Matching stays deterministic and conservative.

## Pipeline

```text
DOM control
 -> FieldContext
 -> site correction lookup
 -> matcher
 -> MatchResult
 -> fill policy/profile value
 -> FillPlan
```

The matcher never touches DOM and never reads storage directly.

## Evidence order

1. user site/form correction
2. canonical exact alias
3. label/accessibility/name/id agreement
4. section/question context
5. conservative heuristic similarity
6. unknown

A single weak token such as `name="value"` must not override a clear visible label.

## Canonical aliases

Normalize site wording into stable semantic paths, for example:

```text
Phone / Mobile / No. HP / Nomor Telepon -> contact.phone.primary
LinkedIn URL / LinkedIn Profile -> links.linkedin
Expected salary / Salary expectation -> application.compensation.expected
```

When an alias/rule changes matching behavior, protect the realistic intended or collision regression with the smallest high-signal fixture.

## Confidence

Product output uses:

- Ready
- Needs review
- Unknown

Internal numeric scores are implementation details and are not probabilities. Tune thresholds against fixture evidence, not intuition alone.

## Correction memory

Corrections are scoped by `origin + formFingerprint + fieldFingerprint`. User corrections outrank generic rules but do not become global training data automatically.

Fingerprinting uses normalized semantic context and control characteristics, not only generated CSS selectors.

## Repeated entities

Experience/education fields may represent repeated records. Do not guess an array item when surrounding context is insufficient. Prefer Review over writing the wrong record.

## Variant recommendation

Use deterministic job/page signals. Rank variants and retain evidence. If scores are weak or close, prefer the default/general variant rather than false certainty.

## Common mistakes

- combining scanner, matcher, and filler in one function
- website-specific hostname branches in the generic matcher
- presenting score as probability
- aggressive fuzzy matching that creates collisions
- globally learning from one user's site-specific correction
- assuming English-only labels
- treating every screening question as canonical factual data

## Verification

Use the smallest relevant part of the regression corpus. Broaden only when shared policy or a credible collision surface changed. Useful corpus dimensions include English/Indonesian aliases, ambiguous labels, negative collisions, repeated records, and dynamic/ATS-style fixtures.