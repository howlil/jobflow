export const FLOATING_STYLES = `
.jobflow-assistant {
  --jobflow-surface: #ffffff;
  --jobflow-surface-glass: rgba(255, 255, 255, .94);
  --jobflow-surface-subtle: #f7f7f7;
  --jobflow-text: #171717;
  --jobflow-muted: #666666;
  --jobflow-border: #e5e5e5;
  --jobflow-border-strong: #d4d4d4;
  --jobflow-danger: #a61b12;
  --jobflow-danger-bg: #fff2f0;
  --jobflow-shadow-popover: 0 18px 48px rgba(23, 23, 23, .16);
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
  right: 18px;
  bottom: 18px;
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  padding: 0;
  border: 1px solid #0a0a0a;
  border-radius: 999px;
  background: #171717;
  color: #ffffff;
  box-shadow: 0 10px 28px rgba(23, 23, 23, .22);
  cursor: pointer;
  transition: transform 120ms ease, background 120ms ease;
}

.jobflow-launcher:hover {
  background: #000000;
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
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: #171717;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
}

.jobflow-panel {
  position: fixed;
  z-index: 2147483646;
  right: 18px;
  bottom: 78px;
  display: flex;
  width: min(390px, calc(100vw - 36px));
  max-height: min(640px, calc(100vh - 108px));
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--jobflow-border);
  border-radius: 16px;
  background: var(--jobflow-surface-glass);
  box-shadow: var(--jobflow-shadow-popover);
  backdrop-filter: blur(18px);
  animation: jobflow-popup-in 140ms cubic-bezier(.2, .8, .2, 1);
}

.jobflow-panel button,
.jobflow-panel input,
.jobflow-panel textarea,
.jobflow-panel select {
  font: inherit;
}

.jobflow-panel__header {
  display: flex;
  min-height: 58px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--jobflow-border);
  background: rgba(255, 255, 255, .92);
}

.jobflow-panel__header > div {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.jobflow-panel__header strong {
  overflow: hidden;
  font-size: 14px;
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
  letter-spacing: .07em;
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
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--jobflow-muted);
  cursor: pointer;
}

.jobflow-panel__icon-button:hover {
  background: var(--jobflow-surface-subtle);
  color: var(--jobflow-text);
}

.jobflow-panel__tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  padding: 6px;
  border-bottom: 1px solid var(--jobflow-border);
  background: rgba(255, 255, 255, .88);
}

.jobflow-panel__tabs button {
  display: inline-flex;
  min-width: 0;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 8px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--jobflow-muted);
  font-size: 11px;
  font-weight: 680;
  cursor: pointer;
}

.jobflow-panel__tabs button:hover {
  background: var(--jobflow-surface-subtle);
  color: var(--jobflow-text);
}

.jobflow-panel__tabs button.is-active {
  background: #171717;
  color: #ffffff;
}

.jobflow-panel__tabs button > span {
  display: grid;
  min-width: 17px;
  height: 17px;
  place-items: center;
  padding: 0 4px;
  border-radius: 999px;
  background: rgba(127, 127, 127, .14);
  font-size: 9px;
  font-weight: 800;
}

.jobflow-panel__tabs button.is-active > span {
  background: rgba(255, 255, 255, .16);
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

.jobflow-panel__body,
.jobflow-panel__menu {
  display: grid;
}

.jobflow-panel__summary {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 12px 10px;
}

.jobflow-panel__summary > div {
  display: grid;
  gap: 3px;
}

.jobflow-panel__summary strong {
  font-size: 19px;
  font-weight: 720;
  letter-spacing: -.035em;
}

.jobflow-panel__summary span,
.jobflow-panel__summary small {
  color: var(--jobflow-muted);
  font-size: 11px;
}

.jobflow-panel__summary small {
  padding-bottom: 3px;
  text-align: right;
}

.jobflow-panel__fill {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0 12px 12px;
  padding: 10px 12px;
  border: 1px solid var(--jobflow-text);
  border-radius: 9px;
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

.jobflow-panel__section:first-child {
  border-top: 0;
}

.jobflow-panel__section-heading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 12px 6px;
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

.jobflow-panel__menu > div,
.jobflow-panel__menu button {
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 12px;
  border: 0;
  border-top: 1px solid var(--jobflow-border);
  background: transparent;
  color: var(--jobflow-text);
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
  font-size: 11px;
  font-weight: 650;
}

.jobflow-panel__open-profile {
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 12px;
  border: 0;
  border-top: 1px solid var(--jobflow-border);
  background: transparent;
  color: var(--jobflow-text);
  font-weight: 650;
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
  font-weight: 720;
  letter-spacing: -.025em;
}

.jobflow-panel__back {
  display: inline-flex;
  width: max-content;
  min-height: 34px;
  align-items: center;
  gap: 6px;
  margin-left: -8px;
  padding: 7px 8px;
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
  margin: 7px 0 0;
  color: var(--jobflow-muted);
  font-size: 12px;
  line-height: 1.45;
}

.jobflow-panel__review {
  display: grid;
  gap: 8px;
  padding: 10px 0;
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
  padding: 10px 0;
  border-bottom: 1px solid var(--jobflow-border);
  color: var(--jobflow-muted);
}

.jobflow-panel__sensitive-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 10px;
  border: 1px solid color-mix(in srgb, var(--jobflow-danger) 28%, transparent);
  border-radius: 8px;
  background: var(--jobflow-danger-bg);
  color: var(--jobflow-danger);
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
  font-size: 11px;
  font-weight: 650;
}

.jobflow-panel__unlock input,
.jobflow-panel__form input,
.jobflow-panel__form select,
.jobflow-panel__form textarea {
  width: 100%;
  min-height: 36px;
  padding: 7px 10px;
  border: 1px solid var(--jobflow-border-strong);
  border-radius: 8px;
  background: #ffffff;
  color: var(--jobflow-text);
}

.jobflow-panel__form textarea {
  min-height: 72px;
  resize: vertical;
}

.jobflow-panel__status {
  margin: 0 12px 10px;
  padding: 8px 10px;
  border: 1px solid var(--jobflow-border);
  border-radius: 8px;
  background: var(--jobflow-surface-subtle);
  color: var(--jobflow-muted);
  font-size: 12px;
}

.jobflow-panel__detail > .jobflow-panel__status {
  margin: 0;
}

.jobflow-panel__action--primary {
  min-height: 36px;
  padding: 7px 10px;
  border: 1px solid var(--jobflow-text);
  border-radius: 8px;
  background: var(--jobflow-text);
  color: #ffffff;
  font-weight: 700;
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
  font-size: 13px;
}

.jobflow-panel__empty span {
  font-size: 11px;
}

@keyframes jobflow-popup-in {
  from { opacity: .65; transform: translateY(10px) scale(.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
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
    border-radius: 14px;
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
