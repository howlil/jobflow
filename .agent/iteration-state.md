# Current Work State

This file contains only the state needed to resume work safely. It is not an iteration history, roadmap, status-report archive, or source of product authorization.

## Flow policy

- Product WIP target: **1 logical change**.
- Plan at milestone boundaries; execute continuously at slice boundaries; integrate at logical-change boundaries.
- Work hierarchy: **Milestone → Slice → Logical Change → Commit**.
- An iteration or sprint name is optional metadata; it never defines branch lifetime or release scope.
- Finished history belongs to Git/PRs/releases, not this file.
- Do not add command transcripts, screenshots, checkpoint logs, or completed iteration narratives here.
- A next candidate is context only. It does **not** authorize implementation or product-scope change without matching user intent.

## Active product change

### Milestone

**Job Pipeline Operating Experience**

Desired outcome: Jobflow behaves as an operational job-application workspace where the pipeline is the home surface and one opportunity can be opened, understood, acted on, edited, and returned from without losing pipeline context.

### Active slice

**Application Detail**

User-visible outcome:
- a job card can open one reusable application-detail surface from Board, Needs action, or Closed
- detail shows stage/progress, priority, next action/date, deadline, job context, contact/source, URL, and notes when available
- active jobs expose mark-done and valid previous/next stage actions from detail
- existing jobs are edited contextually from detail rather than opening the edit form from the board card
- returning from detail preserves the current pipeline view and search query

Logical-change boundary:
- keep selection/detail state inside `ApplicationsWorkspace`
- use one application-owned `ApplicationDetail` component
- no router, persistence-schema, backend/cloud, stage-model, or unrelated module-ownership change
- create flow remains on the Pipeline surface

Current position:
- Operational Home is integrated on `master`
- Application Detail, shared display/progress helpers, workspace selection/wiring, contextual edit/actions, and return-state behavior are implemented on the active branch
- unit and browser acceptance coverage are updated for the observable detail workflow
- quality gates and integration remain pending

Single next meaningful action:
- run the full quality gate for the Application Detail logical change and fix only evidence-backed failures before integration

Milestone exit gate:
- Application Detail acceptance behavior is complete
- unit and browser acceptance coverage pass
- typecheck, lint, format, compatibility, build, and manifest gates pass
- logical change is integrated
- no additional product scope is implied after this gate

## Current integrated state

- profile workspace streamlining and autosave are integrated
- the options surface uses one reusable dashboard shell with sidebar, topbar, and fluid responsive main content that continues to use wide-monitor space
- workspace navigation is oriented around Work, Career kit, and Data & privacy, with Pipeline as the operational home
- major editable workspace sections use one restrained bordered collapsible-card contract with contextual help; repeated editable records keep their own nested record boundary only when they represent a real entity
- exact calendar dates use native date controls and career date ranges use native month controls, with legacy values normalized at the input boundary
- Experience and Projects are the user-facing skill-authoring sources; the active skill inventory is the case-insensitive unique union of their linked skills
- skill entry uses one autosuggest field with Enter/comma-to-chip interaction; skill level and years-of-experience are not user-facing fields
- the persisted professional skill registry remains only as a compatibility/stable-ID index; registry-only entries are not active career skills
- CV import does not create standalone skills or fabricate skill-to-Experience/Project relationships
- repeatable record CRUD actions use one compact icon-button size/tone contract; section add actions and item remove actions no longer invent local button shapes
- the Sensitive Vault uses the same React control, section, status, and action primitives as the rest of the workspace
- profile autosave status is surfaced in the workspace topbar instead of a separate content strip
- options/profile layout composition uses Tailwind utilities in React; `tailwind.css` is limited to base rules and compatibility grammar for call sites not yet expressed through React primitives
- the obsolete `profile.css` compatibility shim is removed
- testing policy is risk/signal/cost based; TDD is optional rather than ceremonial
- CV import orchestration is owned by the application layer rather than React/infrastructure coupling
- the Documents workspace treats resumes as stored local files; metadata remains the persisted reference contract but users cannot create metadata-only resume entries
- content-script semantic page analysis is owned by the application layer while the content entrypoint remains the browser/runtime shell
- page-context document analysis uses `documentFields` as the single source of truth for detected upload fields and recommendations
- `ProfileFormSections.tsx` is composition-only; profile editing surfaces are separated into cohesive owner modules
- career records preserve one experience surface while languages, certifications, and projects have independent UI ownership
- normal canonical autofill fields are defined once in `canonical-fields.ts`; runtime validation and compile-time consumers share that source
- the floating assistant uses the canonical neutral visual tokens and presents human-readable canonical-field labels
- the local application pipeline stores reviewed applications in versioned local storage, supports workspace CRUD, lightweight opportunity details, priority, next-action tracking, deadlines, and explicit stage changes while preserving no-backend, no-cloud-sync, and no-auto-submit boundaries
- the application workspace opens on Pipeline: active opportunities use a horizontal Saved → Applied → Assessment → Interview → Offer board, due work has a dedicated Needs action view, terminal Accepted/Rejected/Withdrawn outcomes live in Closed, and operational fields are surfaced on cards and forms

## Uncommitted candidate context

None.
