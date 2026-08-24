# Iteration 6 Design System UX Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Fillio's MVP UI from functional to professional, consistent, and accessible without changing autofill safety, vault security, permissions, or product scope.

**Architecture:** Treat visual polish as reusable UI primitives and state patterns, not one-off CSS tweaks. Keep React components presentation-only, keep vault/profile/floating behavior behind existing application/runtime boundaries, and preserve the explicit user-action model for normal and sensitive fill flows.

**Tech Stack:** WXT, React 19, TypeScript strict mode, CSS modules/plain CSS in existing UI files, Vitest + Testing Library for component behavior, Playwright E2E for extension runtime screenshots and critical journeys.

**Spec:** `.agent/design-audits/2026-08-25-fillio-ui/` screenshot audit evidence and `.agent/iteration-state.md` current product/security constraints.

## Global Constraints

- No backend, account, cloud sync, AI, telemetry, ATS-specific adapter, auto-submit, or new browser permissions.
- Normal autofill remains explicit and only fills safe Ready fields.
- Sensitive fields remain fail-closed and require vault access plus separate current-site approval.
- Unlocking vault alone must never fill sensitive values.
- The content script must not receive the entire decrypted vault; only approved current-field values may cross the boundary.
- UI changes must not intentionally style host pages outside Fillio's isolated UI.
- Production behavior changes require RED -> GREEN -> REFACTOR.
- Documentation/state changes must stay under `.agent` unless they are user-facing product docs.
- Final verification must include focused UI tests plus `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm verify:manifest`, `pnpm test:e2e`, and screenshot review for desktop and mobile states.

---

## Audit Evidence

Accepted screenshots from the design audit:

- `.agent/design-audits/2026-08-25-fillio-ui/01-options-profile-empty.png`
- `.agent/design-audits/2026-08-25-fillio-ui/02-options-profile-filled.png`
- `.agent/design-audits/2026-08-25-fillio-ui/04-options-vault-after-setup.png`
- `.agent/design-audits/2026-08-25-fillio-ui/05-floating-form-initial-http.png`
- `.agent/design-audits/2026-08-25-fillio-ui/07-popup-summary-http.png`
- `.agent/design-audits/2026-08-25-fillio-ui/08-options-mobile-empty.png`
- `.agent/design-audits/2026-08-25-fillio-ui/09-floating-mobile.png`

Primary design problems to resolve:

- The options page is a long sparse form with weak first-run guidance.
- Sensitive Vault appears as a large field-heavy section before setup, instead of a protected progressive flow.
- Success/error feedback is too subtle and not consistently tied to controls.
- Floating panel works but looks like an internal debug widget.
- Popup is too sparse and not action-oriented enough for an extension command surface.
- Mobile layout is functional but too long; empty modules and vault setup need stronger progressive disclosure.

---

## File Structure

Create or modify these files:

- Create: `src/ui/design-system/tokens.css`
  - Owns shared color, spacing, radius, border, shadow, typography, and focus variables.
- Create: `src/ui/design-system/primitives.css`
  - Owns reusable utility classes for buttons, chips, status banners, section headers, empty modules, form rows, and focus rings.
- Create: `src/ui/design-system/README.md`
  - Documents token names, allowed component patterns, and button/status variants.
- Modify: `entrypoints/options/main.tsx`
  - Import design-system CSS before feature CSS.
- Modify: `entrypoints/popup/main.tsx`
  - Import design-system CSS before popup CSS.
- Modify: `entrypoints/content.tsx`
  - Ensure floating CSS can consume the same visual language without leaking to host page.
- Modify: `src/ui/profile/ProfilePage.tsx`
  - Add profile readiness header, compact empty modules, improved save state, and mobile-friendly structure.
- Modify: `src/ui/profile/profile.css`
  - Replace ad hoc profile styling with tokenized layout and responsive rules.
- Modify: `src/ui/vault/SensitiveVaultSection.tsx`
  - Convert vault into state-based progressive UI: not set up, locked, unlocked editor, reset confirm, inline error.
- Modify: `src/ui/vault/SensitiveVaultSection.test.tsx`
  - Add RED-first tests for progressive disclosure and error feedback.
