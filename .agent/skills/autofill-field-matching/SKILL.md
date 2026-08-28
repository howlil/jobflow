---
name: autofill-field-matching
description: Use when changing field scanning, context extraction, canonical aliases, heuristic matching, confidence behavior, site-specific corrections, fingerprints, variant recommendations, or fill-plan policy.
---

# Autofill Field Matching

## Core principle

Separate "what does this field mean?" from "should we fill it?" and from "how do we mutate the DOM?". Matching stays deterministic and conservative in MVP.

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

Use strongest evidence first:

1. user site/form correction
2. canonical exact alias
3. label/accessibility/name/id agreement
4. section/question context
5. conservative fuzzy/heuristic similarity
6. unknown

A single weak token such as `name="value"` should not override a clear visible label.

## Canonical aliases

Normalize variations into stable semantic paths, for example:

```text
Phone / Mobile / No. HP / Nomor Telepon -> contact.phone.primary
LinkedIn URL / LinkedIn Profile -> links.linkedin
Expected salary / Salary expectation -> application.compensation.expected
```

When an alias/rule changes deterministic matching behavior, protect the realistic intended or collision regression with the smallest high-signal fixture. Add a negative/collision case when there is a credible collision risk; do not add paired cases mechanically for test-count symmetry.

## Confidence

Product output uses:

- Ready
- Needs review
- Unknown

Internal numeric scores are implementation details and are not probabilities. Tune thresholds against relevant fixture evidence, not intuition alone.

## Correction memory

Corrections are scoped by `origin + formFingerprint + fieldFingerprint` in MVP. User corrections outrank generic rules but must not become global training data automatically.

Fingerprinting should use normalized semantic context and control characteristics. Never rely only on a generated CSS selector.

## Repeated entities

Experience/education fields may represent repeated records. Do not guess which array item to fill unless surrounding section/repetition context provides enough evidence. Prefer Review over silently writing the wrong job/school record.

## Variant recommendation

Use deterministic job/page signals. Rank variants and include evidence. If scores are weak or close, prefer default/general variant rather than false certainty.

## Common mistakes

- combining scanner/matcher/filler in one function
- website-specific `if hostname` branches in generic matcher
- presenting score as probability
- adding fuzzy matching so aggressive that unrelated fields collide
- globally learning from one user's site-specific correction
- assuming English-only labels
- treating every free-text screening question as canonical factual data

## Verification

Select the smallest relevant portion of the regression corpus for the changed rule/risk. Broaden only when the change affects shared matching policy or has a credible wider collision surface.

Useful corpus dimensions include English/Indonesian aliases, ambiguous labels, negative collisions, repeated records, and dynamic/ATS-style fixtures. They are a coverage toolbox, not a mandatory checklist for every matcher edit.
