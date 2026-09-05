# Current Iteration

**Status:** Idle — no product milestone is currently active.

## Last Completed Milestone

### Scoped Page Activation & Trust Surface

Jobflow no longer runs its application-assistant content runtime on every ordinary HTTP(S) page while preserving coverage for real application forms.

Delivered integrated capability:

- automatic assistant loading is scoped to supported ATS/recruitment hosts instead of broad `http://*/*` and `https://*/*` matches;
- Workday, Greenhouse, Lever, Ashby, SmartRecruiters, Workable, iCIMS, Taleo, BambooHR, and Google Forms recruitment flows retain automatic activation paths;
- Workday recognition includes both `myworkdayjobs.com` and `myworkdaysite.com` career hosts;
- arbitrary employer application forms remain supported through explicit toolbar activation using temporary `activeTab` access plus the scripting API;
- explicit toolbar activation preserves all-frame injection so embedded employer forms do not regress from the previous content-script behavior;
- unsupported/restricted pages fail closed and fall back to opening the local Jobflow workspace rather than silently broadening page access;
- generated-manifest verification now rejects broad all-site content-script matches and unexpected host permissions.

Product and trust invariants preserved:

- no automatic Submit/Apply/Next/navigation;
- no silent collection or learning from arbitrary pages;
- generic employer forms remain available without a permanent all-sites allowlist;
- sensitive values remain behind the existing explicit vault/disclosure boundary;
- no backend, cloud sync, telemetry, or AI dependency was introduced.

## Verification Evidence

Final implementation head passed the required deterministic repository gates:

- 60 test files passed;
- 264 tests passed;
- TypeScript typecheck passed;
- ESLint passed with zero warnings;
- Prettier format check passed;
- WXT production build passed;
- generated extension manifest verification passed;
- generated manifest contains only the scoped recruitment content-script matches, requires `activeTab`, `scripting`, and `storage`, and contains no broad `host_permissions`.

Browser E2E/manual browser validation remains optional diagnostic evidence under the current repository verification policy; it is not a merge or release gate.

## Next Move

Inspect the current product and repository state before choosing another milestone. Prioritize the highest-value remaining core application-completion or trust/reliability gap; do not create a milestone for theme polish alone.
