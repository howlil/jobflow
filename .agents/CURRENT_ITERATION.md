# Current Iteration

**Status:** Active — Unified Job Application Workflow

## Milestone Outcome

Reduce Jobflow's user-facing product model from three overlapping surfaces to two coherent ones:

- **In-page Assistant** owns the current application workflow: page analysis, application-profile selection, fill/review, document attachment, sensitive disclosure, and application capture.
- **Workspace** owns career/application/data management: Pipeline, career profile, documents, application profiles, privacy/data settings, autofill memory, and backup/recovery.
- The browser toolbar icon becomes a context-aware launcher rather than opening a separate popup product surface.

No autofill policy, persistence schema, vault cryptography, automatic-submit behavior, ATS-specific runtime handling, backend/cloud/AI boundary, or document-attachment authorization changes are part of this milestone.

## Active Vertical Slice

Execute the complete milestone continuously:

1. toolbar action -> in-page Assistant when a supported application context exists; otherwise open Workspace;
2. move current-page application-profile recommendation/selection from popup into Assistant;
3. consolidate Workspace information architecture and user-facing terminology without unnecessary persistence migration;
4. make Workspace the canonical user-facing management surface while retaining the technical `options` entrypoint where useful;
5. remove popup entrypoint/components/tests/manifest ownership only after replacement behavior exists;
6. verify the integrated application journey and required repository gates.

## Material Constraints

- Preserve explicit user-triggered fill.
- Preserve no automatic Submit/Next/navigation.
- Preserve explicit per-field document attachment.
- Preserve sensitive-data vault/session/disclosure boundaries.
- Keep browser APIs at runtime edges and page DOM work in the content-script shell.
- Do not expand into general redesign, new ATS adapters, new application stages, AI matching, cloud sync, or schema redesign.

## Verification Evidence

Accumulate proportional evidence while implementing. Final milestone gate requires the repository's deterministic checks plus targeted browser/runtime evidence for toolbar/content-script/manifest behavior.

## Next Move

Complete the replacement workflow first, then delete popup legacy ownership and merge only when the integrated milestone is green.