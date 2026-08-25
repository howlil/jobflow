export const FLOATING_STYLES = `
.fillio-assistant {
  --fillio-bg: #f7f7f5;
  --fillio-surface: #ffffff;
  --fillio-surface-subtle: #fcfcfb;
  --fillio-text: #111111;
  --fillio-muted: #5c5c58;
  --fillio-border: #e2e2de;
  --fillio-border-strong: #c7c7c1;
  --fillio-accent: #5b4ff7;
  --fillio-danger: #b42318;
  --fillio-danger-bg: #fff0ee;
  position: relative;
  display: grid;
  justify-items: end;
  gap: 10px;
  color: var(--fillio-text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
  line-height: 1.45;
}

.fillio-assistant *,
.fillio-assistant *::before,
.fillio-assistant *::after {
  box-sizing: border-box;
}

.fillio-launcher {
  position: relative;
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  padding: 0;
  border: 1px solid rgba(255,255,255,.16);
  border-radius: 14px;
  background: #111111;
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(17,17,17,.18);
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.fillio-launcher:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(17,17,17,.22);
}

.fillio-launcher:focus-visible,
.fillio-panel button:focus-visible,
.fillio-panel input:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--fillio-accent) 30%, transparent);
  outline-offset: 3px;
}

.fillio-launcher__mark {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -.03em;
}

.fillio-launcher__badge {
  position: absolute;
  top: -5px;
  right: -5px;
  display: grid;
  min-width: 20px;
  height: 20px;
  place-items: center;
  padding: 0 5px;
  border: 2px solid #ffffff;
  border-radius: 999px;
  background: var(--fillio-accent);
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
}

.fillio-panel {
  width: min(390px, calc(100vw - 24px));
  max-height: min(680px, 76vh);
  overflow: auto;
  overscroll-behavior: contain;
  border: 1px solid var(--fillio-border);
  border-radius: 18px;
  background: var(--fillio-surface);
  box-shadow: 0 20px 60px rgba(17,17,17,.20);
  scrollbar-width: thin;
  animation: fillio-panel-in 140ms ease-out;
}

.fillio-panel__header {
  position: sticky;
  z-index: 2;
  top: 0;
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--fillio-border);
  background: color-mix(in srgb, var(--fillio-surface) 95%, transparent);
  backdrop-filter: blur(12px);
}

.fillio-panel__header > div {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.fillio-panel__header strong {
  overflow: hidden;
  font-size: 15px;
  font-weight: 720;
  letter-spacing: -.015em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fillio-panel__eyebrow,
.fillio-panel__section-label {
  color: var(--fillio-muted);
  font-size: 10px;
  font-weight: 760;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.fillio-panel__icon-button {
  display: grid;
  width: 34px;
  min-height: 34px;
  place-items: center;
  padding: 0;
  border: 1px solid var(--fillio-border);
  border-radius: 10px;
  background: var(--fillio-surface);
  color: var(--fillio-text);
  font-size: 18px;
  cursor: pointer;
}

.fillio-panel__summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-bottom: 1px solid var(--fillio-border);
}

.fillio-panel__summary span {
  display: grid;
  gap: 2px;
  padding: 12px 8px;
  border-right: 1px solid var(--fillio-border);
  color: var(--fillio-muted);
  font-size: 10px;
  text-align: center;
}

.fillio-panel__summary span:last-child {
  border-right: 0;
}

.fillio-panel__summary strong {
  color: var(--fillio-text);
  font-size: 15px;
  font-weight: 760;
}

.fillio-panel button {
  font: inherit;
}

.fillio-panel__fill,
.fillio-panel__action,
.fillio-panel__open-profile,
.fillio-panel__back,
.fillio-panel__action--secondary {
  min-height: 40px;
  border-radius: 9px;
  cursor: pointer;
}

.fillio-panel__fill {
  width: calc(100% - 32px);
  margin: 16px;
  padding: 10px 14px;
  border: 1px solid #111111;
  background: #111111;
  color: #ffffff;
  font-weight: 700;
}

.fillio-panel__fill:hover:not(:disabled),
.fillio-panel__action--primary:hover:not(:disabled) {
  background: #292927;
}

.fillio-panel__fill:disabled {
  cursor: not-allowed;
  opacity: .45;
}

.fillio-panel__documents {
  display: grid;
  gap: 0;
  padding: 0 16px 8px;
}

.fillio-panel__section-label {
  margin: 6px 0 8px;
}

.fillio-panel__document {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid var(--fillio-border);
}

.fillio-panel__document-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
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
  border-top: 1px solid var(--fillio-border);
}

.fillio-panel__menu button {
  display: flex;
  min-height: 46px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
  border: 0;
  border-bottom: 1px solid var(--fillio-border);
  background: var(--fillio-surface);
  color: var(--fillio-text);
  cursor: pointer;
  text-align: left;
}

.fillio-panel__menu button:hover,
.fillio-panel__open-profile:hover,
.fillio-panel__back:hover,
.fillio-panel__action--secondary:hover {
  background: var(--fillio-bg);
}

.fillio-panel__menu strong {
  color: var(--fillio-muted);
  font-size: 11px;
}

.fillio-panel__open-profile,
.fillio-panel__back {
  width: 100%;
  padding: 10px 16px;
  border: 0;
  background: var(--fillio-surface);
  color: var(--fillio-muted);
  font-weight: 650;
  text-align: left;
}

.fillio-panel__detail {
  display: grid;
  gap: 12px;
  padding: 14px 16px 16px;
}

.fillio-panel__detail h2 {
  margin: 3px 0 0;
  font-size: 17px;
  letter-spacing: -.02em;
}

.fillio-panel__back {
  width: max-content;
  min-height: 34px;
  margin-left: -8px;
  padding: 6px 8px;
  border-radius: 8px;
}

.fillio-panel__review {
  padding: 12px;
  border: 1px solid var(--fillio-border);
  border-radius: 10px;
  background: var(--fillio-surface-subtle);
}

.fillio-panel__review > strong {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
}

.fillio-panel__review-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.fillio-panel__action--secondary {
  min-height: 34px;
  padding: 6px 9px;
  border: 1px solid var(--fillio-border-strong);
  background: var(--fillio-surface);
  color: var(--fillio-text);
  font-size: 11px;
  font-weight: 650;
}

.fillio-panel__sensitive-list {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.fillio-panel__sensitive-list li {
  padding: 9px 10px;
  border: 1px solid var(--fillio-border);
  border-radius: 8px;
  background: var(--fillio-surface-subtle);
  color: var(--fillio-muted);
}

.fillio-panel__sensitive-error {
  margin: 0;
  padding: 9px 10px;
  border: 1px solid color-mix(in srgb, var(--fillio-danger) 30%, transparent);
  border-radius: 8px;
  background: var(--fillio-danger-bg);
  color: var(--fillio-danger);
}

.fillio-panel__unlock {
  display: grid;
  gap: 8px;
}

.fillio-panel__unlock label {
  display: grid;
  gap: 5px;
  color: var(--fillio-muted);
  font-size: 11px;
  font-weight: 650;
}

.fillio-panel__unlock input {
  min-height: 40px;
  width: 100%;
  border: 1px solid var(--fillio-border-strong);
  border-radius: 9px;
  background: var(--fillio-surface);
  color: var(--fillio-text);
  font: inherit;
  padding: 9px 10px;
}

.fillio-panel__action--primary {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #111111;
  background: #111111;
  color: #ffffff;
  font-weight: 700;
}

@keyframes fillio-panel-in {
  from { opacity: 0; transform: translateY(6px) scale(.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 560px) {
  .fillio-assistant {
    width: calc(100vw - 24px);
  }

  .fillio-panel {
    width: 100%;
    max-height: min(72vh, 620px);
    border-radius: 18px;
  }

  .fillio-launcher {
    width: 44px;
    height: 44px;
    border-radius: 13px;
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