- Modify: `src/ui/floating/FloatingPanel.tsx`
  - Add professional status chips, clearer sensitive grouping, stronger CTA, and mobile compact mode.
- Modify: `src/ui/floating/floating-styles.ts`
  - Token-aligned floating panel styles, mobile bottom-sheet/collapsed treatment, visible focus states.
- Modify: `src/ui/floating/FloatingPanel.test.tsx`
  - Add RED-first tests for status chip labels and no-ready empty state.
- Modify: `src/ui/floating/FloatingPanel.sensitive.test.tsx`
  - Add RED-first tests for vault setup CTA hierarchy and sensitive list grouping.
- Modify: `src/ui/popup/PopupPage.tsx`
  - Make popup a compact command center with readiness summary, next best action, current page summary, and settings link.
- Modify: `src/ui/popup/popup.css`
  - Token-aligned compact popup layout.
- Modify: `src/ui/popup/PopupPage.test.tsx`
  - Add RED-first tests for actionable empty state and missing essentials.
- Create: `e2e/iteration6-design-polish.mjs`
  - Captures desktop/mobile screenshots and asserts critical visible copy/controls without weakening behavior.
- Modify: `package.json`
  - Add `iteration6-design-polish` to `test:e2e` after Iteration 4 vault acceptance.
- Modify: `.agent/iteration-state.md`
  - Record Iteration 6 status and verification evidence after implementation.

---

### Task 1: Establish Shared Design Tokens And Primitives

**Files:**
- Create: `src/ui/design-system/tokens.css`
- Create: `src/ui/design-system/primitives.css`
- Create: `src/ui/design-system/README.md`
- Modify: `entrypoints/options/main.tsx`
- Modify: `entrypoints/popup/main.tsx`

**Interfaces:**
- Produces CSS custom properties under `:root`:
  - `--fillio-color-bg`
  - `--fillio-color-surface`
  - `--fillio-color-surface-subtle`
  - `--fillio-color-text`
  - `--fillio-color-muted`
  - `--fillio-color-border`
  - `--fillio-color-focus`
  - `--fillio-color-danger`
  - `--fillio-color-warning-bg`
  - `--fillio-color-success-bg`
  - `--fillio-radius-sm`
  - `--fillio-radius-md`
  - `--fillio-radius-lg`
  - `--fillio-shadow-panel`
  - `--fillio-space-1` through `--fillio-space-8`
- Produces reusable classes:
  - `.fillio-button`
  - `.fillio-button-primary`
  - `.fillio-button-secondary`
  - `.fillio-button-danger`
  - `.fillio-chip`
  - `.fillio-chip-strong`
  - `.fillio-status`
  - `.fillio-status-success`
  - `.fillio-status-danger`
  - `.fillio-section-heading`
  - `.fillio-empty-row`

- [ ] **Step 1: Create token file**

Create `src/ui/design-system/tokens.css` with this initial content:

```css
:root {
  --fillio-color-bg: #f6f7f8;
  --fillio-color-surface: #ffffff;
  --fillio-color-surface-subtle: #f1f3f5;
  --fillio-color-text: #111318;
  --fillio-color-muted: #5f6673;
  --fillio-color-border: #d9dde3;
  --fillio-color-border-strong: #b8bec8;
  --fillio-color-focus: #2563eb;
  --fillio-color-danger: #b42318;
  --fillio-color-danger-bg: #fff1f0;
  --fillio-color-success: #027a48;
  --fillio-color-success-bg: #ecfdf3;
  --fillio-color-warning: #b54708;
  --fillio-color-warning-bg: #fffaeb;
  --fillio-radius-sm: 6px;
  --fillio-radius-md: 8px;
  --fillio-radius-lg: 10px;
  --fillio-shadow-panel: 0 16px 40px rgba(17, 24, 39, 0.12);
  --fillio-space-1: 4px;
  --fillio-space-2: 8px;
  --fillio-space-3: 12px;
  --fillio-space-4: 16px;
  --fillio-space-5: 20px;
  --fillio-space-6: 24px;
  --fillio-space-7: 32px;
  --fillio-space-8: 40px;
}
```

- [ ] **Step 2: Create primitive classes**

Create `src/ui/design-system/primitives.css` with token-backed button, chip, status, and empty-row classes. Buttons must have min-height `40px`, visible focus outline, disabled state, and no negative letter spacing.

