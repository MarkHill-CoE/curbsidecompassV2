/**
 * Cryptographic Reversible AES-256-GCM Postal Code Encryption & Decryption Module
 * Utilizes native Web Crypto API (crypto.subtle) with PBKDF2 key derivation.
 */

// Default municipal encryption secret (can be overridden via VITE_POSTAL_ENCRYPTION_SECRET)
export const DEFAULT_MUNICIPAL_SECRET =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_POSTAL_ENCRYPTION_SECRET) ||
  'Edmonton_Curbside_Compass_2026_SecureKey!';

/**
 * Converts Uint8Array to Hex string
 */
function toHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts Hex string to Uint8Array
 */
function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Derives an AES-GCM 256-bit key from a secret passphrase and salt using PBKDF2 with SHA-256
 */
async function deriveAesKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a full postal code string using AES-256-GCM.
 * Returns a self-contained string format: `aes256gcm:<salt_hex>:<iv_hex>:<ciphertext_hex>`
 */
export async function encryptPostalCode(
  rawPostalCode: string,
  secretPassphrase: string = DEFAULT_MUNICIPAL_SECRET
): Promise<string> {
  if (!rawPostalCode || typeof rawPostalCode !== 'string') {
    return '';
  }

  const trimmed = rawPostalCode.trim().toUpperCase();
  if (!trimmed || trimmed === 'OPT_OUT') {
    return '';
  }

  // Generate 16 bytes salt and 12 bytes IV
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const key = await deriveAesKey(secretPassphrase, salt);
  const enc = new TextEncoder();
  const plaintextBytes = enc.encode(trimmed);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource
    },
    key,
    plaintextBytes
  );

  const ciphertextBytes = new Uint8Array(ciphertextBuffer);

  return `aes256gcm:${toHex(salt)}:${toHex(iv)}:${toHex(ciphertextBytes)}`;
}

/**
 * Decrypts an encrypted postal code bundle using the secret administrative passphrase.
 * Throws an error if the passphrase is incorrect or bundle is corrupted.
 */
export async function decryptPostalCode(
  encryptedBundle: string,
  secretPassphrase: string = DEFAULT_MUNICIPAL_SECRET
): Promise<string> {
  if (!encryptedBundle || !encryptedBundle.startsWith('aes256gcm:')) {
    throw new Error('Invalid encryption bundle format. Must start with aes256gcm:');
  }

  const parts = encryptedBundle.split(':');
  if (parts.length !== 4) {
    throw new Error('Malformed encryption bundle. Expected 4 segments (aes256gcm:salt:iv:ciphertext).');
  }

  const [, saltHex, ivHex, ciphertextHex] = parts;
  const salt = fromHex(saltHex);
  const iv = fromHex(ivHex);
  const ciphertext = fromHex(ciphertextHex);

  const key = await deriveAesKey(secretPassphrase, salt);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource
      },
      key,
      ciphertext as BufferSource
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch {
    throw new Error('Decryption failed. Please check that the administrative secret key is correct.');
  }
}

/**
 * Tests encryption & decryption roundtrip for verification
 */
export async function testPostalEncryptionRoundtrip(testPostal: string = 'T6E 2A1'): Promise<boolean> {
  try {
    const encrypted = await encryptPostalCode(testPostal);
    const decrypted = await decryptPostalCode(encrypted);
    return decrypted === testPostal.toUpperCase();
  } catch (err) {
    console.error('Postal encryption roundtrip test failed:', err);
    return false;
  }
}
