import { describe, it, expect, beforeAll } from 'vitest';

describe('Web Payload Crypto', () => {
  let encryptPayload: (data: unknown) => Promise<string>;
  let decryptPayload: <T = unknown>(encryptedString: string) => Promise<T>;

  beforeAll(async () => {
    process.env.NEXT_PUBLIC_API_ENCRYPTION_KEY = 'test-web-encryption-key-for-vitest-32bytes!';
    const mod = await import('./payload-crypto');
    encryptPayload = mod.encryptPayload;
    decryptPayload = mod.decryptPayload;
  });

  it('should encrypt and decrypt data preserving types and structure', async () => {
    const original = {
      message: 'Hello NutriCore',
      calories: 2150,
      items: ['cơm trắng', 'ức gà'],
      isSuccess: true,
    };

    const encrypted = await encryptPayload(original);
    expect(typeof encrypted).toBe('string');
    expect(encrypted.length).toBeGreaterThan(0);

    const decrypted = await decryptPayload<typeof original>(encrypted);
    expect(decrypted).toEqual(original);
  });

  it('should return empty string for null or undefined data', async () => {
    expect(await encryptPayload(null)).toBe('');
    expect(await encryptPayload(undefined)).toBe('');
  });

  it('should return null for empty encrypted string', async () => {
    expect(await decryptPayload('')).toBeNull();
  });
});

