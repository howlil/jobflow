import { describe, expect, it } from 'vitest';

import { isOpenWorkspaceMessage, OPEN_WORKSPACE } from './workspace-messages';

describe('workspace messages', () => {
  it('accepts only the open-workspace command', () => {
    expect(isOpenWorkspaceMessage({ type: OPEN_WORKSPACE })).toBe(true);
    expect(isOpenWorkspaceMessage({ type: 'fillio:vault/status' })).toBe(false);
    expect(isOpenWorkspaceMessage(null)).toBe(false);
  });
});
