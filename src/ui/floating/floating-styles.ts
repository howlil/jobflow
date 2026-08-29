export const FLOATING_STYLES = `
.jobflow-assistant {
  --jobflow-surface: #ffffff;
  --jobflow-surface-subtle: #f7f7f7;
  --jobflow-text: #171717;
  --jobflow-muted: #525252;
  --jobflow-border: #e5e5e5;
  --jobflow-border-strong: #d4d4d4;
  --jobflow-danger: #a61b12;
  --jobflow-danger-bg: #fff2f0;
  color: var(--jobflow-text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
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
  border: 1px solid var(--jobflow-text);
  border-right: 0;
  border-radius: 12px 0 0 12px;
  background: var(--jobflow-text);
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(23, 23, 23, .18);
  cursor: pointer;
  transform: translateY(-50%);
  transition: width 120ms ease, background 120ms ease;
}

.jobflow-launcher:hover {
  width: 46px;
  background: #000000;
}

.jobflow-assistant--open .jobflow-launcher {
  display: none;
}

.jobflow-launcher:focus-visible,
.jobflow-panel button:focus-visible,
.jobflow-panel input:focus-visible {
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
  top: -6px;
  left: -6px;
  display: grid;
  min-width: 20px;
  height: 20px;
  place-items: center;
  padding: 0 4px;
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: var(--jobflow-text);
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
}

.jobflow-panel {
  position: fixed;
  z-index: 2147483647;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(392px, 100vw);
  height: 100dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  border: 0;
  border-left: 1px solid var(--jobflow-border);
  border-radius: 0;
  background: var(--jobflow-surface);
  box-shadow: -16px 0 48px rgba(23, 23, 23, .12);
  scrollbar-width: thin;
  animation: jobflow-panel-in 160ms cubic-bezier(.2, .8, .2, 1);
}

.jobflow-panel button,
.jobflow-panel input {
  font: inherit;
}

.jobflow-panel__header {
  position: sticky;
  z-index: 2;
  top: 0;
  display: flex;
  min-height: 72px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid var(--jobflow-border);
  background: rgba(255, 255, 255, .96);
  backdrop-filter: blur(14px);
}

.jobflow-panel__header > div {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.jobflow-panel__header strong {
  overflow: hidden;
  font-size: 15px;
  font-weight: 720;
  letter-spacing: -.018em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jobflow-panel__eyebrow,
.jobflow-panel__section-label,
.jobflow-panel__section-heading span {
  color: var(--jobflow-muted);
  font-size: 10px;
  font-weight: 740;
  letter-spacing: .075em;
  text-transform: uppercase;
}

.jobflow-panel__host {
  overflow: hidden;
  color: var(--jobflow-muted);
  font-size: 11px;
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
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--jobflow-muted);
  font-size: 20px;
  cursor: pointer;
}

.jobflow-panel__icon-button:hover {
  background: var(--jobflow-surface-subtle);
  color: var(--jobflow-text);
}

.jobflow-panel svg {
  flex: 0 0 auto;
}

.jobflow-panel__body {
  display: grid;
}

.jobflow-panel__summary {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 16px 16px;
}

.jobflow-panel__summary > div {
  display: grid;
  gap: 4px;
}

.jobflow-panel__summary strong {
  font-size: 22px;
  font-weight: 720;
  letter-spacing: -.035em;
}

.jobflow-panel__summary span,
.jobflow-panel__summary small {
  color: var(--jobflow-muted);
  font-size: 11px;
}

.jobflow-panel__summary small {
  padding-bottom: 4px;
  text-align: right;
}

.jobflow-panel__fill {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 16px 16px;
  padding: 12px 16px;
  border: 1px solid var(--jobflow-text);
  border-radius: 8px;
  background: var(--jobflow-text);
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.jobflow-panel__fill:hover:not(:disabled),
.jobflow-panel__action--primary:hover:not(:disabled) {
  background: #000000;
}

.jobflow-panel__fill:disabled {
  border-color: var(--jobflow-border);
  background: var(--jobflow-surface-subtle);
  color: var(--jobflow-muted);
  cursor: not-allowed;
}

.jobflow-panel__section {
  display: grid;
  border-top: 1px solid var(--jobflow-border);
}

.jobflow-panel__section-heading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 16px 8px;
}

.jobflow-panel__document {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
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
  font-size: 12px;
}

.jobflow-panel__document-copy span,
.jobflow-panel__document-copy small {
  overflow: hidden;
  color: var(--jobflow-muted);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jobflow-panel__menu {
  display: grid;
}

.jobflow-panel__menu button {
  display: flex;
  min-height: 48px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
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
  background: var(--jobflow-surface-subtle);
}

.jobflow-panel__menu strong {
  color: var(--jobflow-muted);
  font-size: 11px;
  font-weight: 650;
}

.jobflow-panel__open-profile {
  display: flex;
  min-height: 48px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
  border: 0;
  border-top: 1px solid var(--jobflow-border);
  background: var(--jobflow-surface);
  color: var(--jobflow-text);
  font-weight: 650;
  cursor: pointer;
  text-align: left;
}

.jobflow-panel__detail {
  display: grid;
  gap: 16px;
  padding: 16px 16px 24px;
}

.jobflow-panel__detail h2 {
  margin: 4px 0 0;
  font-size: 18px;
  font-weight: 720;
  letter-spacing: -.025em;
}

.jobflow-panel__back {
  display: inline-flex;
  width: max-content;
  min-height: 36px;
  align-items: center;
  gap: 8px;
  margin-left: -8px;
  padding: 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--jobflow-muted);
  cursor: pointer;
}

.jobflow-panel__section-label {
  margin: 0;
}

.jobflow-panel__helper {
  margin: 8px 0 0;
  color: var(--jobflow-muted);
  font-size: 12px;
  line-height: 1.45;
}

.jobflow-panel__review {
  display: grid;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid var(--jobflow-border);
}

.jobflow-panel__review > strong {
  font-size: 12px;
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
  border-radius: 8px;
  cursor: pointer;
}

.jobflow-panel__action--secondary {
  padding: 8px 12px;
  border: 1px solid var(--jobflow-border-strong);
  background: var(--jobflow-surface);
  color: var(--jobflow-text);
  font-size: 11px;
  font-weight: 650;
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
  padding: 12px;
  border: 1px solid color-mix(in srgb, var(--jobflow-danger) 28%, transparent);
  border-radius: 8px;
  background: var(--jobflow-danger-bg);
  color: var(--jobflow-danger);
}

.jobflow-panel__unlock {
  display: grid;
  gap: 8px;
}

.jobflow-panel__unlock label {
  display: grid;
  gap: 8px;
  color: var(--jobflow-muted);
  font-size: 11px;
  font-weight: 650;
}

.jobflow-panel__unlock input {
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid var(--jobflow-border-strong);
  border-radius: 8px;
  background: var(--jobflow-surface);
  color: var(--jobflow-text);
}

.jobflow-panel__action--primary {
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid var(--jobflow-text);
  border-radius: 8px;
  background: var(--jobflow-text);
  color: #ffffff;
  font-weight: 700;
}

@keyframes jobflow-panel-in {
  from { opacity: .7; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}

@media (max-width: 560px) {
  .jobflow-panel {
    left: 0;
    width: auto;
  }

  .jobflow-launcher {
    width: 40px;
    height: 52px;
    border-radius: 11px 0 0 11px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .jobflow-launcher,
  .jobflow-panel {
    animation: none;
    transition: none;
  }
}
`;
