# Compatibility Evidence

Job Flow treats compatibility as an engineering property of the generic form engine, not as a count of hard-coded ATS integrations or a manually maintained status matrix.

## Evidence sources

- `src/domain/forms/form-corpus.test.ts` executes the maintained labeled compatibility corpus.
- Focused regression tests/fixtures prove reproducible generic-engine behavior.
- `docs/ats-live-validation.md` defines the privacy-safe live browser protocol when real runtime evidence is needed.
- `.github/ISSUE_TEMPLATE/compatibility-report.yml` turns beta failures into structured, redacted reproduction evidence.

ATS-shaped fixture coverage is not a claim that an ATS has been live-verified. Do not maintain a parallel status ledger merely to restate what tests, issues, and observed validation already show.

## Compatibility layers

1. DOM extraction must recover useful serializable field context.
2. Deterministic matching must classify fields correctly.
3. Fill planning must exclude Review, Unknown, Sensitive, and file controls from normal Ready instructions.
4. DOM filling must update supported controls using browser/page-compatible setters and events.
5. Dynamic forms must re-analyze semantically changed field sets without automatic fill/navigation/submission.
6. Sensitive disclosure and correction memory must remain fail-closed.
7. File controls remain non-fillable; document intent guidance must fail closed when context is ambiguous.

## Maintained corpus

The automated corpus covers representative risks such as:

- ordinary semantic HTML forms
- controlled React-style fields
- select/radio/checkbox/date controls
- Indonesian and English labels
- ATS-shaped naming patterns resembling Greenhouse, Lever, Workday, Ashby, and SmartRecruiters without vendor-specific production branches
- dynamic/multi-step forms
- ambiguous subjective questions
- sensitive fields
- file inputs

Vendor-like fixtures are structural compatibility fixtures, not claims of official support.

## Evidence for compatibility changes

When changing shared extraction, matching, fill planning, DOM filling, corrections, or dynamic-page behavior, record only evidence relevant to the changed risk. Useful evidence can include:

- focused labeled fixtures
- Ready mappings matching expected canonical fields
- Review/Unknown collision cases
- zero sensitive/file controls incorrectly promoted to Ready
- successful fill operations for supported controls
- dynamic rescan regressions
- zero automatic Next/Submit/Apply behavior
- a reproducible live failure or validation record when browser behavior is the distinct risk

Do not publish a fake confidence percentage. Metrics are meaningful only against a defined labeled corpus.

## ATS adapter gate

A site-specific adapter is justified only when all are true:

1. a reproducible fixture or live record demonstrates a real generic-engine failure;
2. the failure cannot be fixed generically without broader regressions or unreasonable complexity;
3. the adapter boundary is narrow and independently tested;
4. safety invariants remain identical to the generic path;
5. the reason and removal conditions are documented with the change.

Prefer improving extraction, context normalization, events, fingerprinting, or deterministic intent classification generically before adding vendor branches.
