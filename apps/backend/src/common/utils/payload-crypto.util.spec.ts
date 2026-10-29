import { encryptPayload, decryptPayload } from './payload-crypto.util';

describe('Payload Crypto Util', () => {
  beforeAll(() => {
    process.env.API_ENCRYPTION_KEY =
      'test-encryption-key-for-unit-testing-32bytes!';
  });

  it('should encrypt and successfully decrypt an object payload', async () => {
    const testData = {
      userId: 'usr_12345',
      email: 'test@nutricore.vn',
      roles: ['USER'],
      profile: { height: 175, weight: 70 },
    };

    const ciphertext = await encryptPayload(testData);
    expect(typeof ciphertext).toBe('string');
    expect(ciphertext.length).toBeGreaterThan(0);

    const decrypted = await decryptPayload<typeof testData>(ciphertext);
    expect(decrypted).toEqual(testData);
  });

  it('should return empty string for null/undefined payload during encryption', async () => {
    expect(await encryptPayload(null)).toBe('');
    expect(await encryptPayload(undefined)).toBe('');
  });

  it('should return null for empty string decryption', async () => {
    expect(await decryptPayload('')).toBeNull();
  });

  it('should throw an error for malformed encrypted payload', async () => {
    await expect(decryptPayload('invalid-base64-short')).rejects.toThrow();
  });
});
