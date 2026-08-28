# Compatibility Evidence

Job Flow treats compatibility as an engineering property of the generic form engine, not as a count of hard-coded ATS integrations.

## Sources of truth

- `src/domain/forms/form-corpus.test.ts` executes the maintained labeled compatibility corpus.
- `docs/compatibility-evidence.json` records fixture/live evidence state by ATS family.
- `pnpm verify:compatibility` rejects unsupported live-verification or adapter claims.
- `docs/ats-live-validation.md` defines the privacy-safe live browser protocol.
- `.github/ISSUE_TEMPLATE/compatibility-report.yml` turns beta failures into structured evidence.

Fixture-shaped evidence is not a claim that an ATS has been live-verified. Live status remains `pending` until an actual reproducible browser journey is recorded.

## Compatibility layers

1. DOM extraction must recover useful serializable field context.
2. Deterministic matching must classify fields correctly.
3. Fill planning must exclude Review, Unknown, Sensitive, and file controls from normal Ready instructions.
4. DOM filling must update supported controls using browser/page-compatible setters and events.
5. Dynamic forms must re-analyze semantically changed field sets without automatic fill/navigation/submission.
6. Sensitive disclosure and correction memory must remain fail-closed.
7. File controls remain non-fillable; document intent guidance must fail closed when context is ambiguous.

## Maintained corpus

The automated corpus covers at minimum:

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

## Evidence reported per release

For each meaningful compatibility release, record:

- number of maintained forms/fixtures
- total classified controls
- Ready mappings that match the expected canonical field
- Review and Unknown counts
- sensitive/file controls incorrectly promoted to Ready: must be zero
- successful fill operations for supported controls
- dynamic rescan regressions
- automatic Next/Submit/Apply count: must be zero
- fixture status and live status for each maintained ATS family
- any reproducible generic-engine failure that could justify an adapter

Do not publish a fake confidence percentage. Metrics are meaningful only against the maintained labeled corpus.

## ATS adapter gate

A site-specific adapter is justified only when all are true:

1. a reproducible fixture demonstrates a real generic-engine failure;
2. the failure cannot be fixed generically without creating broader regressions or unreasonable complexity;
3. the adapter boundary is narrow and independently tested;
4. safety invariants remain identical to the generic path;
5. the reason and removal conditions are documented.

The evidence verifier refuses `candidate` or `implemented` adapter status without a non-empty `reproducibleFailure` entry.

Prefer improving extraction, context normalization, events, fingerprinting, or deterministic intent classification generically before adding vendor branches.
