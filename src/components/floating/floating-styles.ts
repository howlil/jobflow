export const FLOATING_STYLES = `
.jobflow-assistant {
  --jobflow-bg: #fafafa;
  --jobflow-surface: #ffffff;
  --jobflow-surface-subtle: #f7f7f7;
  --jobflow-surface-muted: #f7f7f7;
  --jobflow-text: #171717;
  --jobflow-muted: #525252;
  --jobflow-subtle: #737373;
  --jobflow-border: #dedede;
  --jobflow-border-strong: #c9c9c9;
  --jobflow-accent: #171717;
  --jobflow-accent-strong: #0a0a0a;
  --jobflow-accent-soft: #e5e5e5;
  --jobflow-danger: #dc2626;
  --jobflow-danger-bg: #fef2f2;
  --jobflow-shadow-overlay: 0 12px 28px rgba(0, 0, 0, .14);
  color: var(--jobflow-text);
  font-family: "Inter Variable", Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px;
  line-height: 1.45;
  pointer-events: none;
}

.jobflow-assistant *,
.jobflow-assistant *::before,
.jobflow-assistant *::after {
  box-sizing: border-box;
}

.jobflow-launcher,
.jobflow-panel {
  pointer-events: auto;
}

.jobflow-launcher {
  position: fixed;
  z-index: 2147483647;
  right: 18px;
  bottom: 18px;
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  padding: 0;
  border: 1px solid var(--jobflow-accent-strong);
  border-radius: 999px;
  background: var(--jobflow-accent);
  color: var(--jobflow-surface);
  box-shadow: var(--jobflow-shadow-overlay);
  cursor: pointer;
  transition: transform 120ms ease, background 120ms ease;
}

.jobflow-launcher:hover {
  background: var(--jobflow-accent-strong);
  transform: translateY(-2px);
}

.jobflow-launcher:focus-visible,
.jobflow-panel button:focus-visible,
.jobflow-panel input:focus-visible,
.jobflow-panel textarea:focus-visible,
.jobflow-panel select:focus-visible {
  outline: 2px solid var(--jobflow-text);
  outline-offset: 3px;
}

.jobflow-launcher__mark {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -.04em;
}

.jobflow-launcher__badge {
  position: absolute;
  top: -5px;
  right: -5px;
  display: grid;
  min-width: 20px;
  height: 20px;
  place-items: center;
  padding: 0 4px;
  border: 2px solid var(--jobflow-surface);
  border-radius: 999px;
  background: var(--jobflow-accent);
  color: var(--jobflow-surface);
  font-size: 10px;
  font-weight: 800;
}

.jobflow-panel {
  position: fixed;
  z-index: 2147483647;
  right: 18px;
  bottom: 78px;
  display: flex;
  flex-direction: column;
  width: min(392px, calc(100vw - 28px));
  max-height: min(640px, calc(100vh - 104px));
  overflow: hidden;
  border: 1px solid var(--jobflow-border-strong);
  border-radius: 8px;
  background: var(--jobflow-surface);
  box-shadow: var(--jobflow-shadow-overlay);
}

.jobflow-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid var(--jobflow-border);
}

.jobflow-panel__header > div {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.jobflow-panel__eyebrow {
  color: var(--jobflow-subtle);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.jobflow-panel__header strong {
  overflow: hidden;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -.02em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jobflow-panel__host {
  overflow: hidden;
  color: var(--jobflow-muted);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jobflow-panel__icon-button {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--jobflow-muted);
  cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease, color 120ms ease;
}

.jobflow-panel__icon-button:hover {
  border-color: var(--jobflow-border);
  background: var(--jobflow-surface-subtle);
  color: var(--jobflow-text);
}

.jobflow-panel__tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  padding: 6px;
  border-bottom: 1px solid var(--jobflow-border);
  background: var(--jobflow-surface);
}

.jobflow-panel__tabs button {
  display: inline-flex;
  min-width: 0;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--jobflow-muted);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease, color 120ms ease;
}

.jobflow-panel__tabs button:hover {
  border-color: var(--jobflow-border);
  background: var(--jobflow-surface-subtle);
  color: var(--jobflow-text);
}

.jobflow-panel__tabs button.is-active {
  border-color: var(--jobflow-accent);
  background: var(--jobflow-accent);
  color: var(--jobflow-surface);
}

.jobflow-panel__tabs button > span {
  display: grid;
  min-width: 18px;
  height: 18px;
  place-items: center;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--jobflow-surface-muted);
  color: var(--jobflow-muted);
  font-size: 11px;
  font-weight: 700;
}

.jobflow-panel__tabs button.is-active > span {
  background: var(--jobflow-surface);
  color: var(--jobflow-accent);
}

.jobflow-panel__content {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.jobflow-panel svg {
  flex: 0 0 auto;
}

.jobflow-panel__view,
.jobflow-panel__body,
.jobflow-panel__menu {
  display: grid;
  min-height: 0;
}

.jobflow-panel__summary {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 12px 10px;
}

.jobflow-panel__summary > div {
  display: grid;
  gap: 3px;
}

.jobflow-panel__summary strong {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -.035em;
}

.jobflow-panel__summary span,
.jobflow-panel__summary small {
  color: var(--jobflow-muted);
  font-size: 13px;
}

.jobflow-panel__summary small {
  padding-bottom: 3px;
  text-align: right;
}

.jobflow-panel__fill {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 12px 12px;
  padding: 7px 12px;
  border: 1px solid var(--jobflow-accent);
  border-radius: 6px;
  background: var(--jobflow-accent);
  color: var(--jobflow-surface);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.jobflow-panel__fill:hover:not(:disabled),
.jobflow-panel__action--primary:hover:not(:disabled) {
  border-color: var(--jobflow-accent-strong);
  background: var(--jobflow-accent-strong);
}

.jobflow-panel__fill:disabled {
  border-color: var(--jobflow-border);
  background: var(--jobflow-surface-subtle);
  color: var(--jobflow-subtle);
  cursor: not-allowed;
}

.jobflow-panel__section {
  display: grid;
  border-top: 1px solid var(--jobflow-border);
}

.jobflow-panel__section:first-child {
  border-top: 0;
}

.jobflow-panel__section-heading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px 6px;
  color: var(--jobflow-muted);
  font-size: 13px;
  font-weight: 600;
}

.jobflow-panel__document {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
}

.jobflow-panel__document + .jobflow-panel__document {
  border-top: 1px solid var(--jobflow-border);
}

.jobflow-panel__document-copy {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.jobflow-panel__document-copy strong {
  font-size: 14px;
}

.jobflow-panel__document-copy span,
.jobflow-panel__document-copy small {
  overflow: hidden;
  color: var(--jobflow-muted);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jobflow-panel__menu > div,
.jobflow-panel__menu button {
  display: flex;
  min-height: 36px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 12px;
  border: 0;
  border-top: 1px solid var(--jobflow-border);
  background: transparent;
  color: var(--jobflow-text);
  font-size: 14px;
  text-align: left;
}

.jobflow-panel__menu button {
  cursor: pointer;
}

.jobflow-panel__menu button:hover,
.jobflow-panel__open-profile:hover,
.jobflow-panel__back:hover,
.jobflow-panel__action--secondary:hover {
  background: var(--jobflow-surface-subtle);
}

.jobflow-panel__menu button > span {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.jobflow-panel__menu strong {
  color: var(--jobflow-muted);
  font-size: 13px;
  font-weight: 600;
}

.jobflow-panel__open-profile {
  display: flex;
  min-height: 36px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 12px;
  border: 0;
  border-top: 1px solid var(--jobflow-border);
  background: transparent;
  color: var(--jobflow-text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}

.jobflow-panel__detail {
  display: grid;
  gap: 12px;
  padding: 12px;
}

.jobflow-panel__detail h2 {
  margin: 4px 0 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -.025em;
}

.jobflow-panel__back {
  display: inline-flex;
  width: max-content;
  min-height: 36px;
  align-items: center;
  gap: 6px;
  margin-left: -8px;
  padding: 7px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--jobflow-muted);
  font-size: 14px;
  cursor: pointer;
}

.jobflow-panel__section-label {
  margin: 0;
  color: var(--jobflow-subtle);
  font-size: 13px;
  font-weight: 600;
}

.jobflow-panel__helper {
  margin: 7px 0 0;
  color: var(--jobflow-muted);
  font-size: 13px;
  line-height: 1.45;
}

.jobflow-panel__review {
  display: grid;
  gap: 8px;
  padding: 10px 0;
  border-top: 1px solid var(--jobflow-border);
}

.jobflow-panel__review > strong {
  font-size: 14px;
}

.jobflow-panel__review > small {
  color: var(--jobflow-muted);
  font-size: 13px;
}

.jobflow-panel__review-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.jobflow-panel__action,
.jobflow-panel__action--secondary {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.jobflow-panel__action--secondary {
  padding: 7px 12px;
  border: 1px solid var(--jobflow-border-strong);
  background: var(--jobflow-surface);
  color: var(--jobflow-text);
  font-weight: 600;
}

.jobflow-panel__sensitive-list {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--jobflow-border);
  list-style: none;
}

.jobflow-panel__sensitive-list li {
  padding: 10px 0;
  border-bottom: 1px solid var(--jobflow-border);
  color: var(--jobflow-muted);
  font-size: 13px;
}

.jobflow-panel__sensitive-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 10px;
  border: 1px solid color-mix(in srgb, var(--jobflow-danger) 28%, transparent);
  border-radius: 6px;
  background: var(--jobflow-danger-bg);
  color: var(--jobflow-danger);
  font-size: 13px;
}

.jobflow-panel__unlock,
.jobflow-panel__form {
  display: grid;
  gap: 8px;
}

.jobflow-panel__section > .jobflow-panel__form {
  padding: 0 12px 12px;
}

.jobflow-panel__unlock label,
.jobflow-panel__form label {
  display: grid;
  gap: 6px;
  color: var(--jobflow-muted);
  font-size: 13px;
  font-weight: 600;
}

.jobflow-panel__form small {
  color: var(--jobflow-muted);
  font-size: 13px;
}

.jobflow-panel__unlock input,
.jobflow-panel__form input,
.jobflow-panel__form select,
.jobflow-panel__form textarea {
  width: 100%;
  min-height: 36px;
  padding: 7px 10px;
  border: 1px solid var(--jobflow-border);
  border-radius: 6px;
  background: var(--jobflow-surface);
  color: var(--jobflow-text);
  font-size: 14px;
}

.jobflow-panel__unlock input:hover,
.jobflow-panel__form input:hover,
.jobflow-panel__form select:hover,
.jobflow-panel__form textarea:hover {
  border-color: var(--jobflow-border-strong);
}

.jobflow-panel__form textarea {
  min-height: 72px;
  resize: vertical;
}

.jobflow-panel__status {
  margin: 0 12px 10px;
  padding: 8px 10px;
  border: 1px solid var(--jobflow-border);
  border-radius: 6px;
  background: var(--jobflow-surface-subtle);
  color: var(--jobflow-muted);
  font-size: 13px;
}

.jobflow-panel__detail > .jobflow-panel__status {
  margin: 0;
}

.jobflow-panel__action--primary {
  min-height: 36px;
  padding: 7px 10px;
  border: 1px solid var(--jobflow-accent);
  border-radius: 6px;
  background: var(--jobflow-accent);
  color: var(--jobflow-surface);
  font-size: 14px;
  font-weight: 600;
}

.jobflow-panel__empty {
  display: grid;
  gap: 5px;
  padding: 24px 16px;
  color: var(--jobflow-muted);
  text-align: center;
}

.jobflow-panel__empty strong {
  color: var(--jobflow-text);
  font-size: 14px;
}

.jobflow-panel__empty span {
  font-size: 13px;
}

@media (prefers-color-scheme: dark) {
  .jobflow-assistant {
    --jobflow-bg: #0a0a0a;
    --jobflow-surface: #141414;
    --jobflow-surface-subtle: #1a1a1a;
    --jobflow-surface-muted: #1a1a1a;
    --jobflow-text: #fafafa;
    --jobflow-muted: #a3a3a3;
    --jobflow-subtle: #737373;
    --jobflow-border: #303030;
    --jobflow-border-strong: #4a4a4a;
    --jobflow-accent: #fafafa;
    --jobflow-accent-strong: #ffffff;
    --jobflow-accent-soft: #333333;
    --jobflow-danger: #f87171;
    --jobflow-danger-bg: #450a0a;
  }
}

@media (max-width: 520px) {
  .jobflow-launcher {
    right: 14px;
    bottom: 14px;
    width: 46px;
    height: 46px;
  }

  .jobflow-panel {
    right: 12px;
    bottom: 70px;
    width: calc(100vw - 24px);
    max-height: calc(100vh - 92px);
    border-radius: 8px;
  }
}

@media (any-pointer: coarse) {
  .jobflow-panel__icon-button,
  .jobflow-panel__fill,
  .jobflow-panel__menu button,
  .jobflow-panel__open-profile,
  .jobflow-panel__tabs button,
  .jobflow-panel__action,
  .jobflow-panel__action--secondary,
  .jobflow-panel__action--primary,
  .jobflow-panel__back,
  .jobflow-panel__unlock input,
  .jobflow-panel__form input,
  .jobflow-panel__form select {
    min-height: 44px;
  }

  .jobflow-panel__icon-button {
    min-width: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .jobflow-launcher,
  .jobflow-panel button,
  .jobflow-panel input,
  .jobflow-panel textarea,
  .jobflow-panel select {
    transition: none;
  }
}
`;