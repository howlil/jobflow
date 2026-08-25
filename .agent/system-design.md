# System Design

## 1. Design intent

Fillio should be easy to extend without making the MVP architecture look like an enterprise platform. The design uses a functional core around career/profile/form logic and a thin imperative shell around browser APIs, DOM, persistence, crypto, and UI.

The important boundaries are the parts we already know will evolve: browser integration, storage/sync, field matching, form filling, document ingestion, and sensitive-data handling. Everything else stays concrete until change pressure appears.

## 2. Recommended stack

- WXT as extension build/runtime framework.
- Manifest V3.
- TypeScript strict mode.
- React for popup, options/profile page, and floating content-script UI.
- Zod or an equivalent small runtime schema validator for persisted-data validation and migrations.
- Web Crypto for local vault cryptography.
- Vitest for pure/unit tests.
- Playwright or equivalent browser automation only for critical extension journeys.

Do not add a backend in MVP.

## 3. Runtime contexts

### Content script

Responsibilities:

- detect candidate career forms
- scan controls and surrounding context
- observe relevant DOM changes
- mount isolated floating UI
- receive resolved safe values to fill
- execute DOM filling and dispatch compatible events

Must not own:

- canonical profile persistence
- decrypted vault storage
- passphrase/key lifecycle
- global app state
- business matching rules coupled to DOM

### Background service worker

Responsibilities:

- coordinate extension messages where a central boundary is useful
- own access to sensitive vault operations
- maintain vault session/unlock lifecycle
- interact with browser-level APIs that should not be exposed to content scripts

Do not treat it as a permanently running server. Manifest V3 service workers are ephemeral.

### Popup

Fast control surface:

- current-page detection summary
- chosen/recommended application variant
- Ready / Needs review / Unknown / Sensitive counts
- Fill and Review actions
- vault lock state
- link to full profile settings

### Options/profile page

Primary profile-management UI:

- base profile editor
- application variants
- additional/sensitive sections
- correction-management UI later if needed
- vault setup/reset

## 4. Logical architecture

```text
Extension UI
  popup / options / floating control
          |
          v
Application use cases
  ResolveProfile
  AnalyzeCurrentForm
  RecommendVariant
  PrepareFillPlan
  SaveCorrection
  UnlockVault
          |
   +------+----------------+
   |                       |
   v                       v
Domain                    Ports
profile schema            ProfileRepository
variant resolution        CorrectionRepository
field semantics           VaultRepository
matching policy           BrowserMessenger
confidence bands          Clock (only if testing requires it)
fill plan
   ^                       ^
   |                       |
   +-----------+-----------+
               |
Infrastructure adapters
  chrome.storage
  chrome.storage.session
  Web Crypto
  WXT/browser messaging
  DOM scanner/extractor/filler
```

Dependency direction is inward. Domain code has no dependency on React, WXT, Chrome APIs, or DOM types.

## 5. Suggested source layout

```text
entrypoints/
  background.ts
  content/
    index.tsx
  popup/
    index.html
    App.tsx
  options/
    index.html
    App.tsx

src/
  domain/
    profile/
    variants/
    forms/
    matching/
    corrections/
    vault/
  application/
    analyze-form/
    prepare-fill/
    profile/
    vault/
  infrastructure/
    browser/
    storage/
    crypto/
    dom/
  ui/
    components/
    features/
  shared/
    types/
```

This is guidance, not a mandate to create empty folders. Create a module only when the iteration needs it.

## 6. Canonical profile model

Persist one versioned root envelope:

```text
StoredProfileEnvelope
- schemaVersion
- baseProfile
- variants[]
- preferences
- metadata
```

Base profile contains factual reusable career data. Variants contain only contextual differences.

```text
ResolvedProfile = BaseProfile + ApplicationVariant overrides
```

Never duplicate the whole profile per role.

Every persisted structure must have a stable schema version. Migrations are sequential pure functions, for example `v1 -> v2 -> v3`. Do not scatter migration conditionals across UI code.

## 7. Form-intelligence pipeline

```text
DOM
 -> Scanner
 -> Extractor
 -> FieldContext[]
 -> Correction lookup
 -> Matcher
 -> MatchResult[]
 -> Confidence/sensitivity policy
 -> FillPlan
 -> User review/approval
 -> Filler
```

### Scanner

Finds potentially fillable controls and groups enough local structure to reason about them. It knows DOM, not profile semantics.

### Extractor

Converts DOM details into a serializable `FieldContext`, such as:

```text
controlKind
inputType
label
name
id
placeholder
ariaLabel
options[]
sectionText
fieldFingerprint
formFingerprint
origin
```

Avoid passing raw DOM elements deeper than the DOM layer.

### Matcher

Pure domain component. Given `FieldContext`, aliases/rules, available profile paths, and optional site correction, returns:

```text
canonicalPath
confidenceBand: ready | review | unknown
reason
sensitivity
candidateMappings[] when useful
```

MVP match strategy:

1. site-specific user correction
2. exact normalized alias
3. structured heuristics
4. conservative fuzzy scoring
5. unknown

No LLM call.

### Fill planner

Combines match result, resolved profile, vault state, and policy. It creates an explicit plan before touching DOM:

```text
FillPlan
- ready[]
- needsReview[]
- unknown[]
- sensitivePendingApproval[]
```

This separation is important: matching a field does not automatically authorize filling it.

### Filler

Receives approved fill instructions and mutates DOM. It does not decide what a field means.

For controlled React/Vue/etc. fields, prefer the native element setter and expected input/change events rather than simply assigning an attribute. Any site-specific workaround belongs in a narrowly scoped adapter with a reproducible test case.

## 8. Dynamic-page handling

Use a `MutationObserver` in the content layer, but never run a complete scan for every mutation.

