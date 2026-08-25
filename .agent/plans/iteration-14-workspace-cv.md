# Iteration 14 — Career Workspace, Contextual Launcher, and CV Workflow

## Goal

Refactor Fillio's interaction model so the extension is unobtrusive on job sites, the profile editor behaves as a responsive one-page career workspace, and a user can import/store/explicitly attach a CV without adding a backend, AI dependency, automatic submission, or automatic file attachment.

## Product decisions

### Page assistant

- Keep the extension UI in Shadow DOM.
- Keep the host fixed to the viewport rather than using page-layout `absolute` positioning.
- Default to a 48px launcher; never render the full panel automatically.
- Expanded desktop assistant is bounded to the viewport; narrow layouts use a compact sheet-like surface.
- Review and Sensitive are detail views opened from the assistant rather than always-visible blocks.
- Close by explicit button or Escape.

### Career workspace

- One continuous page, not a wizard.
- Sticky top bar plus one-page anchor navigation.
- Maximum content width approximately 1280px.
- Semantic 3/2/1-column responsive form layout.
- Prefer open sections with typography/separators; cards are reserved for discrete records, stored documents, and sensitive/destructive boundaries.
- `DESIGN.md` is the visual source of truth; `.agent/system-design.md` is runtime architecture.

### CV import

- Support text-based PDF, DOCX, and TXT.
- Extraction occurs locally in the extension origin.
- No OCR in this iteration; image-only PDFs fail clearly.
- Parse deterministic fields into a `CvImportDraft`.
- Existing values are compared before mutation.
- New fields may start selected; conflicts require explicit user selection.
- Choosing a file never overwrites the canonical profile.

### Document storage and attachment

- Profile storage contains document metadata only.
- Document binaries live in extension-origin IndexedDB.
- Importing profile data and storing the CV are separate actions.
- A detected native file field may receive a stored document only after an explicit **Attach** click.
- `DataTransfer` assignment is a generic native-input path, not an ATS-specific adapter.
- Unsupported custom upload widgets fail visibly and stay manual.
- Attachment never triggers Next, Apply, Submit, or navigation.

## Architecture

```text
Career Workspace
  ├─ ProfileRepository -> chrome.storage.local
  ├─ CV text extraction -> pdfjs/mammoth/local text
  ├─ deterministic CvImportDraft -> reviewed profile merge
  └─ DocumentBlobRepository -> IndexedDB

Job site
  └─ fixed Shadow DOM launcher
       └─ explicit assistant
            ├─ fill safe fields
            ├─ review correction
            ├─ sensitive approval
            └─ explicit document attach
                  -> background document broker
                  -> requested IndexedDB Blob only
                  -> File
                  -> exact native input fingerprint
```

## Verification

Required branch/PR gates:

```text
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
pnpm verify:compatibility
pnpm build
pnpm verify:manifest
pnpm test:e2e
pnpm zip
```

Browser acceptance adds:

- launcher collapsed by default
- expanded assistant on desktop and narrow viewport
- no automatic sensitive disclosure
- no automatic submission
- local CV review draft
- explicit CV storage
- exact stored resume attachment after **Attach** click
- no attachment-triggered submission

## Out of scope

- Chrome Web Store publishing
- backend/account/cloud sync
- telemetry
- remote AI/LLM parsing
- OCR/scanned-PDF parsing
- automatic file attachment
- automatic Apply/Next/Submit
- speculative ATS-specific adapters
