export const DEFAULT_VAULT_IDLE_MS = 30 * 60 * 1000;

export class VaultLockedError extends Error {
  constructor() {
    super('Vault is locked.');
    this.name = 'VaultLockedError';
  }
}

export type VaultSessionStatus = {
  unlocked: boolean;
  expiresAt: number | null;
};

export class VaultSession<T = unknown> {
  private value: T | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private expiresAt: number | null = null;

  constructor(private readonly idleMs = DEFAULT_VAULT_IDLE_MS) {}

  unlock(value: T): void {
    this.value = value;
    this.touch();
  }

  requireKey(): T {
    if (this.value === null) throw new VaultLockedError();
    const value = this.value;
    this.touch();
    return value;
  }

  touch(): void {
    if (this.value === null) return;
    if (this.timer !== null) clearTimeout(this.timer);
    this.expiresAt = Date.now() + this.idleMs;
    this.timer = setTimeout(() => this.lock(), this.idleMs);
  }

  lock(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
    this.value = null;
    this.expiresAt = null;
  }

  status(): VaultSessionStatus {
    return {
      unlocked: this.value !== null,
      expiresAt: this.expiresAt,
    };
  }
}
