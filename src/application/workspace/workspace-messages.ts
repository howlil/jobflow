export const OPEN_WORKSPACE = 'jobflow:workspace/open' as const;
export const TOGGLE_ASSISTANT = 'jobflow:assistant/toggle' as const;

export type OpenWorkspaceMessage = {
  type: typeof OPEN_WORKSPACE;
};

export type ToggleAssistantMessage = {
  type: typeof TOGGLE_ASSISTANT;
};

export function isOpenWorkspaceMessage(
  message: unknown,
): message is OpenWorkspaceMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    message.type === OPEN_WORKSPACE
  );
}

export function isToggleAssistantMessage(
  message: unknown,
): message is ToggleAssistantMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    message.type === TOGGLE_ASSISTANT
  );
}
