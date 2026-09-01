# Jobflow Decisions

Record only durable material choices whose rationale would be costly or ambiguous to reconstruct. Task history and current milestone decisions belong elsewhere.

## D-001 — Local-first browser extension

**Decision:** Jobflow is a Chromium-first local browser extension. Core career/profile/application data does not require an account, backend, or cloud sync.

**Why:** The product is intended to reduce application friction while preserving user control and minimizing disclosure of career data.

**Consequences:** Persistence, migrations, documents, corrections, application tracking, and sensitive-data handling are designed for extension-local ownership. Adding network-backed sync/account infrastructure is a material product and architecture decision.

## D-002 — Deterministic autofill core

**Decision:** Form interpretation and core autofill policy are deterministic and conservative. Generic field handling precedes ATS-specific adapters; AI is not a dependency for core autofill.

**Why:** Autofill needs reproducible behavior, explainable review states, and fail-closed handling when evidence is weak.

**Consequences:** Field extraction produces serializable semantic context, matching produces evidence, and fill authorization is a separate policy step. ATS-specific behavior requires a reproducible generic-engine failure and authorized scope.

## D-003 — Explicit execution boundaries

**Decision:** Matching never directly authorizes page mutation. Jobflow uses an explicit fill plan and user-triggered execution; automatic Apply/Submit/Next and automatic file attachment are prohibited.

**Why:** A correct semantic match is not sufficient evidence that the user intends to mutate or advance a third-party application flow.

**Consequences:** Unknown/low-confidence fields remain untouched, document attachment is field-specific and explicit, and application navigation/submission stays outside automated execution.

## D-004 — Functional core, imperative shell

**Decision:** Domain/application behavior remains browser-independent where practical; DOM, WXT/browser APIs, persistence, crypto, and rendering are edge concerns.

**Why:** Jobflow runs across several extension runtime contexts and needs deterministic logic that can be reasoned about and verified without coupling every rule to browser lifecycle semantics.

**Consequences:** Dependency direction is UI/entrypoints → application → domain, with infrastructure implementing boundary contracts. Domain code must not depend on React, WXT, `chrome.*`, or DOM mutation.

## D-005 — One canonical career profile plus variants

**Decision:** Reusable career facts live in one versioned base profile. Application variants are lightweight overrides rather than duplicated profiles.

**Why:** Duplicated canonical profiles create synchronization ambiguity and make autofill behavior harder to reason about.

**Consequences:** Variant resolution composes over the base profile. Imports update canonical data only through explicit review rather than creating parallel profile truth.

## D-006 — Contextual skill ownership

**Decision:** Experience and Projects are the user-facing sources of active skills; there is no standalone active Skills workspace. A persisted skill registry may exist only as a compatibility/stable-ID index.

**Why:** Skills without career context cannot safely imply where or how the user acquired them, and CV import cannot reliably fabricate those relationships.

**Consequences:** The active skill inventory is the case-insensitive unique union of Experience/Project links. Registry-only entries are not active skills, and CV import does not fabricate skill ownership.

## D-007 — Separate encrypted sensitive vault

**Decision:** Sensitive career values are isolated from the normal profile and stored locally in an encrypted vault using Web Crypto; vault unlock does not authorize site disclosure.

**Why:** Sensitive identifiers and related values require a stronger trust boundary than ordinary career facts.

**Consequences:** Passphrases are not persisted, content scripts do not receive wholesale decrypted vault state, current-site disclosure remains explicit, and new network/telemetry/sync paths touching career data require separate privacy/security approval.

## D-008 — Full-tab workspace plus isolated in-page assistant

**Decision:** Profile, documents, pipeline, variants, vault, corrections, and backup/recovery use a normal full-tab extension workspace. Current-page assistance uses a Shadow-DOM in-page surface.

**Why:** Large editing/operational workflows need normal workspace area, while page-local assistance must remain contextual and insulated from host-page CSS.

**Consequences:** Shared React/Tailwind primitives own workspace visual grammar, while the in-page assistant keeps an isolated styling/runtime boundary. Detailed interaction rules live in `.agents/DESIGN.md`.

## D-009 — Versioned local application pipeline

**Decision:** Job opportunities and lifecycle state are stored in versioned local application persistence and operated through Pipeline plus Application Detail.

**Why:** Application tracking is part of the user's local operational workflow and should not require backend/cloud infrastructure.

**Consequences:** Application schema changes require explicit migrations and compatibility evidence. Pipeline remains an overview while detail owns opportunity-level execution behavior.