- [ ] **Step 3: Import primitives**

Add imports to `entrypoints/options/main.tsx` before `profile.css`:

```ts
import '../../src/ui/design-system/tokens.css';
import '../../src/ui/design-system/primitives.css';
```

Add imports to `entrypoints/popup/main.tsx` before `popup.css`:

```ts
import '../../src/ui/design-system/tokens.css';
import '../../src/ui/design-system/primitives.css';
```

- [ ] **Step 4: Verify static gates**

Run:

```powershell
rtk pnpm typecheck
rtk pnpm lint
rtk pnpm format:check
```

Expected: all pass.

---

### Task 2: Make Profile Page A Guided Workbench

**Files:**
- Modify: `src/ui/profile/ProfilePage.tsx`
- Modify: `src/ui/profile/profile.css`
- Modify: `src/ui/profile/ProfilePage.test.tsx`

**Interfaces:**
- Consumes existing `ProfilePage` props and profile readiness data.
- Produces visible header summary:
  - `Profile readiness`
  - `sections ready`
  - `Missing essentials`
- Produces compact empty module rows for Experience, Education, Skills, and Application variants.

- [ ] **Step 1: Write RED tests for guided header**

In `src/ui/profile/ProfilePage.test.tsx`, add a test that renders an empty profile and expects:

```ts
expect(screen.getByText('Profile readiness')).toBeInTheDocument();
expect(screen.getByText(/sections ready/i)).toBeInTheDocument();
expect(screen.getByText('Missing essentials')).toBeInTheDocument();
expect(screen.getByRole('button', { name: /save profile/i })).toBeInTheDocument();
```

Run:

```powershell
rtk pnpm test src/ui/profile/ProfilePage.test.tsx
```

Expected: FAIL because the guided header does not exist yet.

- [ ] **Step 2: Implement header summary**

Update `ProfilePage.tsx` to render a top summary section between intro copy and the first card. The section must show:

- readiness label
- ready sections count
- up to three missing essential hints: first name, email, phone
- save state text near the save action

- [ ] **Step 3: Write RED tests for compact empty modules**

Add assertions for empty rows:

```ts
expect(screen.getByText('Experience')).toBeInTheDocument();
expect(screen.getByText('No experience added yet.')).toBeInTheDocument();
expect(screen.getByRole('button', { name: /add experience/i })).toBeInTheDocument();
```

Run:

```powershell
rtk pnpm test src/ui/profile/ProfilePage.test.tsx
```

Expected: FAIL until compact empty copy exists.

- [ ] **Step 4: Implement compact empty module layout**

Replace large blank empty cards for Experience, Education, Skills, and Application variants with compact rows using `.fillio-empty-row`. Keep the existing add buttons and their accessible names unchanged.

- [ ] **Step 5: Rework profile CSS**

Update `profile.css` to:

- use tokens for colors, radius, border, spacing
- keep desktop forms two-column where width allows
- use single-column mobile layout below `720px`
- keep cards at `8px` or `10px` radius
- keep Save visible near header on desktop
- avoid cards inside cards

- [ ] **Step 6: Verify**

Run:

```powershell
rtk pnpm test src/ui/profile/ProfilePage.test.tsx
rtk pnpm typecheck
rtk pnpm lint
```

Expected: all pass.

---

### Task 3: Redesign Sensitive Vault As A Progressive Security Flow

**Files:**
- Modify: `src/ui/vault/SensitiveVaultSection.tsx`
- Modify: `src/ui/vault/SensitiveVaultSection.test.tsx`
- Modify: `src/ui/profile/profile.css`

**Interfaces:**
- Consumes existing vault client/status props.
- Preserves existing setup/unlock/save/lock/reset behavior.
- Produces four visible states:
  - Not set up: setup passphrase only.
  - Locked: unlock passphrase only.
  - Unlocked: sensitive editor.
  - Reset confirm: destructive confirmation.

- [ ] **Step 1: Write RED test for not-set-up progressive disclosure**

In `SensitiveVaultSection.test.tsx`, add a test where vault status is not configured. Assert:

