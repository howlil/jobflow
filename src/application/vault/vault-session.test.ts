import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { VaultLockedError, VaultSession } from './vault-session';

function key(): CryptoKey {
  return { type: 'secret' } as CryptoKey;
}

describe('VaultSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-13T16:45:00.000Z'));
  });

  afterEach(() => vi.useRealTimers());

  it('starts locked and rejects key access', () => {
    const session = new VaultSession();

    expect(session.status()).toEqual({ unlocked: false, expiresAt: null });
    expect(() => session.requireKey()).toThrow(VaultLockedError);
  });

  it('keeps the key only in memory and auto-locks after 30 minutes idle', () => {
    const session = new VaultSession();
    const vaultKey = key();
    session.unlock(vaultKey);

    expect(session.requireKey()).toBe(vaultKey);
    expect(session.status().unlocked).toBe(true);

    vi.advanceTimersByTime(29 * 60 * 1000 + 59 * 1000);
    expect(session.status().unlocked).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(session.status()).toEqual({ unlocked: false, expiresAt: null });
    expect(() => session.requireKey()).toThrow(VaultLockedError);
  });

  it('refreshes inactivity only on explicit vault activity', () => {
    const session = new VaultSession();
    session.unlock(key());

    vi.advanceTimersByTime(20 * 60 * 1000);
    session.touch();
    vi.advanceTimersByTime(20 * 60 * 1000);
    expect(session.status().unlocked).toBe(true);
    vi.advanceTimersByTime(10 * 60 * 1000);
    expect(session.status().unlocked).toBe(false);
  });

  it('locks immediately on explicit lock', () => {
    const session = new VaultSession();
    session.unlock(key());

    session.lock();

    expect(session.status()).toEqual({ unlocked: false, expiresAt: null });
  });
});