Recommended flow:

```text
mutation batch
 -> relevance filter
 -> debounce
 -> compute lightweight form fingerprint/change set
 -> rescan changed/new form area
 -> update analysis state
```

The observer must be stoppable and must avoid observing Fillio's own injected shadow-root UI as application-form content.

## 9. Floating UI isolation

Mount the floating control into an extension-owned host and Shadow DOM where practical. This prevents career-site CSS from styling Fillio and prevents Fillio styles from leaking into the page.

The control should remain small and non-modal until Review is requested.

## 10. Variant recommendation

MVP variant recommendation is a pure local scorer.

Inputs may include:

- detected job title
- document/page title
- main headings
- limited job-description text/keywords
- variant target roles and emphasis keywords

Output:

```text
VariantRecommendation
- variantId
- score
- evidence[]
```

Do not call the score a probability. If the best score is weak or close to alternatives, use the default/general variant and let the user choose.

## 11. Correction memory

A correction key should combine stable-enough context:

```text
origin
formFingerprint
fieldFingerprint
```

A field fingerprint may include normalized label/name/type/options/section clues. Avoid using a generated CSS selector as the only identity.

Corrections are local to the site/form in MVP. Global learning is explicitly future work.

## 12. Storage design

### Normal profile

Use an infrastructure repository backed initially by `chrome.storage.local`.

The repository boundary exists because cloud sync is an acknowledged future direction. Keep it narrow:

```text
ProfileRepository
- load()
- save(profile)
```

Do not create a repository interface for every entity.

### Corrections/preferences

They may use the same underlying storage adapter with separate keys/envelopes. They do not require separate databases.

### Documents

Structured document metadata remains in the profile envelope. Large document binaries belong in extension-origin IndexedDB behind a narrow document repository. Never put CV/PDF bytes into `chrome.storage.local`.

## 13. Sensitive vault design

Sensitive profile data is stored as one versioned encrypted envelope in local extension storage for MVP simplicity.

Recommended cryptographic flow:

```text
passphrase
 -> PBKDF2-HMAC-SHA-256 + random salt + versioned KDF parameters
 -> AES-256-GCM key
 -> encrypt serialized sensitive payload using fresh random IV
 -> persist ciphertext + salt + IV + algorithm/version metadata
```

Rules:

- never persist the passphrase
- unique IV for every encryption under a key
- cryptographic parameters live in the envelope so they can migrate later
- never log plaintext, key bytes, government IDs, compensation, or document contents
- authentication/decryption failure returns a generic invalid-passphrase/corrupt-vault result; do not leak internals to UI

### Unlock session

Manifest V3 service workers can stop between events, so a module-level variable alone is not a reliable 30-minute session.

Pragmatic MVP:

- derive/import key during unlock
- retain only temporary key material in extension session-memory storage that is not exposed to content scripts
- background imports it into a non-extractable `CryptoKey` when needed
- maintain `lastVaultActivityAt`
- reset a 30-minute auto-lock alarm/activity deadline on Fillio vault activity
- locking removes session key material and plaintext caches
- browser restart naturally clears session unlock state

If browser-session storage proves unsuitable in implementation, preserve the same `VaultSession` contract and change only the infrastructure implementation.

## 14. Sensitive disclosure flow

```text
Sensitive field recognized
 -> vault locked? ask unlock
 -> resolve sensitive value in trusted extension context
 -> show disclosure summary with current origin
 -> user approves current fill operation
 -> send only approved value/instruction to content layer
 -> fill
```

Do not expose the entire decrypted vault to the content script. Resolve only values needed for approved fields.

## 15. Browser permissions

Automatic detection across arbitrary career sites implies broad host access or a site-access grant model. For MVP development, broad HTTPS matching may be pragmatic, but permissions must remain minimal and clearly justified.

Do not request unrelated permissions such as browsing history or downloads unless a real requirement appears.

Before store publication, explicitly review:

- host permissions
- content-script match scope
- `storage`
- `alarms` if used for vault auto-lock
- any scripting permissions actually required

## 16. Future backend/cloud sync boundary

No backend is implemented now. When cloud sync is justified, it must synchronize canonical versioned profile data rather than introduce a second server-only domain model.

Expected evolution:

```text
ProfileRepository
  LocalProfileRepository      <- MVP
  SyncedProfileRepository     <- future
```

Cloud features must define conflict resolution, encryption/privacy, auth, offline behavior, and migration strategy before implementation.

## 17. Future AI boundary

AI may later implement one or both interfaces:

```text
SemanticMatcher
GenerativeAnswerAssistant
```

Rules:

- deterministic matcher remains first tier
- AI is fallback, not mandatory for ordinary factual fields
- subjective answers are suggestions, not silent autofill
- sending page/profile data to a remote model requires explicit privacy design and consent

## 18. Error handling

Prefer local failure containment:

- malformed persisted profile -> fail validation/migration with actionable recovery path
- one unrecognized field -> skip field, continue form
- filler incompatibility -> report field failure, do not abort other approved fields
- vault decrypt failure -> remain locked
- messaging/context unavailable -> surface a retryable extension status

Avoid a giant global catch that converts every error into "something went wrong" without preserving developer diagnostics. Developer logs must still redact user values.

## 19. Testing seams

The following should be testable without a browser:

- schema validation and migrations
- base + variant resolution
- alias normalization
- matching/confidence policy
- variant scoring
- field/form fingerprint generation from serializable contexts
- correction precedence
- fill-plan policy
- vault envelope crypto functions
- deterministic CV text parsing and conflict calculation

Browser-level tests cover only behavior that needs the DOM/extension runtime: extraction, content/background messaging, dynamic rescan, real fill event behavior, floating UI isolation, explicit document attachment, and critical vault flow.
