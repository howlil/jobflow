export const FLOATING_STYLES = `
.fillio-assistant {
  --fillio-surface: #ffffff;
  --fillio-surface-subtle: #f6f6f4;
  --fillio-text: #111111;
  --fillio-muted: #666660;
  --fillio-border: #deded9;
  --fillio-border-strong: #bdbdb6;
  --fillio-danger: #a61b12;
  --fillio-danger-bg: #fff2f0;
  color: var(--fillio-text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
  line-height: 1.45;
  pointer-events: none;
}

.fillio-assistant *,
.fillio-assistant *::before,
.fillio-assistant *::after {
  box-sizing: border-box;
}

.fillio-launcher,
.fillio-panel {
  pointer-events: auto;
}

.fillio-launcher {
  position: fixed;
  z-index: 2147483647;
  top: 50%;
  right: 0;
  display: grid;
  width: 42px;
  height: 56px;
  place-items: center;
  padding: 0;
  border: 1px solid #111111;
  border-right: 0;
  border-radius: 12px 0 0 12px;
  background: #111111;
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(17, 17, 17, .18);
  cursor: pointer;
  transform: translateY(-50%);
  transition: width 120ms ease, background 120ms ease;
}

.fillio-launcher:hover {
  width: 46px;
  background: #242422;
}

.fillio-assistant--open .fillio-launcher {
  display: none;
}

.fillio-launcher:focus-visible,
.fillio-panel button:focus-visible,
.fillio-panel input:focus-visible {
  outline: 2px solid #111111;
  outline-offset: 3px;
}

.fillio-launcher__mark {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -.04em;
}

.fillio-launcher__badge {
  position: absolute;
  top: -6px;
  left: -6px;
  display: grid;
  min-width: 20px;
  height: 20px;
  place-items: center;
  padding: 0 5px;
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
}

.fillio-panel {
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
  border-left: 1px solid var(--fillio-border);
  border-radius: 0;
  background: var(--fillio-surface);
  box-shadow: -18px 0 48px rgba(17, 17, 17, .12);
  scrollbar-width: thin;
  animation: fillio-panel-in 160ms cubic-bezier(.2, .8, .2, 1);
}

.fillio-panel button,
.fillio-panel input {
  font: inherit;
}

.fillio-panel__header {
  position: sticky;
  z-index: 2;
  top: 0;
  display: flex;
  min-height: 72px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px 14px 18px;
  border-bottom: 1px solid var(--fillio-border);
  background: rgba(255, 255, 255, .96);
  backdrop-filter: blur(14px);
}

.fillio-panel__header > div {
  display: grid;
  min-width: 0;
  gap: 1px;
}

.fillio-panel__header strong {
  overflow: hidden;
  font-size: 15px;
  font-weight: 720;
  letter-spacing: -.018em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fillio-panel__eyebrow,
.fillio-panel__section-label,
.fillio-panel__section-heading span {
  color: var(--fillio-muted);
  font-size: 10px;
  font-weight: 740;
  letter-spacing: .075em;
  text-transform: uppercase;
}

.fillio-panel__host {
  overflow: hidden;
  color: var(--fillio-muted);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fillio-panel__icon-button {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--fillio-muted);
  font-size: 20px;
  cursor: pointer;
}

.fillio-panel__icon-button:hover {
  background: var(--fillio-surface-subtle);
  color: var(--fillio-text);
}

.fillio-panel__body {
  display: grid;
}

.fillio-panel__summary {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 18px 16px;
}

.fillio-panel__summary > div {
  display: grid;
  gap: 3px;
}

.fillio-panel__summary strong {
  font-size: 22px;
  font-weight: 720;
  letter-spacing: -.035em;
}

.fillio-panel__summary span,
.fillio-panel__summary small {
  color: var(--fillio-muted);
  font-size: 11px;
}

.fillio-panel__summary small {
  padding-bottom: 3px;
  text-align: right;
}

.fillio-panel__fill {
  min-height: 44px;
  margin: 0 18px 18px;
  padding: 10px 14px;
  border: 1px solid #111111;
  border-radius: 8px;
  background: #111111;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.fillio-panel__fill:hover:not(:disabled),
.fillio-panel__action--primary:hover:not(:disabled) {
  background: #292927;
}

.fillio-panel__fill:disabled {
  border-color: var(--fillio-border);
  background: var(--fillio-surface-subtle);
  color: var(--fillio-muted);
  cursor: not-allowed;
}

.fillio-panel__section {
  display: grid;
  border-top: 1px solid var(--fillio-border);
}

.fillio-panel__section-heading {
  padding: 14px 18px 8px;
}

.fillio-panel__document {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 18px;
}

.fillio-panel__document + .fillio-panel__document {
  border-top: 1px solid var(--fillio-border);
}

.fillio-panel__document-copy {
  display: grid;
  min-width: 0;
  gap: 2px;
}

.fillio-panel__document-copy strong {
  font-size: 12px;
}

.fillio-panel__document-copy span,
.fillio-panel__document-copy small {
  overflow: hidden;
  color: var(--fillio-muted);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fillio-panel__menu {
  display: grid;
}

.fillio-panel__menu button {
  display: flex;
  min-height: 48px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 18px;
  border: 0;
  border-top: 1px solid var(--fillio-border);
  background: var(--fillio-surface);
  color: var(--fillio-text);
  cursor: pointer;
  text-align: left;
}

.fillio-panel__menu button:first-child {
  border-top: 0;
}

.fillio-panel__menu button:hover,
.fillio-panel__open-profile:hover,
.fillio-panel__back:hover,
.fillio-panel__action--secondary:hover {
  background: var(--fillio-surface-subtle);
}

.fillio-panel__menu strong {
  color: var(--fillio-muted);
  font-size: 11px;
  font-weight: 650;
}

.fillio-panel__open-profile {
  display: flex;
  min-height: 50px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 18px;
  border: 0;
  border-top: 1px solid var(--fillio-border);
  background: var(--fillio-surface);
  color: var(--fillio-text);
  font-weight: 650;
  cursor: pointer;
  text-align: left;
}

.fillio-panel__detail {
  display: grid;
  gap: 12px;
  padding: 16px 18px 24px;
}

.fillio-panel__detail h2 {
  margin: 3px 0 0;
  font-size: 18px;
  font-weight: 720;
  letter-spacing: -.025em;
}

.fillio-panel__back {
  width: max-content;
  min-height: 34px;
  margin-left: -8px;
  padding: 6px 8px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--fillio-muted);
  cursor: pointer;
}

.fillio-panel__section-label {
  margin: 0;
}

.fillio-panel__review {
  display: grid;
  gap: 9px;
  padding: 12px 0;
  border-top: 1px solid var(--fillio-border);
}

.fillio-panel__review > strong {
  font-size: 12px;
}

.fillio-panel__review-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.fillio-panel__action,
.fillio-panel__action--secondary {
  min-height: 36px;
  border-radius: 7px;
  cursor: pointer;
}

.fillio-panel__action--secondary {
  padding: 6px 9px;
  border: 1px solid var(--fillio-border-strong);
  background: var(--fillio-surface);
  color: var(--fillio-text);
  font-size: 11px;
  font-weight: 650;
}

.fillio-panel__sensitive-list {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--fillio-border);
  list-style: none;
}

.fillio-panel__sensitive-list li {
  padding: 10px 0;
  border-bottom: 1px solid var(--fillio-border);
  color: var(--fillio-muted);
}

.fillio-panel__sensitive-error {
  margin: 0;
  padding: 10px;
  border: 1px solid color-mix(in srgb, var(--fillio-danger) 28%, transparent);
  border-radius: 7px;
  background: var(--fillio-danger-bg);
  color: var(--fillio-danger);
}

.fillio-panel__unlock {
  display: grid;
  gap: 8px;
}

.fillio-panel__unlock label {
  display: grid;
  gap: 6px;
  color: var(--fillio-muted);
  font-size: 11px;
  font-weight: 650;
}

.fillio-panel__unlock input {
  width: 100%;
  min-height: 42px;
  padding: 9px 10px;
  border: 1px solid var(--fillio-border-strong);
  border-radius: 7px;
  background: var(--fillio-surface);
  color: var(--fillio-text);
}

.fillio-panel__action--primary {
  width: 100%;
  min-height: 42px;
  padding: 9px 12px;
  border: 1px solid #111111;
  border-radius: 7px;
  background: #111111;
  color: #ffffff;
  font-weight: 700;
}

@keyframes fillio-panel-in {
  from { opacity: .7; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}

@media (max-width: 560px) {
  .fillio-panel {
    width: 100vw;
  }

  .fillio-launcher {
    width: 40px;
    height: 52px;
    border-radius: 11px 0 0 11px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fillio-launcher,
  .fillio-panel {
    animation: none;
    transition: none;
  }
}
`;