```ts
expect(screen.getByText('Sensitive vault')).toBeInTheDocument();
expect(screen.getByText(/stored encrypted on this device/i)).toBeInTheDocument();
expect(screen.getByLabelText(/new vault passphrase/i)).toBeInTheDocument();
expect(screen.getByLabelText(/confirm vault passphrase/i)).toBeInTheDocument();
expect(screen.queryByLabelText(/national id/i)).not.toBeInTheDocument();
expect(screen.queryByLabelText(/expected salary/i)).not.toBeInTheDocument();
```

Run:

```powershell
rtk pnpm test src/ui/vault/SensitiveVaultSection.test.tsx
```

Expected: FAIL because sensitive fields currently show before setup.

- [ ] **Step 2: Implement not-set-up state**

Update `SensitiveVaultSection.tsx` so unconfigured vault only renders:

- explanatory copy
- new passphrase
- confirm passphrase
- `Set up vault` primary button

Do not render sensitive data fields before setup succeeds.

- [ ] **Step 3: Write RED test for inline passphrase mismatch error**

Add a test that enters mismatched passphrases and expects:

```ts
expect(screen.getByRole('alert')).toHaveTextContent(/passphrases do not match/i);
expect(screen.getByLabelText(/confirm vault passphrase/i)).toHaveAttribute('aria-invalid', 'true');
```

Run the focused test. Expected: FAIL until error semantics are implemented.

- [ ] **Step 4: Implement error semantics**

Make passphrase mismatch render inside `.fillio-status.fillio-status-danger` with `role="alert"`. Add `aria-invalid="true"` to the confirm field when mismatched.

- [ ] **Step 5: Write RED test for locked and unlocked states**

Add a test for configured locked vault:

```ts
expect(screen.getByLabelText(/vault passphrase/i)).toBeInTheDocument();
expect(screen.getByRole('button', { name: /unlock vault/i })).toBeInTheDocument();
expect(screen.queryByLabelText(/national id/i)).not.toBeInTheDocument();
```

Add a test for unlocked vault:

```ts
expect(screen.getByLabelText(/national id/i)).toBeInTheDocument();
expect(screen.getByRole('button', { name: /save sensitive data/i })).toBeInTheDocument();
expect(screen.getByRole('button', { name: /lock vault/i })).toBeInTheDocument();
```

- [ ] **Step 6: Implement locked/unlocked layout**

Preserve existing behavior while changing only presentation and progressive disclosure. Destructive reset must remain two-step.

- [ ] **Step 7: Verify**

Run:

```powershell
rtk pnpm test src/ui/vault/SensitiveVaultSection.test.tsx
rtk pnpm test src/ui/profile/ProfilePage.test.tsx
rtk pnpm typecheck
rtk pnpm lint
```

Expected: all pass.

---

### Task 4: Polish Floating Panel Into A Professional Extension Control

**Files:**
- Modify: `src/ui/floating/FloatingPanel.tsx`
- Modify: `src/ui/floating/floating-styles.ts`
- Modify: `src/ui/floating/FloatingPanel.test.tsx`
- Modify: `src/ui/floating/FloatingPanel.sensitive.test.tsx`

**Interfaces:**
- Consumes existing FloatingPanel props.
- Preserves existing callbacks:
  - `onFill`
  - `onReview`
  - `onOpenOptions`
  - `onUnlockSensitive`
  - `onFillSensitive`
- Produces status chips for Ready, Review, Sensitive, Unknown.
- Produces explicit sensitive section copy without exposing values.

- [ ] **Step 1: Write RED test for status chips**

In `FloatingPanel.test.tsx`, render the panel with ready/review/sensitive/unknown counts and assert:

```ts
expect(screen.getByText('Ready')).toBeInTheDocument();
expect(screen.getByText('Review')).toBeInTheDocument();
expect(screen.getByText('Sensitive')).toBeInTheDocument();
expect(screen.getByText('Unknown')).toBeInTheDocument();
```

Run:

```powershell
rtk pnpm test src/ui/floating/FloatingPanel.test.tsx
```

Expected: FAIL until chip labels exist.

- [ ] **Step 2: Implement chip group**

Replace the inline count sentence with a `.fillio-chip` group. Keep numeric values visible and machine-testable.

- [ ] **Step 3: Write RED test for sensitive grouping**

In `FloatingPanel.sensitive.test.tsx`, assert that sensitive fields appear under:

