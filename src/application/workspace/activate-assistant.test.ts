import { describe, expect, it, vi } from 'vitest';

import { activateAssistantForTab } from './activate-assistant';

function ports() {
  return {
    toggleAssistant: vi.fn<(tabId: number) => Promise<boolean>>(),
    injectAssistant: vi.fn<(tabId: number) => Promise<void>>(),
    openWorkspace: vi.fn<() => Promise<void>>(),
  };
}

describe('activateAssistantForTab', () => {
  it('reuses an assistant already present on an auto-activated ATS page', async () => {
    const api = ports();
    api.toggleAssistant.mockResolvedValue(true);

    await expect(activateAssistantForTab(12, api)).resolves.toBe('existing');
    expect(api.injectAssistant).not.toHaveBeenCalled();
    expect(api.openWorkspace).not.toHaveBeenCalled();
  });

  it('injects on explicit toolbar activation when no content runtime exists', async () => {
    const api = ports();
    api.toggleAssistant
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    api.injectAssistant.mockResolvedValue(undefined);

    await expect(activateAssistantForTab(13, api)).resolves.toBe('injected');
    expect(api.injectAssistant).toHaveBeenCalledWith(13);
    expect(api.openWorkspace).not.toHaveBeenCalled();
  });

  it('opens the workspace when the browser rejects injection', async () => {
    const api = ports();
    api.toggleAssistant.mockRejectedValue(new Error('No receiver'));
    api.injectAssistant.mockRejectedValue(new Error('Restricted page'));
    api.openWorkspace.mockResolvedValue(undefined);

    await expect(activateAssistantForTab(14, api)).resolves.toBe('workspace');
    expect(api.openWorkspace).toHaveBeenCalledOnce();
  });

  it('opens the workspace when an injected page is not a supported job form', async () => {
    const api = ports();
    api.toggleAssistant.mockResolvedValue(false);
    api.injectAssistant.mockResolvedValue(undefined);
    api.openWorkspace.mockResolvedValue(undefined);

    await expect(activateAssistantForTab(15, api)).resolves.toBe('workspace');
    expect(api.toggleAssistant).toHaveBeenCalledTimes(2);
    expect(api.openWorkspace).toHaveBeenCalledOnce();
  });

  it('opens the workspace when the action has no tab id', async () => {
    const api = ports();
    api.openWorkspace.mockResolvedValue(undefined);

    await expect(activateAssistantForTab(undefined, api)).resolves.toBe(
      'workspace',
    );
    expect(api.toggleAssistant).not.toHaveBeenCalled();
    expect(api.injectAssistant).not.toHaveBeenCalled();
  });
});
