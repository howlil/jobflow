export const FLOATING_STYLES = `
.jobflow-assistant {
  --jobflow-bg: #fafafa;
  --jobflow-surface: #ffffff;
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
  top: 50%;
  right: 0;
  display: grid;
  width: 42px;
  height: 56px;
  place-items: center;
  padding: 0;
  border: 1px solid var(--jobflow-accent);
  border-right: 0;
  border-radius: 8px 0 0 8px;
  background: var(--jobflow-accent);
  color: var(--jobflow-surface);
  box-shadow: var(--jobflow-shadow-overlay);
  cursor: pointer;
  transform: translateY(-50%);
  transition: width 120ms ease, background 120ms ease;
}

.jobflow-launcher:hover {
  width: 46px;
  background: var(--jobflow-accent-strong);
}

.jobflow-assistant--open .jobflow-launcher {
  display: none;
}

.jobflow-launcher:focus-visible,
.jobflow-panel button:focus-visible,
.jobflow-panel input:focus-visible,
.jobflow-panel select:focus-visible,
.jobflow-panel textarea:focus-visible {
  outline: 0;
  border-color: var(--jobflow-text);
  box-shadow: 0 0 0 3px var(--jobflow-accent-soft);
}

.jobflow-launcher__mark {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -.04em;
}

.jobflow-launcher__badge {
  position: absolute;
  top: -6px;
  left: -6px;
  display: grid;
  min-width: 20px;
  height: 20px;
  place-items: center;
  padding: 0 4px;
  border: 2px solid var(--jobflow-surface);
  border-radius: 999px;
  background: var(--jobflow-text);
  color: var(--jobflow-surface);
  font-size: 10px;
  font-weight: 800;
}

.jobflow-panel {
  position: fixed;
  z-index: 2147483647;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(368px, 100vw);
  height: 100dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 0;
  border-left: 1px solid var(--jobflow-border);
  border-radius: 0;
  background: var(--jobflow-surface);
  box-shadow: var(--jobflow-shadow-overlay);
  scrollbar-width: thin;
}

.jobflow-panel button,
.jobflow-panel input,
.jobflow-panel select,
.jobflow-panel textarea {
  font: inherit;
}

.jobflow-panel__header {
  position: sticky;
  z-index: 2;
  top: 0;
  display: flex;
  min-height: 56px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--jobflow-border);
  background: var(--jobflow-surface);
}

.jobflow-panel__header > div {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.jobflow-panel__header strong {
  overflow: hidden;
  font-size: 15px;
  font-weight: 650;
  letter-spacing: -.018em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jobflow-panel__eyebrow,
.jobflow-panel__section-label,
.jobflow-panel__section-heading span {
  color: var(--jobflow-subtle);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .075em;
  text-transform: uppercase;
}

.jobflow-panel__host {
  overflow: hidden;
  color: var(--jobflow-subtle);
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
  transition: border-color 120ms ease, color 120ms ease;
}

.jobflow-panel__icon-button:hover {
  border-color: var(--jobflow-border);
  color: var(--jobflow-text);
}

.jobflow-panel svg {
  flex: 0 0 auto;
}

.jobflow-panel__body,
.jobflow-panel__view {
  display: grid;
  min-height: 0;
}

.jobflow-panel__summary {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 12px 12px;
}

.jobflow-panel__summary > div {
  display: grid;
  gap: 4px;
}

.jobflow-panel__summary strong {
  font-size: 20px;
  font-weight: 650;
  letter-spacing: -.03em;
}

.jobflow-panel__summary span,
.jobflow-panel__summary small {
  color: var(--jobflow-subtle);
  font-size: 13px;
}

.jobflow-panel__summary small {
  padding-bottom: 2px;
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
  font-weight: 650;
  cursor: pointer;
}

.jobflow-panel__fill:hover:not(:disabled),
.jobflow-panel__action--primary:hover:not(:disabled) {
  border-color: var(--jobflow-accent-strong);
  background: var(--jobflow-accent-strong);
}

.jobflow-panel__fill:disabled {
  border-color: var(--jobflow-border);
  background: var(--jobflow-surface-muted);
  color: var(--jobflow-subtle);
  cursor: not-allowed;
}

.jobflow-panel__section {
  display: grid;
  border-top: 1px solid var(--jobflow-border);
  background: var(--jobflow-surface);
}

.jobflow-panel__section-heading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 12px 6px;
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
  font-weight: 600;
}

.jobflow-panel__document-copy span,
.jobflow-panel__document-copy small {
  overflow: hidden;
  color: var(--jobflow-subtle);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jobflow-panel__menu {
  display: grid;
}

.jobflow-panel__menu button {
  display: flex;
  min-height: 42px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 12px;
  border: 0;
  border-top: 1px solid var(--jobflow-border);
  background: var(--jobflow-surface);
  color: var(--jobflow-text);
  cursor: pointer;
  text-align: left;
}

.jobflow-panel__menu button:first-child {
  border-top: 0;
}

.jobflow-panel__menu button > span {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.jobflow-panel__menu button:hover,
.jobflow-panel__open-profile:hover,
.jobflow-panel__back:hover,
.jobflow-panel__action--secondary:hover {
  color: var(--jobflow-text);
}

.jobflow-panel__menu strong {
  color: var(--jobflow-subtle);
  font-size: 13px;
  font-weight: 600;
}

.jobflow-panel__open-profile {
  display: flex;
  min-height: 42px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 12px;
  border: 0;
  border-top: 1px solid var(--jobflow-border);
  background: var(--jobflow-surface);
  color: var(--jobflow-text);
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}

.jobflow-panel__detail {
  display: grid;
  gap: 12px;
  padding: 12px 12px 18px;
}

.jobflow-panel__detail h2 {
  margin: 4px 0 0;
  font-size: 16px;
  font-weight: 650;
  letter-spacing: -.025em;
}

.jobflow-panel__back {
  display: inline-flex;
  width: max-content;
  min-height: 36px;
  align-items: center;
  gap: 6px;
  margin-left: -8px;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--jobflow-muted);
  cursor: pointer;
}

.jobflow-panel__back:hover {
  border-color: var(--jobflow-border);
}

.jobflow-panel__section-label {
  margin: 0;
}

.jobflow-panel__helper {
  margin: 8px 0 0;
  color: var(--jobflow-subtle);
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
  cursor: pointer;
}

.jobflow-panel__action--secondary {
  padding: 7px 12px;
  border: 1px solid var(--jobflow-border);
  background: transparent;
  color: var(--jobflow-text);
  font-size: 14px;
  font-weight: 600;
}

.jobflow-panel__action--secondary:hover {
  border-color: var(--jobflow-border-strong);
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
  padding: 12px 0;
  border-bottom: 1px solid var(--jobflow-border);
  color: var(--jobflow-muted);
}

.jobflow-panel__sensitive-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 10px;
  border: 1px solid color-mix(in srgb, var(--jobflow-danger) 30%, transparent);
  border-radius: 6px;
  background: var(--jobflow-danger-bg);
  color: var(--jobflow-danger);
}

.jobflow-panel__unlock {
  display: grid;
  gap: 6px;
}

.jobflow-panel__unlock label,
.jobflow-panel__form label {
  display: grid;
  gap: 6px;
  color: var(--jobflow-muted);
  font-size: 13px;
  font-weight: 600;
}

.jobflow-panel__form {
  display: grid;
  gap: 8px;
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
  background: transparent;
  color: var(--jobflow-text);
  transition: border-color 120ms ease, box-shadow 120ms ease;
}

.jobflow-panel__unlock input:hover,
.jobflow-panel__form input:hover,
.jobflow-panel__form select:hover,
.jobflow-panel__form textarea:hover {
  border-color: var(--jobflow-border-strong);
}

.jobflow-panel__form textarea {
  min-height: 80px;
  resize: vertical;
}

.jobflow-panel__status {
  margin: 0;
  padding: 8px 10px;
  border: 1px solid var(--jobflow-border);
  border-radius: 6px;
  background: var(--jobflow-surface-muted);
  color: var(--jobflow-muted);
  font-size: 13px;
}

.jobflow-panel__action--primary {
  width: 100%;
  min-height: 36px;
  padding: 7px 10px;
  border: 1px solid var(--jobflow-accent);
  border-radius: 6px;
  background: var(--jobflow-accent);
  color: var(--jobflow-surface);
  font-size: 14px;
  font-weight: 650;
}

@media (max-width: 560px) {
  .jobflow-panel {
    left: 0;
    width: auto;
  }

  .jobflow-launcher {
    width: 40px;
    height: 52px;
    border-radius: 8px 0 0 8px;
  }
}

@media (any-pointer: coarse) {
  .jobflow-panel__icon-button,
  .jobflow-panel__fill,
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
  .jobflow-panel {
    transition: none;
  }
}
`;