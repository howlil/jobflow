export const FLOATING_STYLES = `
.fillio-panel {
  --fillio-color-surface: #ffffff;
  --fillio-color-surface-subtle: #f1f3f5;
  --fillio-color-text: #111318;
  --fillio-color-text-hover: #30343d;
  --fillio-color-muted: #5f6673;
  --fillio-color-border: #d9dde3;
  --fillio-color-border-strong: #b8bec8;
  --fillio-color-focus: #2563eb;
  --fillio-color-danger: #b42318;
  --fillio-color-danger-bg: #fff1f0;
  --fillio-radius-sm: 6px;
  --fillio-radius-md: 8px;
  --fillio-shadow-panel: 0 16px 40px rgba(17, 24, 39, 0.12);
  box-sizing: border-box;
  width: 320px;
  max-width: calc(100vw - 24px);
  border: 1px solid var(--fillio-color-border);
  border-radius: var(--fillio-radius-md);
  background: var(--fillio-color-surface);
  color: var(--fillio-color-text);
  box-shadow: var(--fillio-shadow-panel);
  padding: 16px;
  font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
  line-height: 1.4;
}

.fillio-panel *,
.fillio-panel *::before,
.fillio-panel *::after {
  box-sizing: border-box;
}

.fillio-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.fillio-panel__header strong {
  font-size: 15px;
  font-weight: 650;
}

.fillio-panel__counts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.fillio-panel .fillio-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 26px;
  padding: 4px 8px;
  border: 1px solid var(--fillio-color-border);
  border-radius: 999px;
  background: var(--fillio-color-surface-subtle);
  color: var(--fillio-color-muted);
}

.fillio-panel .fillio-chip strong {
  color: var(--fillio-color-text);
}

.fillio-panel button {
  min-height: 36px;
  border: 1px solid var(--fillio-color-border-strong);
  border-radius: var(--fillio-radius-sm);
  background: var(--fillio-color-surface);
  color: var(--fillio-color-text);
  font: inherit;
  font-weight: 650;
  letter-spacing: 0;
  cursor: pointer;
  padding: 8px 12px;
}

.fillio-panel button:hover:not(:disabled) {
  background: var(--fillio-color-surface-subtle);
}

.fillio-panel button:focus-visible,
.fillio-panel input:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--fillio-color-focus) 28%, transparent);
  outline-offset: 2px;
}

.fillio-panel button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.fillio-panel__fill,
.fillio-panel__action--primary {
  width: 100%;
  border-color: var(--fillio-color-text);
  background: var(--fillio-color-text);
  color: var(--fillio-color-surface);
}

.fillio-panel__action--secondary {
  border-color: var(--fillio-color-border-strong);
  background: var(--fillio-color-surface-subtle);
  color: var(--fillio-color-text);
}

.fillio-panel__fill:hover:not(:disabled),
.fillio-panel__action--primary:hover:not(:disabled) {
  background: var(--fillio-color-text-hover);
}

.fillio-panel__reviews,
.fillio-panel__sensitive {
  display: grid;
  gap: 8px;
  margin: 0 0 16px;
}

.fillio-panel__review {
  padding: 8px;
  border: 1px solid var(--fillio-color-border);
  border-radius: var(--fillio-radius-sm);
  background: var(--fillio-color-surface-subtle);
}

.fillio-panel__review-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.fillio-panel__review-actions button {
  min-height: 32px;
  padding: 6px 8px;
}

.fillio-panel__section-heading {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
}

.fillio-panel__sensitive-list {
  display: grid;
  gap: 4px;
  margin: 0;
  padding-left: 18px;
  color: var(--fillio-color-muted);
}

.fillio-panel__sensitive-error {
  margin: 0;
  padding: 8px;
  border: 1px solid var(--fillio-color-danger);
  border-radius: var(--fillio-radius-sm);
  background: var(--fillio-color-danger-bg);
  color: var(--fillio-color-danger);
}

.fillio-panel__unlock {
  display: grid;
  gap: 8px;
}

.fillio-panel__unlock label {
  display: grid;
  gap: 4px;
  color: var(--fillio-color-muted);
  font-weight: 650;
}

.fillio-panel__unlock input {
  min-height: 36px;
  width: 100%;
  border: 1px solid var(--fillio-color-border-strong);
  border-radius: var(--fillio-radius-sm);
  background: var(--fillio-color-surface);
  color: var(--fillio-color-text);
  font: inherit;
  padding: 8px;
}

@media (max-width: 480px) {
  .fillio-panel {
    width: 100%;
    max-width: calc(100vw - 24px);
  }
}
`;
