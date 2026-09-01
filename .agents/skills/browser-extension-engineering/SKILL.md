---
name: browser-extension-engineering
description: Use when changing Jobflow extension entrypoints, Manifest V3 configuration, content scripts, service workers, browser messaging, host permissions, storage access, or dynamic-page observation.
---

# Browser Extension Engineering

## Core principle

Treat the extension as multiple runtime contexts connected by explicit messages. Keep browser APIs at the edge and domain behavior browser-free.

## Runtime boundaries

- Content script: DOM detection/extraction/filling and injected assistant.
- Background: browser-level coordination and sensitive-vault session operations.
- Popup/options: UI surfaces, not business-logic containers.

Never assume the background service worker is permanently alive. Persist durable state; use ephemeral/session state only intentionally.

## Permission rule

Before adding or widening a permission, identify the exact current behavior that requires it and choose the narrowest permission that works.

Permission expansion changes the trust/privacy surface. If the user's request does not already authorize it, surface the decision before implementation.

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

```text
mutations -> filter -> debounce -> fingerprint/change check -> targeted rescan
```

Ignore Jobflow's own Shadow-DOM UI and avoid busy polling.

## Messaging

Messages are small, typed, serializable, and intent-based. Do not send the whole decrypted sensitive vault to content scripts.

A material change to cross-context/public message contracts is an architecture decision rather than a silent protocol expansion.

## Common mistakes

- assuming module-global background state persists
- domain code importing `chrome.*`
- injected UI without CSS isolation
- site-specific selectors in generic matcher logic
- full document scans for every mutation
- speculative permissions
- host-page `localStorage` for career data

## Verification

Choose only boundaries the change can realistically break: generated manifest/permissions, unpacked extension bootstrap, messaging, focused DOM behavior, service-worker restart behavior, or durable-state integrity. Browser journeys are not mandatory merely because code lives in an extension project.