```ts
expect(screen.getByText('Sensitive fields detected')).toBeInTheDocument();
expect(screen.getByText('Date of birth')).toBeInTheDocument();
expect(screen.getByText('NIK')).toBeInTheDocument();
expect(screen.queryByText(/123456/)).not.toBeInTheDocument();
```

Run the focused test. Expected: FAIL until grouping copy exists.

- [ ] **Step 4: Implement sensitive section hierarchy**

Render:

- section heading `Sensitive fields detected`
- field labels only
- one primary CTA based on vault state:
  - unconfigured: `Set up vault`
  - locked: `Unlock vault`
  - unlocked: `Fill sensitive fields on <host>`

- [ ] **Step 5: Improve no-ready empty state**

When `readyCount === 0`, render:

```text
No safe fields ready to fill yet
```

Keep the fill button disabled or absent so behavior remains fail-closed.

- [ ] **Step 6: Update floating responsive styles**

Update `floating-styles.ts` so:

- desktop panel width is stable and visually polished
- mobile panel uses max-width `calc(100vw - 24px)`
- action buttons have tokenized primary/secondary styling
- focus outline is visible
- the panel never uses native-looking default buttons

- [ ] **Step 7: Verify**

Run:

```powershell
rtk pnpm test src/ui/floating/FloatingPanel.test.tsx
rtk pnpm test src/ui/floating/FloatingPanel.sensitive.test.tsx
rtk pnpm typecheck
rtk pnpm lint
```

Expected: all pass.

---

### Task 5: Make Popup A Compact Command Center

**Files:**
- Modify: `src/ui/popup/PopupPage.tsx`
- Modify: `src/ui/popup/popup.css`
- Modify: `src/ui/popup/PopupPage.test.tsx`

**Interfaces:**
- Consumes existing popup props/state.
- Produces:
  - readiness summary
  - current-page summary
  - next best action
  - missing essentials list capped at three items
  - settings link

- [ ] **Step 1: Write RED test for no-form actionable copy**

In `PopupPage.test.tsx`, render no current form and assert:

```ts
expect(screen.getByText(/open a job application form/i)).toBeInTheDocument();
expect(screen.getByRole('button', { name: /open profile settings/i })).toBeInTheDocument();
```

Run:

```powershell
rtk pnpm test src/ui/popup/PopupPage.test.tsx
```

Expected: FAIL until actionable copy exists.

- [ ] **Step 2: Write RED test for missing essentials**

Render incomplete profile readiness and assert:

```ts
expect(screen.getByText('Missing essentials')).toBeInTheDocument();
expect(screen.getAllByRole('listitem').length).toBeLessThanOrEqual(3);
```

Run focused test. Expected: FAIL until missing essentials list exists.

- [ ] **Step 3: Implement command-center layout**

Update popup to show:

- compact header
- readiness percentage
- missing essentials when incomplete
- current page card with action-oriented copy
- variants summary
- primary CTA chosen by state:
  - incomplete profile: `Open profile settings`
  - supported page with ready fields: `Fill safe fields`
  - review fields only: `Review fields`
  - sensitive only and vault absent/locked: `Open vault settings`

- [ ] **Step 4: Update popup CSS**

Use tokens and compact spacing. Keep popup width practical for Chrome extension popup. Avoid large empty whitespace.

- [ ] **Step 5: Verify**

Run:

```powershell
rtk pnpm test src/ui/popup/PopupPage.test.tsx
rtk pnpm typecheck
rtk pnpm lint
```

Expected: all pass.

---

### Task 6: Add Iteration 6 Visual Runtime Acceptance

