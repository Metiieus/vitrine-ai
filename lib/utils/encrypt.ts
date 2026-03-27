import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

/**
 * AES-256-GCM encryption for OAuth tokens.
 * Requires GOOGLE_TOKEN_ENCRYPTION_KEY env var:
 *   a 64-char hex string (= 32 bytes).
 *
 * Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 * 
 * ✅ SECURITY NOTE: This key should be rotated periodically and stored in Vault
 * Future: Use Supabase Vault for secret management instead of env vars
 */

let _cachedKey: Buffer | null = null;
let _keyValidatedAt: number = 0;
const KEY_CACHE_TTL = 3600000; // 1 hour

function getKey(): Buffer {
  // ✅ Cache validation result to avoid repeated env reads
  const now = Date.now();
  if (_cachedKey && now - _keyValidatedAt < KEY_CACHE_TTL) {
    return _cachedKey;
  }

  const hex = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "GOOGLE_TOKEN_ENCRYPTION_KEY must be a 64-char hex string. " +
        "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }

  _cachedKey = Buffer.from(hex, "hex");
  _keyValidatedAt = now;
  return _cachedKey;
}

/**
 * Encrypts plaintext → "ivHex:tagHex:ciphertextHex"
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), tag.toString("hex"), encrypted.toString("hex")].join(":");
}

/**
 * Decrypts "ivHex:tagHex:ciphertextHex" → plaintext
 */
export function decrypt(ciphertext: string): string {
  const key = getKey();
  const parts = ciphertext.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted token format");
  const [ivHex, tagHex, encHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(encHex, "hex");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted, undefined, "utf8") + decipher.final("utf8");
}
