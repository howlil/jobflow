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

Before adding a permission, write down the exact current behavior that needs it. Prefer the narrowest permission that works. Never add history, downloads, tabs, scripting, or broad host access merely "for future use".

Automatic arbitrary career-site detection may justify broad HTTPS host matching, but that choice must remain explicit and reviewed before store release.

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

## Common mistakes

- module-global background state assumed to persist forever
- domain code importing `chrome.*`
- injecting UI without CSS isolation
- adding site-specific selectors to generic matcher logic
- scanning the whole document on every mutation
- requesting permissions before a feature needs them
- storing career data in host-page `localStorage`

## Verification

For extension-runtime changes, verify unpacked load, manifest permissions, content/background messaging, one real DOM journey, and that service-worker restart does not corrupt durable state.
