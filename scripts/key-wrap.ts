/**
 * File DEK wrap formats stored in FileMetadata.encryptedKey
 *
 * plain   — base64(32-byte AES key)  [legacy MVP — server/DB can read]
 * bw1.…   — AES-GCM(vaultKey, DEK)   [wallet-derived vault key]
 *
 * Share links always carry the *raw* DEK in the URL fragment (capability).
 * Never put a bw1. blob into a share fragment.
 */

const PREFIX_V1 = 'bw1.';

export type KeyEncoding = 'plain' | 'wallet-v1';

export function detectKeyEncoding(stored: string): KeyEncoding {
  if (stored.startsWith(PREFIX_V1)) return 'wallet-v1';
  return 'plain';
}

export function isWrappedKey(stored: string): boolean {
  return detectKeyEncoding(stored) === 'wallet-v1';
}

function bytesToB64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Normalize wallet signature strings (hex / base64 / 0x-hex). */
export function signatureToBytes(sig: string): Uint8Array {
  const s = sig.trim();
  if (!s) throw new Error('Empty signature');

  // 0x-hex or bare hex (ed25519 sig = 64 bytes → 128 hex chars; may be longer w/ scheme)
  const hex = s.startsWith('0x') || s.startsWith('0X') ? s.slice(2) : s;
  if (/^[0-9a-fA-F]+$/.test(hex) && hex.length % 2 === 0 && hex.length >= 64) {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) {
      out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return out;
  }

  // base64 / base64url
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    return b64ToBytes(b64 + pad);
  } catch {
    // last resort: utf-8 of the string
    return new TextEncoder().encode(s);
  }
}

/**
 * Derive a 256-bit AES-GCM key from wallet address + signMessage signature.
 * Same address + same signature bytes → same vault key.
 */
export async function deriveVaultKey(
  ownerAddress: string,
  signature: string
): Promise<CryptoKey> {
  const addr = ownerAddress.trim().toLowerCase();
  const sigBytes = signatureToBytes(signature);
  const enc = new TextEncoder();
  const addrBytes = enc.encode(addr);
  const material = new Uint8Array(9 + addrBytes.length + sigBytes.length);
  material.set(enc.encode('blobbedv1'));
  material.set(addrBytes, 9);
  material.set(sigBytes, 9 + addrBytes.length);

  const digest = await crypto.subtle.digest('SHA-256', material);
  return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
}

/** Wrap raw 32-byte file DEK → storage string */
export async function wrapFileKey(
  rawKey: Uint8Array,
  vaultKey: CryptoKey
): Promise<string> {
  if (rawKey.length !== 32) {
    throw new Error('File key must be 32 bytes');
  }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const dekBuf = rawKey.buffer.slice(
    rawKey.byteOffset,
    rawKey.byteOffset + rawKey.byteLength
  ) as ArrayBuffer;
  const ct = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      vaultKey,
      dekBuf
    )
  );
  const packed = new Uint8Array(iv.length + ct.length);
  packed.set(iv);
  packed.set(ct, iv.length);
  return PREFIX_V1 + bytesToB64(packed);
}

/** Unwrap storage string → raw 32-byte DEK (handles legacy plain) */
export async function unwrapFileKey(
  stored: string,
  vaultKey: CryptoKey | null
): Promise<Uint8Array> {
  if (!stored) throw new Error('Missing file key');

  if (!isWrappedKey(stored)) {
    const raw = b64ToBytes(stored);
    if (raw.length !== 32) {
      throw new Error('Invalid plain file key length');
    }
    return raw;
  }

  if (!vaultKey) {
    throw new Error('Vault locked — sign with wallet to unlock keys');
  }

  const packed = b64ToBytes(stored.slice(PREFIX_V1.length));
  if (packed.length < 12 + 16) {
    throw new Error('Invalid wrapped key');
  }
  const iv = packed.slice(0, 12);
  const ct = packed.slice(12);
  try {
    const plain = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) as ArrayBuffer,
      },
      vaultKey,
      ct.buffer.slice(ct.byteOffset, ct.byteOffset + ct.byteLength) as ArrayBuffer
    );
    const raw = new Uint8Array(plain);
    if (raw.length !== 32) throw new Error('Unwrapped key wrong size');
    return raw;
  } catch {
    throw new Error('Cannot unwrap key — wrong wallet or corrupted wrap');
  }
}

/** plain base64 DEK → for share fragments / decrypt */
export function rawKeyToBase64(raw: Uint8Array): string {
  return bytesToB64(raw);
}

export function base64ToRawKey(b64: string): Uint8Array {
  const raw = b64ToBytes(b64);
  if (raw.length !== 32) throw new Error('Invalid key length');
  return raw;
}
