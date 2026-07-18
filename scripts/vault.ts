/**
 * Session vault: one wallet signMessage unlocks a derived AES key used to
 * wrap/unwrap file DEKs at rest (Neon / localStorage).
 *
 * - Vault key lives only in memory + sessionStorage for this tab session
 * - Cleared on disconnect
 * - Share links still use raw DEKs in #fragment (never server-side)
 */

import { signMessage } from './aptos-client';
import {
  deriveVaultKey,
  isWrappedKey,
  unwrapFileKey,
  wrapFileKey,
  rawKeyToBase64,
  base64ToRawKey,
  type KeyEncoding,
  detectKeyEncoding,
} from './key-wrap';
import type { FileMetadata, WalletAccount } from './types';
import { addFile, listAllFiles } from './library-store';

export const VAULT_MESSAGE =
  'Blobbed library encryption v1\n\nSign to derive a key that wraps your file keys at rest.\nThis does not move funds.';
/** Fixed nonce → deterministic signature for key derivation (same wallet). */
export const VAULT_NONCE = 'blobbed-vault-v1';

const SESSION_PREFIX = 'blobbed_vault_sig_v1_';

type VaultState = {
  address: string;
  key: CryptoKey;
};

let mem: VaultState | null = null;

function sessionKey(address: string): string {
  return SESSION_PREFIX + address.trim().toLowerCase();
}

export function isVaultUnlocked(address?: string): boolean {
  if (!mem) return false;
  if (!address) return true;
  return mem.address === address.trim().toLowerCase();
}

export function getVaultKey(): CryptoKey | null {
  return mem?.key ?? null;
}

export function lockVault(): void {
  mem = null;
}

/** Drop session cache for address (and clear all vault sigs on full logout). */
export function clearVaultSession(address?: string): void {
  mem = null;
  if (address) {
    try {
      sessionStorage.removeItem(sessionKey(address));
    } catch {
      /* */
    }
    return;
  }
  try {
    const kill: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(SESSION_PREFIX)) kill.push(k);
    }
    for (const k of kill) sessionStorage.removeItem(k);
  } catch {
    /* */
  }
}

async function unlockFromSignature(
  address: string,
  signature: string
): Promise<CryptoKey> {
  const key = await deriveVaultKey(address, signature);
  mem = { address: address.trim().toLowerCase(), key };
  try {
    sessionStorage.setItem(sessionKey(address), signature);
  } catch {
    /* private mode */
  }
  return key;
}

/**
 * Unlock vault for owner. Reuses session signature when possible.
 * May prompt wallet signMessage once per browser tab session.
 */
export async function ensureVaultUnlocked(
  wallet: WalletAccount,
  opts?: { forcePrompt?: boolean }
): Promise<CryptoKey> {
  const address = wallet.address;
  const addr = address.trim().toLowerCase();

  if (!opts?.forcePrompt && mem && mem.address === addr) {
    return mem.key;
  }

  if (!opts?.forcePrompt) {
    try {
      const cached = sessionStorage.getItem(sessionKey(address));
      if (cached) {
        return unlockFromSignature(address, cached);
      }
    } catch {
      /* */
    }
  }

  const signature = await signMessage(VAULT_MESSAGE, { nonce: VAULT_NONCE });
  if (!signature) throw new Error('Empty signature from wallet');
  return unlockFromSignature(address, signature);
}

/** Resolve stored encryptedKey → raw base64 DEK for decrypt/share */
export async function resolveRawKeyBase64(
  stored: string,
  wallet?: WalletAccount | null
): Promise<string> {
  if (!stored) throw new Error('Missing file key');

  if (!isWrappedKey(stored)) {
    return stored;
  }

  let vault = getVaultKey();
  if (!vault && wallet) {
    vault = await ensureVaultUnlocked(wallet);
  }
  if (!vault) {
    throw new Error('Vault locked — connect & sign to unlock keys');
  }

  const raw = await unwrapFileKey(stored, vault);
  return rawKeyToBase64(raw);
}

export async function wrapRawKeyBase64(
  rawKeyB64: string,
  wallet: WalletAccount
): Promise<string> {
  const vault = await ensureVaultUnlocked(wallet);
  const raw = base64ToRawKey(rawKeyB64);
  return wrapFileKey(raw, vault);
}

export function keyEncodingOf(file: FileMetadata): KeyEncoding {
  return detectKeyEncoding(file.encryptedKey || '');
}

/**
 * Lazy migrate legacy plain keys → wallet-wrapped. Best-effort; skips on error.
 * Returns count migrated.
 */
export async function migratePlainKeys(
  wallet: WalletAccount
): Promise<{ migrated: number; failed: number }> {
  const vault = await ensureVaultUnlocked(wallet);
  const files = listAllFiles(wallet.address);
  let migrated = 0;
  let failed = 0;

  for (const f of files) {
    if (!f.encryptedKey || isWrappedKey(f.encryptedKey)) continue;
    try {
      const raw = await unwrapFileKey(f.encryptedKey, null);
      const wrapped = await wrapFileKey(raw, vault);
      const next: FileMetadata = { ...f, encryptedKey: wrapped };
      await addFile(wallet.address, next);
      migrated++;
    } catch {
      failed++;
    }
  }

  return { migrated, failed };
}

export function countKeyEncodings(files: FileMetadata[]): {
  plain: number;
  wrapped: number;
} {
  let plain = 0;
  let wrapped = 0;
  for (const f of files) {
    if (isWrappedKey(f.encryptedKey || '')) wrapped++;
    else if (f.encryptedKey) plain++;
  }
  return { plain, wrapped };
}
