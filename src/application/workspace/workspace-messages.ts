export const OPEN_WORKSPACE = 'jobflow:workspace/open' as const;

export type OpenWorkspaceMessage = {
  type: typeof OPEN_WORKSPACE;
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
