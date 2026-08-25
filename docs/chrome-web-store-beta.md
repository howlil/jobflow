# Chrome Web Store Beta Readiness

Use an unlisted/test distribution channel before a public stable listing.

## Product truth gate

Before submission, confirm store copy matches runtime behavior:

- local-first career-form autofill assistant
- no Fillio account/backend/cloud sync
- no AI dependency
- no automatic Apply, Submit, Next, or file upload
- sensitive data is optional, encrypted locally, and requires explicit disclosure approval
- page/form data is processed locally for matching
- profile backup excludes plaintext vault values

## Permission gate

For every generated manifest permission or match pattern:

1. map it to a current user-facing feature;
2. verify there is no narrower practical alternative;
3. document why the feature needs it;
4. compare generated manifest against the previous release;
5. block release on unexplained permission expansion.

## Required listing material

- name and concise description
- detailed description without unsupported compatibility claims
- extension icon/assets
- current screenshots from verified runtime states
- privacy policy pointing to `docs/privacy.md` or its hosted equivalent
- support/contact path
- permission justification
- version/release notes

## Beta acceptance

A beta candidate should prove:

- install from store/test channel succeeds
- profile persists across browser restart
- normal Fill remains explicit
- Review/Unknown/Sensitive/file fields stay fail-closed
- dynamic form rescans do not auto-fill or navigate
- variant recommendation is deterministic and inspectable
- preferred document recommendation never selects/uploads a file
- backup export/import round-trips a normal profile
- vault setup/unlock/lock/reset/disclosure still passes security acceptance
- upgrade from the previous distributed version preserves stored profile data

## Release progression

```text
verified master
  -> immutable tag
  -> fail-closed release workflow
  -> GitHub Release ZIP + checksum
  -> trusted tester install
  -> Chrome Web Store unlisted/test
  -> compatibility/privacy feedback
  -> patch/minor fixes
  -> public listing only when evidence justifies it
```

Do not automate Chrome Web Store publishing until store credentials, real external testers, and release cadence make that automation materially useful.
