---
name: browser-extension-engineering
description: Use when changing Job Flow extension entrypoints, Manifest V3 configuration, content scripts, service workers, browser messaging, host permissions, storage access, or dynamic-page observation.
---

# Browser Extension Engineering

## Core principle

Treat the extension as multiple runtime contexts connected by explicit messages. Keep browser APIs at the edge and domain behavior browser-free.

## Use this skill when

- editing WXT entrypoints or manifest settings
- adding/changing permissions
- changing content/background/popup/options communication
- observing dynamic DOM
- debugging lifecycle issues caused by Manifest V3 service workers
- adding browser-specific behavior

## Runtime boundaries

Content script owns DOM detection/extraction/filling and the injected floating UI. Background owns browser-level coordination and sensitive vault session operations. Popup/options are UI surfaces, not business-logic containers.

Never assume the background service worker is permanently alive. Persist durable state; use session storage/alarms only for intentionally ephemeral lifecycle state.

## Permission rule

Before adding or widening a permission, identify the exact current behavior that requires it. Prefer the narrowest permission that works.

Permission expansion changes the browser trust/privacy surface. If the user's request does not already authorize that material product/security decision, surface it before implementation. Never add history, downloads, tabs, scripting, or broad host access merely "for future use".

## Content-script pattern

```text
DOM signal
 -> scanner/extractor
 -> serializable FieldContext
 -> application/domain analysis
 -> FillPlan
 -> user approval
 -> DOM filler
```

Do not import profile repositories or vault plaintext directly into DOM code.

## Dynamic pages

Use `MutationObserver` as a signal source, not as the analyzer itself:

```text
mutations -> filter -> debounce -> fingerprint/change check -> rescan
```

Ignore Job Flow's own shadow-root UI and avoid busy polling.

## Messaging

Messages should be small, typed, and intent-based, e.g. `ANALYZE_PAGE`, `GET_RESOLVED_PROFILE`, `UNLOCK_VAULT`, `RESOLVE_APPROVED_SENSITIVE_VALUES`.

Do not send the whole decrypted sensitive vault to content scripts.

When a change materially alters a cross-context/public message contract beyond the already-authorized requirement, treat that as a material architecture decision rather than silently expanding the protocol.

## Common mistakes

- module-global background state assumed to persist forever
- domain code importing `chrome.*`
- injecting UI without CSS isolation
- adding site-specific selectors to generic matcher logic
- scanning the whole document on every mutation
- requesting permissions before a feature needs them
- storing career data in host-page `localStorage`

## Verification

Verify only the extension boundaries that the change can realistically break.

Possible high-signal checks include:

- unpacked load/bootstrap when entrypoint/manifest behavior changed
- generated permission/manifest verification when permissions/config changed
- content/background messaging when the message boundary changed
- focused real DOM journey when browser DOM semantics are part of the change
- service-worker restart behavior when ephemeral lifecycle/state handling changed
- durable-state integrity when storage ownership changed

This is a risk menu, not a mandatory checklist. Do not run or add browser journeys merely because the modified code lives in an extension project.