**Files:**
- Create: `e2e/iteration6-design-polish.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces a browser acceptance script that launches Chromium with `.output/chrome-mv3`.
- Produces screenshots under `.agent/design-audits/iteration-6-verification/`.
- Does not submit forms, click Next, upload files, or fill sensitive values without explicit test action.

- [ ] **Step 1: Create RED acceptance script**

Create `e2e/iteration6-design-polish.mjs` that:

- builds or assumes `.output/chrome-mv3` exists
- launches Chromium persistent context with extension loaded
- captures options desktop screenshot
- captures options mobile screenshot
- serves an HTTP career form fixture
- captures floating panel desktop screenshot
- captures floating panel mobile screenshot
- asserts visible text:
  - `Profile readiness`
  - `Sensitive vault`
  - `Sensitive fields detected`
  - `No safe fields ready to fill yet`

Run:

```powershell
rtk node e2e/iteration6-design-polish.mjs
```

Expected before Tasks 2-4 complete: FAIL on missing text.

- [ ] **Step 2: Add to `test:e2e`**

Modify `package.json`:

```json
"test:e2e": "node e2e/extension-smoke.mjs && node e2e/iteration3-acceptance.mjs && node e2e/iteration4-vault.mjs && node e2e/iteration6-design-polish.mjs"
```

- [ ] **Step 3: Verify acceptance**

Run:

```powershell
rtk pnpm build
rtk pnpm test:e2e
```

Expected: all E2E scripts pass and screenshots are saved.

---

### Task 7: Final Design Review, Documentation, And State Update

**Files:**
- Modify: `.agent/iteration-state.md`
- Optional modify: `README.md` only if user-facing prototype instructions changed.
- Optional create: `.agent/design-audits/iteration-6-verification/notes.md`

**Interfaces:**
- Produces current-state record for Iteration 6.
- Produces verification evidence.

- [ ] **Step 1: Capture final screenshots**

Run:

```powershell
rtk pnpm build
rtk node e2e/iteration6-design-polish.mjs
```

Open and inspect:

- options desktop
- options mobile
- floating desktop
- floating mobile
- popup

Reject screenshots if there is overlap, clipped text, native-looking default controls, or invisible focus/disabled state.

- [ ] **Step 2: Run full verification**

Run:

```powershell
rtk pnpm install --frozen-lockfile
rtk pnpm test
rtk pnpm typecheck
rtk pnpm lint
rtk pnpm format:check
rtk pnpm build
rtk pnpm verify:manifest
rtk pnpm test:e2e
rtk pnpm zip
rtk git diff --check
```

Expected: all pass.

- [ ] **Step 3: Update iteration state**

Append Iteration 6 to `.agent/iteration-state.md`:

```markdown
## Iteration 6 — Design system and UX polish

Status: locally verified; repository integration pending.

Delivered:

1. Shared design tokens and primitives.
2. Guided profile workbench with readiness and missing essentials.
3. Progressive Sensitive Vault setup/locked/unlocked/reset UI.
4. Professional floating panel with status chips and sensitive grouping.
5. Compact popup command center.
6. Desktop and mobile visual runtime acceptance screenshots.

Final local verification evidence:

- `pnpm install --frozen-lockfile`
- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm format:check`
- `pnpm build`
- `pnpm verify:manifest`
- `pnpm test:e2e`
- `pnpm zip`
- `git diff --check`

Remaining repository integration:

- Open PR, observe CI, squash merge, and verify fresh `master`.
```

- [ ] **Step 4: Commit**

Use one coherent commit for the iteration implementation:

```powershell
rtk git add src entrypoints e2e package.json .agent README.md
rtk git commit -m "feat: polish Fillio design system and UX"
```

Do not commit until all required verification passes.

---

## Acceptance Criteria

- Options/profile page has a clear readiness summary and no longer presents first-run users with a long undifferentiated form.
- Sensitive Vault does not show sensitive data fields before vault setup.
- Vault errors are visible, inline, and exposed with `role="alert"` where appropriate.
- Floating panel uses chips/grouping and clear state-specific CTA without exposing sensitive values.
- Popup gives a next best action and avoids large empty whitespace.
- Mobile options and floating panel have no obvious clipping, overlap, or native-looking button inconsistency in captured screenshots.
- Design system tokens/primitives are reused by options and popup UI.
- No new extension permissions.
- No product-safety regressions: no auto-submit, no file upload, no sensitive fill without explicit approval, no wholesale decrypted vault exposure to content script.
- Full verification passes before PR.

## Self-Review

- Spec coverage: every audit risk maps to Tasks 1-6, and repository/state tracking maps to Task 7.
- Placeholder scan: no task uses TBD/TODO/implement later language.
- Type consistency: planned component names and file paths match the current repo structure.
- Scope check: this is one coherent subsystem, design/UX polish, with no backend, AI, permissions, or release-tag work.
