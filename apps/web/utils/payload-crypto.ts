/**
 * End-to-End Payload Crypto Utility for NutriCore Web (Frontend)
 * Uses native Web Crypto API (AES-256-GCM) with random 96-bit IV per message.
 */

const FALLBACK_SECRET = 'NutriCore@AES-256-GCM#PayloadSecurity!2026';

function getEncryptionSecret(): string {
  return (
    (typeof process !== 'undefined' &&
      process.env.NEXT_PUBLIC_API_ENCRYPTION_KEY) ||
    FALLBACK_SECRET
  );
}

let cachedKey: CryptoKey | null = null;

async function getCryptoKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  const cryptoObj =
    typeof window !== 'undefined'
      ? window.crypto
      : (globalThis.crypto as Crypto);

  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error('Web Crypto API is not available in current runtime');
  }

  const enc = new TextEncoder();
  const secretBytes = enc.encode(getEncryptionSecret());
  // Derive deterministic 256-bit key using SHA-256
  const keyHash = await cryptoObj.subtle.digest('SHA-256', secretBytes);

  cachedKey = await cryptoObj.subtle.importKey(
    'raw',
    keyHash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt'],
  );

  return cachedKey;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64');
  }
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, i + chunkSize) as unknown as number[],
    );
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    const buf = Buffer.from(base64, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypt any JavaScript object/primitive into an opaque AES-256-GCM Base64 string.
 */
export async function encryptPayload(data: unknown): Promise<string> {
  if (data === undefined || data === null) {
    return '';
  }

  const cryptoObj =
    typeof window !== 'undefined'
      ? window.crypto
      : (globalThis.crypto as Crypto);

  const key = await getCryptoKey();
  const iv = cryptoObj.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const jsonString = JSON.stringify(data);
  const plaintext = new TextEncoder().encode(jsonString);

  const ciphertextWithTag = await cryptoObj.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext,
  );

  const combined = new Uint8Array(iv.length + ciphertextWithTag.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertextWithTag), iv.length);

  return uint8ArrayToBase64(combined);
}

/**
 * Decrypt an AES-256-GCM Base64 string back into original JSON data.
 */
export async function decryptPayload<T = unknown>(encryptedString: string): Promise<T> {
  if (!encryptedString) {
    return null as unknown as T;
  }

  const cryptoObj =
    typeof window !== 'undefined'
      ? window.crypto
      : (globalThis.crypto as Crypto);

  const key = await getCryptoKey();
  const combined = base64ToUint8Array(encryptedString);

  if (combined.length < 28) {
    throw new Error('Encrypted payload is malformed or too short');
  }

  const iv = new Uint8Array(combined.subarray(0, 12)) as unknown as BufferSource;
  const ciphertextWithTag = new Uint8Array(combined.subarray(12)) as unknown as BufferSource;

  const decryptedBuffer = await cryptoObj.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertextWithTag,
  );

  const jsonString = new TextDecoder().decode(decryptedBuffer);
  return JSON.parse(jsonString) as T;
}
