export type AssistantActivationResult =
  | 'existing'
  | 'injected'
  | 'workspace';

export type AssistantActivationPorts = {
  toggleAssistant(tabId: number): Promise<boolean>;
  injectAssistant(tabId: number): Promise<void>;
  openWorkspace(): Promise<void>;
};

async function safeToggle(
  tabId: number,
  toggleAssistant: AssistantActivationPorts['toggleAssistant'],
): Promise<boolean> {
  try {
    return await toggleAssistant(tabId);
  } catch {
    return false;
  }
}

export async function activateAssistantForTab(
  tabId: number | undefined,
  ports: AssistantActivationPorts,
): Promise<AssistantActivationResult> {
  if (tabId === undefined) {
    await ports.openWorkspace();
    return 'workspace';
  }

  if (await safeToggle(tabId, ports.toggleAssistant)) return 'existing';

  try {
    await ports.injectAssistant(tabId);
  } catch {
    await ports.openWorkspace();
    return 'workspace';
  }

  if (await safeToggle(tabId, ports.toggleAssistant)) return 'injected';

  await ports.openWorkspace();
  return 'workspace';
}
