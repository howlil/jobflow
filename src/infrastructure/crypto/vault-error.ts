export class VaultUnlockError extends Error {
  constructor() {
    super('Vault could not be unlocked.');
    this.name = 'VaultUnlockError';
  }
}
